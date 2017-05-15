const parseFunction = require( 'parse-function' )( { ecmaVersion: 2017 } );
return ( required ) => parseFunction.parse( required ).args;
