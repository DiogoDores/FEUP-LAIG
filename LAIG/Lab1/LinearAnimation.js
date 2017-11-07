function LinearAnimation() {
    Animation.call(scene, args);
    // LinearAnimation initialization...
};
LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;
