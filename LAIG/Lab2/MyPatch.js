/**
 * MyPatch
 * @constructor
 */
function MyPatch(scene, args, controlVer) {
    CGFobject.call(this, scene);

    this.scene = scene;
    this.u = args[0];
    this.v = args[1];

    this.makeSurface(controlVer.length - 1, controlVer[0].length - 1, controlVer);

}
;MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.display = function() {

    this.nurb.display();

};

MyPatch.prototype.assignTexture = function(texture){};

MyPatch.prototype.getKnotsVector = function(degree) {

	var v = new Array();
	for (var i=0; i<=degree; i++) {
		v.push(0);
	}
	for (var i=0; i<=degree; i++) {
		v.push(1);
	}
  return v;
}


MyPatch.prototype.makeSurface = function (degree1, degree2, controlvertexes) {

	var knots1 = this.getKnotsVector(degree1);
	var knots2 = this.getKnotsVector(degree2);

	var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlvertexes);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.nurb = new CGFnurbsObject(this.scene, getSurfacePoint, this.u, this.v );

}
