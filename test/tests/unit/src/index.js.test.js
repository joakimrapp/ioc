require( '../../../helpers/unit.js' )( ( index ) => ( {
	setup: require( '@jrapp/log-emitter' ).on( [ 'debug', 'trace' ], console.log ),
	ioc: index()
} ) )
	.it( '', ( assert, index, { ioc } ) => new Promise( resolve =>
		ioc.scan( '../../../assets' ).
	 		inject( ( module2 ) => assert( module2, 3 ) ) ) )
.done();
