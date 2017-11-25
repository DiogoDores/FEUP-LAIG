/**
 * ComboAnimation
 * @constructor
 */
function ComboAnimation(scene, args) {
    Animation.call(scene, args);
    this.scene = scene;

    this.totalTime = 0;
    this.currentTime = 0;

    this.oldMatrix = mat4.create();
    this.matrix = mat4.create();
    mat4.identity(this.matrix);

    this.anims = args[1];
    this.currAnim = 0;
    this.isFinished = false;
    let time = 0;
    this.animsTimes = [];
    for(let i = 0; i < this.anims.length; i++){
      time += this.anims[i].getTotalTime();
      this.animsTimes.push(time);
    }

};
ComboAnimation.prototype = Object.create(Animation.prototype);
ComboAnimation.prototype.constructor = ComboAnimation;

ComboAnimation.prototype.updates = function(currTime){
  this.totalTime += currTime;
  this.currentTime += currTime;
  if(!this.isFinished){
    this.matrix = this.anims[this.currAnim].getMatrix(this.currentTime);
    mat4.multiply(this.matrix, this.oldMatrix, this.matrix);
  } else {
    this.matrix = this.oldMatrix;
  }
  this.finish();
  this.nextAnim();
}

ComboAnimation.prototype.finish = function(){
  if(this.anims[this.currAnim].getTotalTime() <= this.currentTime && !this.isFinished){
      mat4.multiply(this.oldMatrix, this.oldMatrix,
      this.anims[this.currAnim].getMatrix(this.currentTime));
      this.currentTime = 0;
      this.isFinished = true;
  }
}

ComboAnimation.prototype.nextAnim = function(){

  if((this.currAnim != null && this.isFinished) || this.currAnim == null){
    if(this.anims.length > this.currAnim + 1){
      this.isFinished = false;
      this.currentTime = this.totalTime - this.animsTimes[this.currAnim];
      this.currAnim++;
    }
  }
}

ComboAnimation.prototype.getTotalTime = function(){
  return this.animsTimes[this.animsTimes.length - 1];
}

ComboAnimation.prototype.getMatrix = function(time){

  return this.matrix;
}
