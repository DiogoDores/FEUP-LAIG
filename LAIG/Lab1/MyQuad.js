/**
 * MyQuad
 * @constructor
 */
function MyQuad(scene, args) {
    CGFobject.call(this, scene);

    this.x1 = args[0]; this.y1 = args[1];
    this.x2 = args[2]; this.y2 = args[3];

    this.initBuffers();
}
;MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor = MyQuad;

MyQuad.prototype.initBuffers = function() {

    this.indices = [];
    this.vertices = [];

    this.vertices.push(this.x1, this.y2, 0);
    this.vertices.push(this.x2, this.y2, 0); //Bottom-Right
    this.vertices.push(this.x1, this.y1, 0); //Top-Left
    this.vertices.push(this.x2, this.y1, 0);

    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    this.indices.push(0, 1, 2);
    this.indices.push(3, 2, 1);

    this.texCoords =
    [0, 4,//this.t,
     3, 4,//this.s, this.t,
     0, 0,
     3, 0];//this.s, 0];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;

MyQuad.prototype.assignTexture = function(texture){

    this.s = texture[1];
    this.t = texture[2];

}
