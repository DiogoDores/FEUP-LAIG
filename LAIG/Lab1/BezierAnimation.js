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

    for(let i=0; i < tempControlPoints.length; i++){
      this.controlPoints.push(vec3.fromValues(tempControlPoints[i][0],tempControlPoints[i][1], tempControlPoints[i][2]));
    }
    this.totalDistance = 0;
    for(let i=1; i < this.controlPoints.length; i++){
      this.distances.push(vec3.distance(this.controlPoints[i-1], this.controlPoints[i]));
      this.totalDistance += this.distances[i-1];
      this.times.push(this.totalDistance/this.speed);
    }


};
BezierAnimation.prototype = Object.create(Animation.prototype);
BezierAnimation.prototype.constructor = BezierAnimation;