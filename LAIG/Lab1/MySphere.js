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

MySphere.prototype.display = function() {

    this.semi.display();

    this.scene.rotate(Math.PI,0,0,1);
    this.scene.rotate(Math.PI,1,0,0);
    this.semi.display();

};

MySphere.prototype.assignTexture = function(texture){};
