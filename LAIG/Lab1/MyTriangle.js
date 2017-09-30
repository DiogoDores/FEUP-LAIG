/**
 * MyTriangle
 * @constructor
 */
 function MyTriangle(scene) {
 	CGFobject.call(this, scene);

 	this.minS = 0;
 	this.maxS = 1;
 	this.minT = 0;
 	this.maxT = 1;

 	this.initBuffers();
 };

 MyTriangle.prototype = Object.create(CGFobject.prototype);
 MyTriangle.prototype.constructor = MyTriangle;

 MyTriangle.prototype.initBuffers = function() {

     this.vertices = [];
     this.normals = [];
     this.indices = [];
     this.texCoords = [];

     this.vertices.push(0.5, 0, 0);
     this.vertices.push(-0.5, 0 , 0);
     this.vertices.push(0.5, 0, 1);

     this.normals.push(0, 1, 0);
     this.normals.push(0, 1, 0);
     this.normals.push(0, 1, 0);
     
     this.indices.push(0, 1, 2);

     this.texCoords = [this.minS, this.maxT, this.maxS, this.maxT, this.minS, this.minT, this.maxS, this.minT];

     this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
 }