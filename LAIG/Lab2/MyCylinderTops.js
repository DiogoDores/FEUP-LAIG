/**
 * MyCylinderTops
 * @constructor
 */
function MyCylinderTops(scene, args) {
    CGFobject.call(this, scene);

    this.cylinder = new MyCylinder(scene, args);
    this.height = args[0];
    this.topBase = null;
    this.botBase = null;
    if(args[5] == 1 && args[2] > 0)
      this.topBase = new MyCircle(scene, args[3], args[2]);
    if(args[6] == 1 && args[1] > 0)
      this.botBase = new MyCircle(scene, args[3], args[1]);
}
;MyCylinderTops.prototype = Object.create(CGFobject.prototype);
MyCylinderTops.prototype.constructor = MyCylinderTops;

MyCylinderTops.prototype.display = function() {

    this.cylinder.display();

    this.scene.pushMatrix();
    if(this.topBase != null){
      this.scene.translate(0,0,this.height);
      this.topBase.display();
    }
    this.scene.popMatrix();

    this.scene.pushMatrix();
    if(this.botBase != null){
      this.scene.rotate(Math.PI,1,0,0);
      this.botBase.display();
    }
    this.scene.popMatrix();

};

MyCylinderTops.prototype.assignTexture = function(texture){};
