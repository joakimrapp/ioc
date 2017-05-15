class A {
	constructor() {

	}
	b() {
		console.log( 1 );
		this.b = this.c;
	}
	c() {
		console.log( 2 );
	}
}const a = new A();
a.b();
a.b();
