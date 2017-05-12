module.exports = ( { name, relativepath, children, lifestyle, absolutepath, required } ) => {
	if( required === undefined && absolutepath )
		required = require( absolutepath );
	if( required === undefined )
		throw new Error( `cannot register ${name}. When requiering ${absolutepath} it returns undefined` );
	return required instanceof Function ?
		Object.defineProperty( { name, relativepath, children, lifestyle, dependencies: require( 'parse-function' )( required ).args }, 'required', { value: required } ) :
		Object.defineProperty( { name, relativepath, children }, 'resolved', { value: required } );
};
