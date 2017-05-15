const path = require( 'path' );
const log = require( '@jrapp/log-emitter' ).log( 'ioc' );
class Component {
	constructor( container, parent, context, basepath ) {
		this.context = Object.assign( { container, parent, basepath }, context, { required: context.required } );
		this.context.getDependency = this.getDependency;
		if( context.name ) {
			container.set( context.name, this );
			this.context.display = this.context.parent ? `${this.context.display}.${this.context.name}` : this.context.name;
			log.trace( 'creating component', () => `${this.display} (${this.lifestyle}, ${this.type})` );
		}
		else {
			this.context.display = 'anonymous';
		}
	}
	get name() { return this.context.name; }
	get display () { return this.context.display; }
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
module.exports = Component;
