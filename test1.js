class A {
};

const B = require( './test2.js' )( A );

A.create = () => {
	return new B();
};

module.exports = A;
