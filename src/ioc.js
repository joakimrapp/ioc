const component = require( './component.js' );
const dependencies = require( './dependencies.js' );
const requirer = require( './requirer.js' );
const injector = require( './injector.js' );
class IoC {
	constructor( scanner ) {
		Object.assign( this, { container: new Map(), scanner, _defaultCatch: ( err ) => console.trace( err ) || process.exit(), jobs: [] } );
	}
	parse( ...args ) { return dependencies( ...args ); }
	get defaultCatch() {
		const ioc = this;
		return ( err ) => ioc._defaultCatch( err );
	}
	scan( relativepath = '.' ) {
		const callerpath = require( 'stack-trace' ).get()[ 1 ].getFileName();
		const basepath = require( 'path' ).dirname( callerpath );
		const container = this.container;
		this.jobs.push( this.scanner( callerpath, relativepath )
			.then( items => items.forEach( item => component( container, undefined, item, basepath ) ) ) );
		return this;
	}
	get register() {
		return new Proxy( this, { get: ( target, name, proxy ) =>
			name === 'transient' ? new Proxy( target, { get: ( target, name, proxy ) => ( required ) => (
				component( target.container, undefined, requirer( { name, required, lifestyle: 'transient' } ) ), target ) } ) :
			( required ) => ( component( target.container, undefined, requirer( { name, required } ) ), target ) } );
	}
	get set() {
		return new Proxy( Object.assign( () => {}, { ioc: this } ), {
			get: ( { ioc }, name, proxy ) => ( ...args ) =>
				( component( ioc.container, undefined, { name, resolved: args.length ? args[ 0 ] : require( './index.js' ) } ), ioc ),
			apply: ( { ioc }, name, [ sets ] ) =>
				( Object.keys( sets ).forEach( name => ioc.set[ name ]( sets[ name ] ) ), ioc )
		} );
	}
	promise( required ) {
		const { container, jobs } = this;
		if( jobs.length ) {
			const waiting = this.waiting = [];
			this.jobs = [];
			process.nextTick( () => Promise.all( jobs )
		 		.then( () => {
					while( waiting.length )
						waiting.pop().resolve();
					this.waiting = undefined;
				} )
				.catch( this.defaultCatch ) );
		}
		if( this.waiting ) {
			const waiting = this.waiting;
			return new Promise( ( resolve, reject ) => waiting.push( { resolve, reject } ) )
				.then( () => injector( container, required ) );
		}
		else
			return injector( container, required );
	}
	inject( required ) { return ( this.promise( required ).catch( this.defaultCatch ), this ); }
	catch( onRejected ) { return ( ( this._defaultCatch = onRejected ), this ); }
};
module.exports = ( scanner ) => new IoC( scanner );
