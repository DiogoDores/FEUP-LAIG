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
    console.log(this.nextPos);

    this.dir = [
      this.nextPos[0] - this.pos[0],
      this.nextPos[1] - this.pos[1],
      this.nextPos[2] - this.pos[2]
    ];
    console.log(this.dir);
    this.dist = Math.sqrt(Math.pow(this.dir[0],2)+Math.pow(this.dir[1],2)+Math.pow(this.dir[2],2));
    this.currDist = 0;
    this.dir[0] = this.dir[0] / this.speed;
    this.dir[1] = this.dir[1] / this.speed;
    this.dir[2] = this.dir[2] / this.speed;
    console.log(this.dir);
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
  console.log(this.pos);
    this.currDist += this.speed * currTime;
    if(this.currDist > this.dist)
      this.currDist = this.dist;
    if(this.currDist == this.dist){
        this.pos = this.nextPos;
        if(this.controlPoints != null)
          this.calNext();
    } else {
      this.pos[0] = this.dir[0] * currTime;
      this.pos[1] = this.dir[1] * currTime;
      this.pos[2] = this.dir[2] * currTime;
    }
}
