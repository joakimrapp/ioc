const log = require( '@jrapp/log-emitter' ).log( 'ioc' );
const dependencies = require( './dependencies.js' );
module.exports = ( container, fn ) => Promise.all( dependencies( fn ).args.map( dependencyName => container.has( dependencyName ) ?
	container.get( dependencyName ).resolve( { name: 'injected' } ) : Promise.reject( `"${dependencyName}" is not registered` ) ) )
		.then( resolvedDependencies => log
			.trace( 'injecting', () => this.display )
			.timer( Promise.resolve( fn( ...resolvedDependencies ) ) )
			.trace( 'resolved', () => this.display ).promise )
		.catch( err => Promise.reject( `"${this.display}" -> ${err}` ) );
