const path = require( 'path' );
const log = require( '@jrapp/log-emitter' ).log( 'ioc' );
class Component {
	constructor( container, parent, context, basepath ) {
		this.context = Object.assign( { container, parent, basepath }, context );
		this.context.getDependency = this.getDependency;
		if( context.name ) {
			container.set( context.name, this );
			log.trace( 'creating component', () => `${this.display} (${this.lifestyle}, ${this.type})` );
		}
		else {
			this.display = 'anonymous';
		}
	}
	get display () { return this.context.parent ? `${this.context.display}.${this.context.name}` : this.context.name; }
	get lifestyle() { return 'singleton'; }
	get required() {
		if( this.context.required !== undefined )
			return this.context.required;
		else if( this.context.relativepath ) {
			this.context.required = require( path.resolve( this.context.basepath, this.context.relativepath ) );
			return this.context.required;
		}
		else
			return undefined;
	}
	resolveDependencies() {
		const { container, parent, privateContainer } = this.context;


	}
	getDependency( name ) {
		const { container, parent } = this.context;
		return container.get( name ) || ( parent ? parent.getDependency( name ) : undefined );
	}
};
const InjectableSingleton = require( './InjectableSingleton.js' )( Component, log );
const InjectableSingletonParent = require( './InjectableSingletonParent.js' )( Component, log );
const InjectableTransient = require( './InjectableTransient.js' )( Component, log );
const InjectableTransientParent = require( './InjectableTransientParent.js' )( Component, log );
const VirtualParent = require( './VirtualParent.js' )( Component, log );
const Resolved = require( './Resolved.js' )( Component, log );
Component.create = ( container, parent, context, basepath ) => {
	if( context.resolved !== undefined )
		return new Resolved( container, parent, context, basepath );
	else if( context.children )
		if( context.dependencies )
			if( context.lifestyle === 'transient' )
				return new InjectableTransientParent( container, parent, context, basepath );
			else
				return new InjectableSingletonParent( container, parent, context, basepath );
		else
			return new VirtualParent( container, parent, context, basepath );
	else if( context.dependencies )
		if( context.lifestyle === 'transient' )
			return new InjectableTransient( container, parent, context, basepath );
		else
			return new InjectableSingleton( container, parent, context, basepath );
	else
		return new Resolved( container, parent, context, basepath );
};



// { name, required, relativepath, dependencies, children, resolved, lifestyle }
/*
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
*/
