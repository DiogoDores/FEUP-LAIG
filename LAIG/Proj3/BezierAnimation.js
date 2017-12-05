/**
 * BezierAnimation
 * @constructor
 */
function BezierAnimation(scene, args) {
    Animation.call(scene, args);
    this.scene = scene;
    this.args = args;

    this.speed = this.args[1];
    var tempControlPoints = this.args[2];
    this.controlPoints = [];

    for (let i = 0; i < tempControlPoints.length; i++) {
        this.controlPoints.push(vec3.fromValues(tempControlPoints[i][0], tempControlPoints[i][1], tempControlPoints[i][2]));
    }

    this.p1 = this.controlPoints[0];
    this.p2 = this.controlPoints[1];
    this.p3 = this.controlPoints[2];
    this.p4 = this.controlPoints[3];

    this.l2 = vec3.create();
    vec3.add(this.l2, this.p1, this.p2);
    vec3.scale(this.l2, this.l2, 0.5);

    this.h = vec3.create();
    vec3.add(this.h, this.p2, this.p3);
    vec3.scale(this.h, this.h, 0.5);

    this.l3 = vec3.create();
    vec3.add(this.l3, this.p1, this.h);
    vec3.scale(this.l3, this.l3, 0.5);

    this.r3 = vec3.create();
    vec3.add(this.r3, this.p3, this.p4);
    vec3.scale(this.r3, this.r3, 0.5);

    this.r2 = vec3.create();
    vec3.add(this.r2, this.h, this.r3);
    vec3.scale(this.r2, this.r2, 0.5);

    this.totalDistance =
        this.calcDistance(this.p1, this.l2) +
        this.calcDistance(this.l2, this.l3) +
        this.calcDistance(this.l3, this.r2) +
        this.calcDistance(this.r2, this.r3) +
        this.calcDistance(this.r3, this.p4);

    this.totalTime = this.totalDistance / this.speed;
};

BezierAnimation.prototype = Object.create(Animation.prototype);
BezierAnimation.prototype.constructor = BezierAnimation;

BezierAnimation.prototype.calcDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2)+
                     Math.pow(p2[1] - p1[1], 2)+
                     Math.pow(p2[2] - p1[2], 2));
}

BezierAnimation.prototype.getTotalTime = function () {
    return this.totalTime;
}

BezierAnimation.prototype.getMatrix = function (time) {

    time = time / this.totalTime;

    let mat = mat4.create();
    mat4.identity(mat);

    if (time > 1)
      time = 1;

    var blend_1 = Math.pow(1 - time, 3);
    var blend_2 = 3 * time * (Math.pow(1 - time, 2));
    var blend_3 = 3 * Math.pow(time, 2) * (1 - time);
    var blend_4 = Math.pow(time, 3);


    var blend_1_diff = 3 * Math.pow(1 - time, 2);
    var blend_2_diff = 6 * time * (1 - time);
    var blend_3_diff = 3 * Math.pow(time, 2);


    var new_x = blend_1 * this.p1[0] + blend_2 * this.p2[0] + blend_3 * this.p3[0] + blend_4 * this.p4[0];
    var new_y = blend_1 * this.p1[1] + blend_2 * this.p2[1] + blend_3 * this.p3[1] + blend_4 * this.p4[1];
    var new_z = blend_1 * this.p1[2] + blend_2 * this.p2[2] + blend_3 * this.p3[2] + blend_4 * this.p4[2];


    var dx = -blend_1_diff * this.p1[0] + (blend_1_diff - blend_2_diff) * this.p2[0] +
        (blend_2_diff - blend_3_diff) * this.p3[0] + blend_3_diff * this.p4[0];

    var dy = -blend_1_diff * this.p1[1] + (blend_1_diff - blend_2_diff) * this.p2[1] +
        (blend_2_diff - blend_3_diff) * this.p3[1] + blend_3_diff * this.p4[1];

    var dz = -blend_1_diff * this.p1[2] + (blend_1_diff - blend_2_diff) * this.p2[2] +
        (blend_2_diff - blend_3_diff) * this.p3[2] + blend_3_diff * this.p4[2];


    let ang = Math.atan(dx / dz) + (dz < 0 ? Math.PI : 0);

    mat4.translate(mat, mat, vec3.fromValues(new_x, new_y, new_z));
    mat4.rotateY(mat, mat, ang);

    return mat;
}
