const requirer = require( './requirer.js' );
const build = ( scanned ) => Array.prototype.concat( ...scanned.map( ( { name, relativepath, absolutepath, lifestyle, isParent, children } ) => {
	if( children )
		if( children.length ) {
			children = build( children );
			if( children.length === 0 )
				children = undefined;
		}
		else
			children = undefined;
	return relativepath ? requirer( { name, relativepath: relativepath.replace( /\\/g, '/' ), children, lifestyle, absolutepath } ) :
		children ? isParent ? { name, children } : children : [];
} ) ).sort( ( { name: name1 }, { name: name2 } ) => name1 < name2 ? -1 : 1 );
module.exports = build;
