/**
 * MyQuad
 * @constructor
 */
function MyQuad(scene, args) {
    CGFobject.call(this, scene);

    this.x1 = args[0]; this.y1 = args[1];
    this.x2 = args[2]; this.y2 = args[3];

    this.width = this.x2 - this.x1;
    this.height = this.y1 - this.y2;
    this.s = 1;
    this.t = 1;
    this.initBuffers();
}
;MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor = MyQuad;

MyQuad.prototype.initBuffers = function() {

    this.indices = [];
    this.vertices = [];
    this.texCoords = [
      0, this.height/this.t,
      this.width/this.s, this.height/this.t,
      0, 0,
      this.width/this.s,0];

    this.vertices.push(this.x1, this.y2, 0);
    this.vertices.push(this.x2, this.y2, 0); //Bottom-Right
    this.vertices.push(this.x1, this.y1, 0); //Top-Left
    this.vertices.push(this.x2, this.y1, 0);

    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    this.indices.push(0, 1, 2);
    this.indices.push(3, 2, 1);

    this.indices.push(1, 2, 3);
    this.indices.push(2, 1, 0);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;

MyQuad.prototype.assignTexture = function(texture){

    if(texture != null){
      this.s = texture[1];
      this.t = texture[2];
      this.initBuffers();
    }

};
