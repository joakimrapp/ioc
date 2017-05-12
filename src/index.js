module.exports = ( packagepath ) => require( './ioc.js' )( require( './scanner.js' )( packagepath ) );
