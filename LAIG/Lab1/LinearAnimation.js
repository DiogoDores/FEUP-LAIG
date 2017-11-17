/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(scene, args) {
    Animation.call(scene, args);
    this.scene = scene;
    this.args = args;
    this.speed = this.args[1];
    this.controlPoints = this.args[2];
    this.finished = false;
    this.pos = this.controlPoints.shift();
    this.nextPos = this.controlPoints.shift();

    this.dir = [
      this.nextPos[0] - this.pos[0],
      this.nextPos[1] - this.pos[1],
      this.nextPos[2] - this.pos[2]
    ];
    this.dist = Math.sqrt(Math.pow(this.dir[0],2)+Math.pow(this.dir[1],2)+Math.pow(this.dir[2],2));
    this.currDist = 0;
    this.dir = this.dir / this.speed;
    //getPoints();
};
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getPoints = function () {

    for (let i = 0; i < this.controlPoints.length; i++) {
        this.lastCP = this.controlPoints[i - 1];
        this.nextCP = this.controlPoints[i];
    }
}

LinearAnimation.prototype.updatePos = function(currTime){
    this.currDist += this.speed * currTime;
    if(this.currDist > this.dist)
      this.currDist = this.dist;
    if(this.currDist == this.dist){
        this.pos = this.nextPos;
        if(this.controlPoints != null)
          this.calNext();
    } else {
      this.pos = this.dir * currTime;

    }
}
