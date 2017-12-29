/**
 * AnimationsOfNode
 * @constructor
 */
function AnimationsOfNode(scene, animations) {
  this.totalTime = 0;
  this.currentTime = 0;

  this.oldMatrix = mat4.create();
  this.matrix = mat4.create();
  mat4.identity(this.matrix);

  this.anims = animations;
  this.currAnim = 0;
  this.isFinished = false;
  let time = 0;
  this.animsTimes = [];
  for(let i = 0; i < this.anims.length; i++){
    time += this.anims[i].getTotalTime();
    this.animsTimes.push(time);
  }
};

AnimationsOfNode.prototype = Object.create(AnimationsOfNode.prototype);
AnimationsOfNode.prototype.constructor = AnimationsOfNode;

AnimationsOfNode.prototype.updates = function(currTime){
  if(this.totalTime < this.animsTimes[this.animsTimes.length - 1]){

    this.totalTime += currTime;
    this.currentTime += currTime;
    if(!this.isFinished){
      if(this.anims[this.currAnim].type == "combo")
        this.matrix = this.anims[this.currAnim].getMatrix(currTime, true);
      else
        this.matrix = this.anims[this.currAnim].getMatrix(this.currentTime);

    }
    this.finish();
    this.nextAnim();
  } else {
    this.matrix = this.oldMatrix;
  }
}

AnimationsOfNode.prototype.finish = function(){

  if(this.anims[this.currAnim].getTotalTime() <= this.currentTime && !this.isFinished){
    this.oldMatrix = this.anims[this.currAnim].getMatrix(this.currentTime, false);
    this.currentTime = 0;
    this.isFinished = true;
  }

}

AnimationsOfNode.prototype.addAnimation = function(anim) {
    this.anims.push(anim);
}

AnimationsOfNode.prototype.nextAnim = function(){

  if((this.currAnim != null && this.isFinished) || this.currAnim == null){
    if(this.anims.length > this.currAnim + 1){
      this.isFinished = false;
      this.currentTime = this.totalTime - this.animsTimes[this.currAnim];
      this.currAnim++;
    }
  }
}

AnimationsOfNode.prototype.addAnimationAfter = function(animation) {
  if(this.isFinished) {
    this.totalTime = this.animsTimes[this.animsTimes.length - 1];
    this.currentTime = this.totalTime;
    this.animsTimes.push(animation.getTotalTime());
    this.anims.push(animation);
    this.isFinished = false;
  } else {
    this.animsTimes.push(animation.getTotalTime());
    this.anims.push(animation);
  }
}
