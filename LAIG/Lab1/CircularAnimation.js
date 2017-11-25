/**
 * CircularAnimation
 * @constructor
 */
function CircularAnimation(scene, args) {
    Animation.call(scene, args);
    this.scene = scene;

    this.speed = args[1];
    this.radius = args[5];
    this.speedang = this.speed / this.radius;

    this.center = vec3.fromValues(args[2], args[3], args[4]);

    this.startang = args[6];
    this.rotang = args[7];

    this.ang = 0;
    this.totalang = 0;

    this.isFinished = false;

};
CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getTotalTime = function () {
    return this.rotang / this.speedang;
}

function angle(a, b) {
    let tempA = vec3.fromValues(a[0], a[1], a[2]);
    let tempB = vec3.fromValues(b[0], b[1], b[2]);

    let cosine = vec3.dot(tempA, tempB);

    if (cosine > 1.0) {
        return 0;
    } else if (cosine < -1.0) {

        return Math.PI;
    } else {

        let sign = (tempA[0] - tempB[0] < 0) ? -1 : 1;
        return Math.acos(cosine) * sign;
    }
}

CircularAnimation.prototype.getMatrix = function (time) {

    this.ang = this.speedang * time;

    if (this.ang >= this.rotang) {
        this.ang = this.rotang;
        this.isFinished = true;
    }

    let mat = mat4.create();

    mat4.translate(mat, mat, vec3.fromValues(this.center[0],this.center[1],this.center[2]));
    mat4.rotate(mat,mat,this.startang + this.ang, this.scene.axisCoords['y']);
    mat4.translate(mat, mat, vec3.fromValues(this.radius, 0, 0));
    mat4.rotate(mat,mat,Math.PI, this.scene.axisCoords['y']);
    console.log(this.rotang + " -- " + this.startang + " -- " + this.ang + " -- " + (this.startang + this.ang));

    return mat;
}
