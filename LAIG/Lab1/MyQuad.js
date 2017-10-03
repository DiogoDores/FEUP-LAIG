/**
 * MyQuad
 * @constructor
 */
function MyQuad(scene, args) {
    CGFobject.call(this, scene);

    this.x1 = args[0]; this.y1 = args[1];
    this.x2 = args[2]; this.y2 = args[3];

    /*this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;*/

    this.initBuffers();
}
;MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor = MyQuad;

MyQuad.prototype.initBuffers = function() {

    this.vertices = [];

    this.vertices.push(this.x1, this.y2, 0);
    this.vertices.push(this.x2, this.y2, 0); //Bottom-Right
    this.vertices.push(this.x1, this.y1, 0); //Top-Left
    this.vertices.push(this.x2, this.y1, 0);

    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    this.indices = [0, 1, 2, 3, 2, 1];

    this.indices.push(0, 1, 2);
    this.indices.push(3, 2, 1);

    //this.texCoords = [this.minS, this.maxT, this.maxS, this.maxT, this.minS, this.minT, this.maxS, this.minT];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
