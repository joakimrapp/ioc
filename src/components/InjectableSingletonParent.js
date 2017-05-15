const InjectableSingleton = require( './InjectableSingleton.js' );
module.exports = ( Component, log ) => class InjectableSingletonParent extends InjectableSingleton( Component ) {
	constructor( container, parent, context, basepath ) {
		super( container, parent, context, basepath );
	}
	get type() { return 'injectable parent'; }
	resolve() {
		const waiting = [];
		this.resolve = () => new Promise( ( resolve, reject ) => waiting.push( { resolve, reject } ) );
		Promise.all( this.context.dependencies.map( dependencyName => {
				const dependency = this.getDependency( dependencyName );
				return dependency ? dependency.resolve( this ) : Promise.reject( `"${dependencyName}" is not registered` );
			} ) )
			.then( resolvedDependencies => log
				.trace( 'injecting', () => this.display )
				.timer( this.required( ...resolvedDependencies ) )
				.debug( 'resolved', () => this.display ).promise )
			.catch( err => Promise.reject( `"${this.display}" -> ${err}` ) )
			.then( resolved => {
				while( waiting.length )
					process.nextTick( waiting.shift().resolve, resolved );
				this.context.resolved = resolved;
				this.resolve = () => resolved;
				return resolved;
			} );
	}
};
