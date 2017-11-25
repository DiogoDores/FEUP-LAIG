/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(scene, args) {
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


};
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getIndexTime = function (time) {
    for (let i = 0; i < this.times.length; i++) {
        if (time <= this.times[i])
            return i;
    }
    return -1;
}

LinearAnimation.prototype.getTotalTime = function () {
    return this.times[this.times.length - 1];
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

LinearAnimation.prototype.getMatrix = function (time) {

    let timeIdx = this.getIndexTime(time);
    let mat = mat4.create();
    let timePassed;

    if (timeIdx >= 0)
        timePassed = timeIdx == 0 ? time : time - this.times[timeIdx - 1];
    else
        timePassed = this.times[this.times.length - 1];

    let vecDir = vec3.create();

    if (timeIdx == -1)
        vecDir = vec3.clone(this.controlPoints[this.times.length]);
    else {

        vec3.sub(vecDir, this.controlPoints[timeIdx + 1], this.controlPoints[timeIdx]);
        vec3.normalize(vecDir, vecDir);
    }

    let vecInx0z = vec3.clone(vecDir);

    if (timeIdx == -1) {

        vec3.sub(vecInx0z, this.controlPoints[this.times.length], this.controlPoints[this.times.length - 1]);
        vec3.normalize(vecInx0z, vecInx0z);
    }

    vecInx0z[1] = 0;

    let alpha = angle(vecInx0z, vec3.fromValues(0, 0, 1));

    let newPoint = vec3.create();
    if (timeIdx != -1) {

        let dist = this.speed * timePassed;
        vec3.multiply(vecDir, vec3.fromValues(dist, dist, dist), vecDir);
        vec3.add(newPoint, vecDir, this.controlPoints[timeIdx]);

    } else
        newPoint = vec3.clone(vecDir);

    mat4.translate(mat, mat, newPoint);
    mat4.rotate(mat, mat, alpha, this.scene.axisCoords['y']);


    return mat;
}
