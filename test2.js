module.exports = ( A ) => class B extends A {
	constructor() {
		super();
		console.log( A.create );
	}
};
