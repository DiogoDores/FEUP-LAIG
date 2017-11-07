/**
 @constructor
 @abstract
 */
function Animation(scene, args) {
    if (this.constructor === Animation) {
      throw new Error("Can't instantiate abstract class!");
    }
    // Animation initialization...
};
