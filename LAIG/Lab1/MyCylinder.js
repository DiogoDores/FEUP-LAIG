/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, args) {
    CGFobject.call(this, scene);

    this.height = args[0];
    this.bottomRadius = args[1];
    this.topRadius = args[2];
    this.slices = args[3];
    this.stacks = args[4];
    this.s=1;
    this.t=1;
    this.initBuffers();
}
;MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var ang = Math.PI * 2 / this.slices;
    var radius = this.bottomRadius;
    var radiusStep = (this.topRadius - this.bottomRadius) / this.stacks;

    for (j = 0; j < this.stacks + 1; j++) {
        for (i = 0; i <= this.slices; i++) {
            if(j == 0)
                this.vertices.push(Math.cos(i * ang) * radius, Math.sin(i * ang) * radius, 0);
            else
                this.vertices.push(Math.cos(i * ang) * radius, Math.sin(i * ang) * radius, j/this.stacks * this.height);

            this.normals.push(Math.cos(i * ang), Math.sin(i * ang), Math.sin(i * ang));
            this.texCoords.push(i/(this.slices+1),j/(this.stacks+1));

        }
        radius += radiusStep;
    }

    for (j = 0; j < this.stacks; j++) {
        for (i = 0; i <= this.slices; i++) {
            if (i == this.slices ) {
                this.indices.push(0 + (this.slices+1) * j, 0 + (this.slices+1) * (j + 1), 0 + i + (this.slices+1) * (j + 1));
                this.indices.push(0 + (this.slices+1) * j, 0 + i + (this.slices+1) * (j + 1), 0 + i + (this.slices+1) * j);
            } else {
                this.indices.push(0 + i + (this.slices+1) * j, 1 + i + (this.slices+1) * j, 0 + i + (this.slices+1) * (j + 1));
                this.indices.push(1 + i + (this.slices+1) * j, 1 + i + (this.slices+1) * (j + 1), 0 + i + (this.slices+1) * (j + 1));
            }
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;

MyCylinder.prototype.assignTexture = function(texture){

    this.s = texture[1];
    this.t = texture[2];

}
