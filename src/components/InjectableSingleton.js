module.exports = ( Component, log ) => class InjectableSingleton extends Component {
	get type() { return 'injectable'; }
	resolveDependencies() {
		return Promise.all( this.context.dependencies.
		 	map( dependencyName => {
				const dependency = this.getDependency( dependencyName );
				return dependency ? dependency.resolve( this ) : Promise.reject( `"${dependencyName}" is not registered` );
			} ) );
	}
	resolve() {
		const waiting = [];
		this.resolve = () => new Promise( ( resolve, reject ) => waiting.push( { resolve, reject } ) );
		return this.resolveDependencies()
			.then( resolvedDependencies => log
				.trace( 'injecting', () => this.display )
				.timer( Promise.resolve( this.required( ...resolvedDependencies ) ) )
				.debug( 'resolved', () => this.display ).promise )
			.catch( err => {
				log.error( 'resolve failed', err );
				const message = `"${this.display}" -> ${err}`;
				while( waiting.length )
					process.nextTick( waiting.shift().reject, message );
				return Promise.reject( message );
			} )
			.then( resolved => {
				while( waiting.length )
					process.nextTick( waiting.shift().resolve, resolved );
				this.context.resolved = resolved;
				this.resolve = () => resolved;
				return resolved;
			} );
	}
};
