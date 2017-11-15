/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(scene, args) {
    Animation.call(scene, args);

    this.args = args;
    this.speed = this.args[0];
    this.controlPoints = this.args[1];

    getPoints();
};
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getPoints = function () {

    for (let i = 0; i < this.controlPoints.length; i++) {
        this.lastCP = this.controlPoints[i - 1];
        this.nextCP = this.controlPoints[i];
    }
}

LinearAnimation.prototype.update = function(currTime){
    
}
    
    





