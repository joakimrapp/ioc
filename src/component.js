const path = require( 'path' );
const logEmitter = require( '@jrapp/log-emitter' );
const log = logEmitter.log( 'ioc' );
class Component {
	constructor( container, parent, { name, required, relativepath, dependencies, children, resolved, lifestyle }, basepath ) {
		Object.assign( this, { parent, name, dependencies, required, resolved, lifestyle, container, containers: [],
			waiting: [], displayName: parent ? `${parent.name || 'anonymous' }.${name || 'anonymous'}` : name || 'anonymous' } );
		if( name )
			container.set( name, this );
		if( resolved !== undefined )
			Object.assign( this, { componentType: 'resolved', resolve: this.resolveResolved } );
		else {
			if( ( required === undefined ) && ( relativepath ) )
				this.required = require( path.resolve( basepath, relativepath ) );
			if( children ) {
				this.containers.push( children.reduce( ( container, child ) =>
					( new Component( container, this, child, basepath ) ).container, new Map() ) );
				Object.assign( this, dependencies ? { componentType: 'injectable with children', resolve: this.inject } :
			 		{ componentType: 'instance with children', dependencies: children.map( child => child.name ), resolve: this.inject } );
			}
			else if( dependencies )
				Object.assign( this, { componentType: 'injectable', resolve: this.inject } );
			else
				Object.assign( this, { componentType: 'instance', resolved: this.required, resolve: this.resolveResolved } );
		}
		if( name )
			log.trace( `created component (${this.componentType})`, this.displayName );
	}
	getDependencyResolve( name ) {
		return this.container.has( name ) ? this.container.get( name ).resolve() :
			this.parent ? this.parent.getDependencyResolve( name ) : undefined;
	}
	findDependencyResolve( parentName, name, containers = [] ) {
		return name === 'log' ? logEmitter.log( parentName ) : ( foundContainer => foundContainer ?
			foundContainer.get( name ).resolve() :
			this.getDependencyResolve( name ) || Promise.reject( `"${name}" is not registered` ) )(
				[ ...containers, ...this.containers ].find( container => container.has( name ) ) );
	}
	inject( containers ) {
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
	}
	resolveResolved( containers ) {
		return this.resolved;
	}
};
module.exports = ( ...args ) => new Component( ...args );
