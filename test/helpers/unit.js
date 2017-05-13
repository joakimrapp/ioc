const path = require( 'path' );
const stacktrace = require( 'stack-trace' );
const assert = require( 'assert' );
module.exports = ( setup = () => {} ) => {
	const displaypath = stacktrace.get()[ 1 ].getFileName()
		.replace( path.resolve( __dirname, '../tests/unit' ), '.' ).replace( '.test.js', '' );
	const unit = require( path.resolve( __dirname, `../../`, displaypath ) );
	let data;
	const tests = [];
	const ptr = [];
	before( () => Promise.resolve( setup( unit ) )
		.then( ( result ) => ( data = result ) )
		.then( () => {} ) );
	const recursive = ( tests ) => tests.forEach( ( { title, tests, test, only, skip } ) => tests ?
		only ? describe.only( title, () => recursive( tests ) ) :
		skip ? describe.skip( title, () => recursive( tests ) ) :
		describe( title, () => recursive( tests ) ) :
		only ? it.only( title, () => Promise.resolve( test( assert, unit, data ) ) ) :
		skip ? it.skip( title, () => Promise.resolve( test( assert, unit, data ) ) ) :
		it( title, () => Promise.resolve( test( assert, unit, data ) ) ) );
	const actions = {
		describe: ( title, extra = {} ) => {
			const item = Object.assign( { title, tests: [] }, extra );
			ptr.push( tests );
			tests.push( item );
			return item.tests;
		},
		it: ( title, test, extra = {} ) => {
			tests.push( Object.assign( { title, test }, extra ) );
			return tests;
		}
	};
	const pub = ( tests ) => ( {
		describe: Object.assign( ( title ) => pub( actions.describe( title ) ), {
			skip: ( title ) => pub( actions.describe( title, { skip: true } ) ),
			only: ( title ) => pub( actions.describe( title, { only: true } ) )
		} ),
		it: Object.assign( ( title, test ) => pub( actions.it( title, test ) ), {
			skip: ( title, test ) => pub( actions.it( title, test, { skip: true } ) ),
			only: ( title, test ) => pub( actions.it( title, test, { only: true } ) )
		} ),
		done: () => ptr.length ? pub( ptr.pop() ) : describe( `UNIT: ${displaypath}`, () => recursive( tests ) )
	} );
	return pub( tests );
};
