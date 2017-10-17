/**
 * MyTriangle
 * @constructor
 */
 function MyTriangle(scene, args) {
 	CGFobject.call(this, scene);


    this.x1 = args[0]; this.y1 = args[1]; this.z1 = args[2];
    this.x2 = args[3]; this.y2 = args[4]; this.z2 = args[5];
    this.x3 = args[6]; this.y3 = args[7]; this.z3 = args[8];
 	this.initBuffers();
 };

 MyTriangle.prototype = Object.create(CGFobject.prototype);
 MyTriangle.prototype.constructor = MyTriangle;

 MyTriangle.prototype.initBuffers = function() {

    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

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

    this.texCoords = [
    mid/this.s, (1 - height)/this.t,
		0, 1/this.t,
		c/this.s, 1/this.t
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
 }

 MyTriangle.prototype.assignTexture = function(texture){

   if(texture != null){
     this.s = texture[1];
     this.t = texture[2];
   }

   var a = Math.sqrt(	Math.pow((this.x1 - this.x3),2) +
    					Math.pow((this.y1 - this.y3),2) +
    					Math.pow((this.z1 - this.z3),2));

   var b = Math.sqrt(	Math.pow((this.x2 - this.x1),2) +
    					Math.pow((this.y2 - this.y1),2) +
    					Math.pow((this.z2 - this.z1),2));

    var c = Math.sqrt(	Math.pow((this.x3 - this.x2),2) +
    					Math.pow((this.y3 - this.y2),2) +
    					Math.pow((this.z3 - this.z2),2));

	var beta   = Math.acos(((a * a) - (b * b) + (c * c))/(2 * a * c));

	var height = a * Math.sin(beta);
  var mid = c - a * Math.cos(beta);

    this.texCoords = [
    mid/this.s, (1 - height)/this.t,
		0, 1/this.t,
		c/this.s, 1/this.t
    ];

	this.updateTexCoordsGLBuffers();

 }
