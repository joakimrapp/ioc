module.exports = ( Component ) => class InjectableSingleton {
	constructor( container, parent, context, basepath ) {
		super( container, parent, context, basepath );




	}
	get lifestyle() { return 'transient'; }
	get type() { return 'injectable parent'; }
	resolveDependencies() {

	}
	resolve() {

	}
};
