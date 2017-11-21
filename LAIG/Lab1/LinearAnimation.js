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
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getIndexTime = function(time){
    for(let i = 0; i < this.times.length; i++){
      if(time <= this.times[i])
        return i;
    }
}

LinearAnimation.prototype.getTotalTime = function(){
  return this.times[this.times.length -1];
}

LinearAnimation.prototype.getMatrix = function(time){
    let timeIdx = this.getIndexTime(time);
    let mat = mat4.create();
    if(timeIdx != null && timeIdx != undefined){
      let timePassed = this.times[timeIdx] - time;

      let vecDir = vec3.create();
      console.log(timeIdx);
      console.log(this.controlPoints);
      vec3.sub(vecDir, this.controlPoints[timeIdx],this.controlPoints[timeIdx+1]);
      console.log
      vec3.normalize(vecDir, vecDir);
      let alpha = 1/Math.cos(vec3.dot(vec3.fromValues(0,0,1),vecDir)/(vec3.length(vecDir)*vec3.length(vec3.fromValues(0,0,1))));
      //mat4.rotate(mat,mat,alpha);
      let dist = this.speed * timePassed;
      vec3.multiply(vecDir,vec3.fromValues(dist,dist,dist),vecDir);
      let newPoint = vec3.create();
      vec3.add(newPoint,vecDir,this.controlPoints[timeIdx]);
      mat4.translate(mat, mat, newPoint);
      console.log(newPoint);
    }
    else {
      mat4.translate(mat,mat,this.controlPoints[this.times.length]);
    }
    return mat;
}
/*
LinearAnimation.prototype.getPoints = function () {

    for (let i = 0; i < this.controlPoints.length; i++) {
        this.lastCP = this.controlPoints[i - 1];
        this.nextCP = this.controlPoints[i];
    }
}

LinearAnimation.prototype.updatePos = function(currTime){
  //console.log(this.pos);
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
*/
