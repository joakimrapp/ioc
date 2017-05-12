const component = require( './component.js' );
const requirer = require( './requirer.js' );
class IoC {
	constructor( scanner ) {
		Object.assign( this, { container: new Map(), scanner, defaultCatch: ( err ) => console.log( err ) || process.exit(), jobs: [] } );
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
		return new Proxy( this, { get: ( target, name, proxy ) => ( required ) => {
			component( target.container, undefined, requirer( { name, required } ) );
			return target;
		}	} );
	}
	get set() {
		const ioc = this;
		return new Proxy( sets => ( () => ioc )( Object.keys( sets ).forEach( name => component( ioc.container, undefined, { name, resolved: sets[ name ] } ) ) ), {
			get: ( target, name, proxy ) => resolved => {
				component( ioc.container, undefined, { name, resolved } );
				return ioc;
			},
			apply: ( target, name, argumentList, proxy ) => target( ...argumentList )
		} );
	}
	inject( required ) {
		const container = this.container;
		if( this.waiting ) {
			const waiting = this.waiting;
			new Promise( ( resolve, reject ) => waiting.push( { resolve, reject } ) ).then( () =>
				component( container, undefined, requirer( { required } ) ).resolve().catch( this.defaultCatch ) ).catch( this.defaultCatch );
		}
		else if( this.jobs.length ) {
			const waiting = this.waiting = [];
			Promise.all( this.jobs ).then( () => {
				component( container, undefined, requirer( { required } ) ).resolve().catch( this.defaultCatch );
				while( waiting.length )
					waiting.pop().resolve();
				this.waiting = undefined;
			} ).catch( this.defaultCatch );
			this.jobs = [];
		}
		else
			component( container, undefined, requirer( { required } ) ).resolve().catch( this.defaultCatch );
		return this;
	}
	catch( onRejected ) {
		this.defaultCatch = onRejected;
	}
};
module.exports = ( scanner ) => new IoC( scanner );
