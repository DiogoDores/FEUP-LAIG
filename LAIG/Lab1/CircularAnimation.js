function CircularAnimation() {
    Animation.call(this.scene, args);
    // CircularAnimation initialization...
};
CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;
