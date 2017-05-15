require( '../../../helpers/unit.js' )( ( index ) => ( {
	setup: require( '@jrapp/log-emitter' ).on( [ 'trace', 'debug' ], () => {} ),
	ioc: index()
		.register.transient.log( require( '@jrapp/log-emitter' ).log )
		.scan( '../../../assets' )
} ) )
	.it( 'should inject correctly', ( assert, index, { ioc } ) => new Promise( resolve => ioc
		.inject( ( module2 ) => {
			assert.equal( module2, 7 );
			resolve();
		} ) ) )
	.it( 'should inject not be able to inject module4', ( assert, index, { ioc } ) => new Promise( resolve => ioc
		.inject( ( module4 ) => {} )
	 	.catch( err => resolve() ) ) )
	.it( 'rename json file', ( assert, index, { ioc } ) => new Promise( resolve => ioc
		.inject( ( module5 ) => {
			assert.equal( module5, 18 );
			resolve();
		} ).catch( console.trace ) ) )
	.it( 'should register a transient', ( assert, index, { ioc } ) => new Promise( resolve => {
		require( '@jrapp/log-emitter' ).on( [ 'info' ], ( { name, meta } ) => {
			assert.equal( `${name}.${meta}`, 'module6.a test' );
			resolve();
		} );
		ioc.inject( ( module6 ) => module6( 'a test' ) );
	} ) )
.done();
