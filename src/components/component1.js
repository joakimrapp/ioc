const InjectableSingleton = require( './InjectableSingleton.js' );
const InjectableSingletonParent = require( './InjectableSingletonParent.js' );
const InjectableTransient = require( './InjectableTransient.js' );
const InjectableTransientParent = require( './InjectableTransientParent.js' );
const VirtualParent = require( './VirtualParent.js' );
const Resolved = require( './Resolved.js' );

class Component




module.exports = ( container, parent, data, basepath ) => {
	let component;
	if( data.resolved !== undefined )
		return new Resolved( container, parent, data, basepath );
	else if(
}




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
