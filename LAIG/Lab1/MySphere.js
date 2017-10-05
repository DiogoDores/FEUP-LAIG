/**
 * MySphere
 * @constructor
 */
function MySphere(scene, args) {
    CGFobject.call(this, scene);

    this.semi = new MySemisphere(scene, args);

}
;MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

<<<<<<< HEAD
MySphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var ang = Math.PI * 2 / this.slices;
    var angEsf = Math.PI / this.stacks;

    for (j = parseInt(-this.stacks/2 -0.5) ; j < this.stacks/2 + 1; j++) {
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

MySphere.prototype.assignTexture = function(texture){

    this.s = texture[1];
    this.t = texture[2];

}
=======
MySphere.prototype.display = function() {

    this.semi.display();

    this.scene.rotate(Math.PI,1,0,0);
    this.semi.display();

};

function MyUnitCubeQuad(scene) {
	CGFobject.call(this,scene);

    this.quad = new MyQuad(this.scene);

};
>>>>>>> 5b3b5fc828a0eeb958cfc451b21fde809b9f649f
