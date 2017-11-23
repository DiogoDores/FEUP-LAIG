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
    this.distances = [];
    this.times = [];
    this.totalDistance = [];

    for (let i = 0; i < tempControlPoints.length; i++) {
        this.controlPoints.push(vec3.fromValues(tempControlPoints[i][0], tempControlPoints[i][1], tempControlPoints[i][2]));
    }

    this.totalDistance = 0;
    for (let i = 1; i < this.controlPoints.length; i++) {
        this.distances.push(vec3.distance(this.controlPoints[i - 1], this.controlPoints[i]));
        this.totalDistance += this.distances[i - 1];
        this.times.push(this.totalDistance / this.speed);
    }

    this.p1 = this.controlPoints[0];
    this.p2 = this.controlPoints[1];
    this.p3 = this.controlPoints[2];
    this.p4 = this.controlPoints[3];
};
BezierAnimation.prototype = Object.create(Animation.prototype);
BezierAnimation.prototype.constructor = BezierAnimation;

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

BezierAnimation.prototype.getTotalTime = function () {
    return this.times[this.times.length - 1];
}

BezierAnimation.prototype.getIndexTime = function (time) {
    for (let i = 0; i < this.times.length; i++) {
        if (time <= this.times[i])
            return i;
    }
    return -1;
}

BezierAnimation.prototype.getMatrix = function (time) {

    let t = time / this.getTotalTime();
    let mat = mat4.create();
    
    if(t > 1){
        return;
    }

    var blend_1 = Math.pow(1 - this.t, 3);
    var blend_2 = 3 * this.t * (Math.pow(1 - this.t, 2));
    var blend_3 = 3 * Math.pow(this.t, 2) * (1 - this.t);
    var blend_4 = Math.pow(this.t, 3);

    var blend_1_diff = 3 * Math.pow(1 - this.t, 2);
    var blend_2_diff = 6 * this.t * (1 - this.t);
    var blend_3_diff = 3 * Math.pow(this.t, 2);

    var new_x = blend_1 * this.p1[0] + blend_2 * this.p2[0] + blend_3 * this.p3[0] + blend_4 * this.p4[0];
    var new_y = blend_1 * this.p1[1] + blend_2 * this.p2[1] + blend_3 * this.p3[1] + blend_4 * this.p4[1];
    var new_z = blend_1 * this.p1[2] + blend_2 * this.p2[2] + blend_3 * this.p3[2] + blend_4 * this.p4[2];

    var dx = -blend_1_diff * this.p1[0] + (blend_1_diff - blend_2_diff) * this.p2[0] +
        (blend_2_diff - blend_3_diff) * this.p3[0] + blend_3_diff * this.p4[0];

    var dy = -blend_1_diff * this.p1[1] + (blend_1_diff - blend_2_diff) * this.p2[1] +
        (blend_2_diff - blend_3_diff) * this.p3[1] + blend_3_diff * this.p4[1];

    var dz = -blend_1_diff * this.p1[2] + (blend_1_diff - blend_2_diff) * this.p2[2] +
        (blend_2_diff - blend_3_diff) * this.p3[2] + blend_3_diff * this.p4[2];

    this.y_angle = Math.atan(dx / dz) + (dz < 0 ? 180.0 * degToRad : 0);
    this.x_angle = Math.atan(dy / Math.sqrt(dx * dx + dy * dy + dz * dz));
    
    //let rot_y = angle(this.y_angle, vec3.fromValues(0, 1, 0));
    //let rot_x = angle(this.x_angle, vec3.fromValues(1, 0, 0));

    mat4.rotate(mat, mat, rot_y, this.scene.axisCoords['y']);
    mat4.rotate(mat, mat, rot_x, this.scene.axisCoords['x']);
    mat4.translate(mat, mat, vec3.fromValues(new_x, new_y, new_z));
    
    console.log(mat);

    return mat;
}
