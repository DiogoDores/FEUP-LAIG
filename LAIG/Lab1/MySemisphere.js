/**
 * MySemisphere
 * @constructor
 */
function MySemisphere(scene, args) {
    CGFobject.call(this, scene);

    this.radius = args[0]
    this.slices = args[1];
    this.stacks = args[2];

    this.initBuffers();
}
;MySemisphere.prototype = Object.create(CGFobject.prototype);
MySemisphere.prototype.constructor = MySemisphere;

MySemisphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var ang = Math.PI * 2 / this.slices;
    var angEsf = Math.PI / 2 / this.stacks;

    for (j = 0; j < this.stacks + 1; j++) {
        for (i = 0; i < this.slices; i++) {

            this.vertices.push(Math.cos(i * ang) * Math.cos(angEsf * j) * this.radius, Math.sin(i * ang) * Math.cos(angEsf * j) * this.radius, Math.sin(angEsf * j) * this.radius);
            this.normals.push(Math.cos(i * ang) * Math.cos(angEsf * j), Math.sin(i * ang) * Math.cos(angEsf * j), Math.sin(angEsf * j));
            this.texCoords.push((Math.cos(i * ang) * Math.cos(angEsf * j) + 1)/2, (Math.sin(i * ang) * Math.cos(angEsf * j) + 1)/2 );
        }
    }

    for (j = 0; j < this.stacks; j++) {
        for (i = 0; i < this.slices; i++) {
            if (i == this.slices - 1) {
                this.indices.push(0 + this.slices * j, 0 + this.slices * (j + 1), 0 + i + this.slices * (j + 1));
                this.indices.push(0 + this.slices * j, 0 + i + this.slices * (j + 1), 0 + i + this.slices * j);
            } else {
                this.indices.push(0 + i + this.slices * j, 1 + i + this.slices * j, 0 + i + this.slices * (j + 1));
                this.indices.push(1 + i + this.slices * j, 1 + i + this.slices * (j + 1), 0 + i + this.slices * (j + 1));
            }
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
