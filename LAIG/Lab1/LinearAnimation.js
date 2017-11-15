/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(scene, args) {
    Animation.call(scene, args);

    this.args = args;
    this.speed = this.args[0];
    this.controlPoints = this.args[1];

    readPoints();
};
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.readPoints = function(){

    for (let i = 0; i < this.controlPoints.length; i ++){
      var lastCP = this.controlPoints[i-1];
      var nextCP = this.controlPoints[i];

      handleCP();
    }
}
