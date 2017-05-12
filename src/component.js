const path = require( 'path' );
const logEmitter = require( '../../log-emitter' );
const log = logEmitter( 'ioc' );
class Component {
	constructor( container, parent, { name, required, relativepath, dependencies, children, resolved, lifestyle }, basepath ) {
		Object.assign( this, { parent, name, dependencies, required, resolved, lifestyle, container, containers: [],
			waiting: [], displayName: parent ? `${parent.name || 'anonymous' }.${name || 'anonymous'}` : name || 'anonymous' } );
		if( name )
			container.set( name, this );
		let componentType;
		if( resolved !== undefined ) {
			componentType = 'resolved';
			this.resolve = this.resolveResolved;
		}
		else {
			if( ( required === undefined ) && ( relativepath ) )
				this.required = require( path.resolve( basepath, relativepath ) );
			if( children ) {
				this.containers.push( children.reduce( ( container, child ) =>
					( new Component( container, this, child, basepath ) ).container, new Map() ) );
				if( dependencies )
					componentType = 'injectable with children';
				else {
					componentType = 'instance with children';
					this.dependencies = children.map( child => child.name );
				}
				this.resolve = this.inject;
			}
			else if( dependencies ) {
				componentType = 'injectable';
				this.resolve = this.inject;
			}
			else {
				componentType = 'instance';
				this.resolved = this.required;
				this.resolve = this.resolveResolved;
			}
		}
		if( name )
			log.trace( `created component (${componentType})`, this.displayName );
	}
	getDependencyResolve( name ) {
		return this.container.has( name ) ? this.container.get( name ).resolve() :
			this.parent ? this.parent.getDependencyResolve( name ) : undefined;
	}
	findDependencyResolve( parentName, name, containers = [] ) {
		return name === 'log' ? logEmitter( parentName ) : ( foundContainer => foundContainer ?
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
