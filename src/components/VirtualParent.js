module.exports = ( Component, log ) => class VirtualParent extends require( './InjectableSingletonParent.js' )( Component, log ) {
	get type() { return 'virtual parent'; }
	getDependency( dependencyName ) { return this.context.privateContainer.get( dependencyName ) || super.getDependency( dependencyName ); }
	resolve() {
		const context = this.context;
		const waiting = [];
		this.resolve = () => new Promise( ( resolve, reject ) => waiting.push( { resolve, reject } ) );
		context.dependencies = context.children.map( child => child.name );
		return this.resolveDependencies()
			.then( resolvedDependencies => resolvedDependencies.reduce( ( resolved, resolvedDependency, index ) =>
				Object.assign( resolved, { [ context.dependencies[ index ] ]: resolvedDependency } ), {} ) )
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
