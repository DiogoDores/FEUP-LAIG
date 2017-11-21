/**
 * AnimationsOfNode
 * @constructor
 */
function AnimationsOfNode(scene, animations) {
  this.totalTime = 0;
  this.currentTime = 0;

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
  this.totalTime += currTime;
  this.currentTime += currTime;
  this.matrix = this.anims[this.currAnim].getMatrix(this.currentTime);

  this.finish();
  this.nextAnim();
}

AnimationsOfNode.prototype.finish = function(){
  if(this.anims[this.currAnim].getTotalTime() <= this.time)
    this.isFinished = true;
}

AnimationsOfNode.prototype.addAnimation = function(anim) {
    this.anims.push(anim);
}

AnimationsOfNode.prototype.nextAnim = function(){

  if((this.currAnim != null && this.isFinished) || this.currAnim == null){
    if(this.anims.length >= this.currAnim + 1){
      this.isFinished = false;
      this.currentTime = this.totalTime - this.animsTimes[this.currAnim];
      this.currAnim++;
    }
  }
}
