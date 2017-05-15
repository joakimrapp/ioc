const parseFunction = require( 'parse-function' )( { ecmaVersion: 2017 } );
module.exports = ( required ) => parseFunction.parse( required ).args;
