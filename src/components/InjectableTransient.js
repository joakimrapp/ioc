module.exports = ( Component, log ) => class InjectableTransient extends Component {
	get type() { return 'injectable'; }
	resolveDependencies( temporaryContainer ) {
		return Promise.all( this.context.dependencies.
		 	map( dependencyName => {
				const dependency = this.getDependency( dependencyName );
				if( dependency )
					return dependency.resolve( this );
				else if( temporaryContainer.hasOwnProperty( dependencyName ) )
					return temporaryContainer[ dependencyName ];
				else
					return Promise.reject( `"${dependencyName}" is not registered` );
			} ) );
	}
	resolve( { name: moduleName } = {} ) {
		return this.resolveDependencies( { moduleName } )
			.then( resolvedDependencies => log
				.trace( 'injecting', () => this.display )
				.timer( Promise.resolve( this.required( ...resolvedDependencies ) ) )
				.debug( 'resolved', () => `${this.display} for ${moduleName}` ).promise )
			.catch( err => {
				log.error( 'resolve failed', err );
				return Promise.reject( `"${this.display}" -> ${err}` );
			} );
	}
};
