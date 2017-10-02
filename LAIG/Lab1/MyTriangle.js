/**
 * MyTriangle
 * @constructor
 */
 function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
 	CGFobject.call(this, scene);


    this.x1 = x1; this.y1 = y1; this.z1 = z1;
    this.x2 = x2; this.y2 = y2; this.z2 = z2;
    this.x3 = x3; this.y3 = y3; this.z3 = z3;
 	this.initBuffers();
 };

 MyTriangle.prototype = Object.create(CGFobject.prototype);
 MyTriangle.prototype.constructor = MyTriangle;

 MyTriangle.prototype.initBuffers = function() {

    this.vertices = [];
    this.normals = [];
    this.indices = [];

    this.vertices.push(this.x1, this.y1, this.z1);
    this.vertices.push(this.x2, this.y2, this.z2);
    this.vertices.push(this.x3, this.y3, this.z3);

    var vecx = (this.y2 - this.y1) * (this.z3 - this.z1) - (this.z2 - this.z1) * (this.y3 - this.y1);
    var vecy = (this.x2 - this.x1) * (this.z3 - this.z1) - (this.z2 - this.z1) * (this.x3 - this.x1);
    var vecz = (this.x2 - this.x1) * (this.y3 - this.y1) - (this.y2 - this.y1) * (this.x3 - this.x1);
    this.normals.push(vecx, vecy, vecz);
    this.normals.push(vecx, vecy, vecz);
    this.normals.push(vecx, vecy, vecz);
     
    this.indices.push(0, 1, 2);
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
 }