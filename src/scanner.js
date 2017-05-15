const path = require( 'path' );
const { fs } = require( '@jrapp/callbacks-to-promises' );
const log = require( '@jrapp/log-emitter' ).log( 'ioc' );
const config = require( './scanner.json' );
const recursiveScan = ( callerpath, relativepath, absolutepath = path.resolve( path.dirname( callerpath ), relativepath ) ) =>
	( callerpath === absolutepath ) ? Promise.resolve( [] ) : fs.stat( absolutepath ).then( stats => {
		const extname = path.extname( relativepath );
		const basename = path.basename( relativepath, extname );
		if( stats.isDirectory() )
			return config.ignore[ extname ] ? [] : fs.readdir( absolutepath )
		    .then( filenames => Promise.all( filenames.map( filename => recursiveScan( callerpath, `./${path.join( relativepath, filename )}` ) ) ) )
		    .then( children => Array.prototype.concat( ...children ) )
		    .then( children => children.filter( ( child ) => {
		      const parent = child.isParent ? undefined : children.find( ( { name, isParent } ) => isParent && ( name === child.name ) );
		      if( parent ) {
						if( child.relativepath ) {
							if( child.json )
			          child.name = 'json';
			        parent.children.push( child );
						}
						else
							parent.children = parent.children.concat( child.children );
		        return false;
		      }
		      else
		        return true;
		    } ) )
		    .then( children => [ { name: basename, isParent: config.parent[ extname ], children } ] );
		else {
			const lifestyle = path.extname( basename );
			if( config.ignore[ lifestyle ] )
				return [];
			else if( config.jsonfile[ extname ] )
				return [ { name: path.basename( basename, lifestyle ), relativepath, absolutepath, json: true } ];
			else if( config.codefile[ extname ] )
				return [ { name: path.basename( basename, lifestyle ), relativepath, lifestyle: config.lifestyle[ lifestyle ], isParent: true, children: [], absolutepath } ];
			else
				return [];
		}
	} );
const count = ( arr ) => arr.reduce( ( total, { children = [] } ) => total + count( children ), arr.length );
const scan = ( callerpath, relativepath, absolutepath = path.resolve( path.dirname( callerpath ), relativepath ) ) => log
	.debug( 'start scanning', absolutepath ).timer(
		recursiveScan( callerpath, relativepath, absolutepath ).then( require( './builder.js' ) ) )
	.debug( 'scan finished', ( result ) => `found ${count( result )} components` ).promise;
module.exports = ( packagepath ) => {
	if( packagepath ) {
		const scanspath = path.resolve( path.dirname( packagepath ), `scans.${require( packagepath ).version}.json` );
		const scans = fs.existsSync( scanspath ) ? require( scanspath ) : {};
		return ( callerpath, relativepath ) => Promise.resolve( scans[ relativepath ] || scan( callerpath, relativepath )
	 		.then( items => {
				scans[ relativepath ] = items;
				fs.writeFileSync( scanspath, JSON.stringify( scans, undefined, '  ' ), 'utf-8' );
				return items;
			} ) );
	}
	else
		return scan;
};
