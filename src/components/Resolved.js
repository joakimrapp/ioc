module.exports = ( Component ) => class Resolved extends Component {
	constructor( container, parent, context, basepath ) {
		super( container, parent, context, basepath );
		if( this.context.resolved === undefined )
			this.context.resolved = this.required;
	}
	get type() { return 'resolved'; }
	resolve() { return this.context.resolved; }
};
