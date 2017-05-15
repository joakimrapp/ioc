const logEmitter = require( '@jrapp/log-emitter' );
const getContainers = ( container, containers, parent ) => {
	const result = containers.concat( container );
	while( parent ) {
		result.push( parent.container );
		parent = parent.parent;
	}
	return result;
};
const resolveDependency = ( componentName, dependencyName, containers ) => {
	let container = containers.find( container => container.has( dependencyName ) );
	if( container )
		return container.get( componentName ).resolve();
	else if( dependencyName === 'log' )
		return logEmitter.log( componentName );
	else
		return Promise.reject( `"${dependencyName}" is not registered` );
};
const resolveDependencies = ( name, dependencies, containers ) =>
	Promise.all( dependencies.map( dependencyName => resolveDependency( name, dependencyName, containers ) ) );
const inject = () => {

};
const resolveParent = () => {

};
const resolveTransient = () => {

};
const resolveSingleton = () => {

};

return ( {}, containers ) => {

	const component = this;
	component.resolve = () => new Promise( ( resolve, reject ) => component.waiting.push( { resolve, reject } ) );
	return Promise.all( component.dependencies.map( name => component.findDependencyResolve( component.name, name, containers ) ) )
		.then( component.required ? resolvedDependencies => log.startTimer( component ) ||
			component.required( ...resolvedDependencies ) :
			resolvedChildren => component.dependencies.reduce( ( required, name, index ) => {
				required[ name ] = resolvedChildren[ index ];
				return required;
			}, {} ) )
		.catch( err => Promise.reject( `"${component.name}" -> ${err}` ) )
		.then( resolved => {
			if( component.required )
				log.timer( component ).trace( `resolved component`, component.displayName );
			while( component.waiting.length )
				process.nextTick( component.waiting.shift().resolve, resolved );
			return resolved;
		} )
		.then( resolved => {
			component.resolve = component.resolveResolved;
			return ( component.resolved = resolved );
		} );


};
