/**
 * MyCircle
 * @constructor
 */
function MyCircle(scene, slices, radius) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.radius = radius;
    this.initBuffers();
}
;MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var ang = Math.PI * 2 / this.slices;

    this.vertices.push(0, 0, 0);
    this.normals.push(0, 0, 1);
    this.texCoords.push(0.5, 0.5);

    for (i = 0; i < this.slices; i++) {
        this.vertices.push(Math.cos(i * ang) * this.radius, Math.sin(i * ang) * this.radius, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5 + Math.cos(i*ang)/2, 0.5 - Math.sin(i*ang)/2);

    }

    for (i = 0; i < this.slices-1; i++) {

            this.indices.push(0, i+1, i+2);

    }
    this.indices.push(0, this.slices, 1);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
