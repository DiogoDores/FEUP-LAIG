/**
 * ComboAnimation
 * @constructor
 */
function ComboAnimation(scene, args) {
    Animation.call(scene, args);
    this.scene = scene;

    this.type = args[0];
    this.totalTime = 0;
    this.currentTime = 0;

    this.oldMatrix = mat4.create();
    this.matrix = mat4.create();
    mat4.identity(this.matrix);
    mat4.identity(this.oldMatrix);

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
  if(this.totalTime < this.animsTimes[this.animsTimes.length - 1]){
    this.totalTime += currTime;
    this.currentTime += currTime;
    if(!this.isFinished)
      this.matrix = this.anims[this.currAnim].getMatrix(this.currentTime);

    this.finish();
    this.nextAnim();
  } else {
    this.matrix = this.oldMatrix;
  }
}

ComboAnimation.prototype.finish = function(){

  if(this.anims[this.currAnim].getTotalTime() <= this.currentTime && !this.isFinished){
    this.oldMatrix = this.anims[this.currAnim].getMatrix(this.currentTime);
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

ComboAnimation.prototype.getMatrix = function(time, update){
  if(update != null && update)
    this.updates(time);

  return this.matrix;
}
