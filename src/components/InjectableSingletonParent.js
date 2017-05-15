module.exports = ( Component, log ) => class InjectableSingletonParent extends require( './InjectableSingleton.js' )( Component, log ) {
	constructor( container, parent, context, basepath ) {
		super( container, parent, context, basepath );
		this.context.privateContainer = new Map();
		context.children.forEach( child => Component.create( this.context.privateContainer, this, child, basepath ) );
	}
	get type() { return 'injectable parent'; }
	getDependency( dependencyName ) { return this.context.privateContainer.get( dependencyName ) || super.getDependency( dependencyName ); }
};
