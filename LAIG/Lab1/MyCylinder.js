/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, slices, stacks, bothSides) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.stacks = stacks;
    this.bothSides = bothSides;

    this.initBuffers();
}
;MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

    var internalAngle = (Math.PI * 2) / this.slices;
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var index = 0;
    //For handling the indices definition
    var angle = 0;
    //Stores the current angle for vertices and normals handling

    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {

            this.vertices.push(Math.cos(angle), Math.sin(angle), j * (1 / this.stacks));
            this.vertices.push(Math.cos(angle), Math.sin(angle), (j + 1) * (1 / this.stacks));
            this.normals.push(Math.cos(angle), Math.sin(angle), 0);
            this.normals.push(Math.cos(angle), Math.sin(angle), 0);

            angle += internalAngle;

            this.vertices.push(Math.cos(angle), Math.sin(angle), j * (1 / this.stacks));
            this.vertices.push(Math.cos(angle), Math.sin(angle), (j + 1) * (1 / this.stacks));
            this.normals.push(Math.cos(angle), Math.sin(angle), 0);
            this.normals.push(Math.cos(angle), Math.sin(angle), 0);

            this.indices.push(index + 2, index + 1, index);
            this.indices.push(index + 1, index + 2, index + 3);

            if (this.bothSides) {
                this.indices.push(index, index + 1, index + 2);
                this.indices.push(index + 3, index + 2, index + 1);
            }

            index += 4;

            this.texCoords.push(i / this.slices, j / this.stacks);
            this.texCoords.push(i / this.slices, (j + 1) / this.stacks);
            this.texCoords.push((i + 1) / this.slices, j / this.stacks);
            this.texCoords.push((i + 1) / this.slices, (j + 1) / this.stacks);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
