/**
 * MyQuad
 * @constructor
 */
function MyQuad(scene, minS=0, maxS=1, minT=0, maxT=1) {
    CGFobject.call(this, scene);

    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;

    this.initBuffers();
}
;MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor = MyQuad;

MyQuad.prototype.initBuffers = function() {
    this.vertices = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];

    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    this.indices = [0, 1, 2, 3, 2, 1];

    this.indices.push(0, 1, 2);
    this.indices.push(3, 2, 1);

    this.texCoords = [this.minS, this.maxT, this.maxS, this.maxT, this.minS, this.minT, this.maxS, this.minT];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
