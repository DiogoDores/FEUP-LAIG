// returns obj index on array a, or -1 if a does not contain obj
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return i;
        }
    }

    return -1;
}

/**
 * MyInterface class, creating a GUI interface.
 * @constructor
 */
function MyInterface() {
    //call CGFinterface constructor 
    CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * Initializes the interface.
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function (application) {
    // call CGFinterface init
    CGFinterface.prototype.init.call(this, application);

    // init GUI. For more information on the methods, check:
    //  http://workshop.chromeexperiments.com/examples/gui

    this.gui = new dat.GUI();
};

/**
 * Adds a folder containing the IDs of the lights passed as parameter.
 */
MyInterface.prototype.addLightsGroup = function (lights) {

    var group = this.gui.addFolder("Lights");
    group.open();

    // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
    // e.g. this.option1=true; this.option2=false;

    for (var key in lights) {
        if (lights.hasOwnProperty(key)) {
            this.scene.lightValues[key] = lights[key][0];
            group.add(this.scene.lightValues, key);
        }
    }
}

MyInterface.prototype.addShadersGroup = function () {

    var group = this.gui.addFolder("Shaders");
    group.open();

    this.gui.add(this.scene, 'selectedShaderIndex', {
        'Flat Shading': 0,
        'Passing a scale as uniform': 1,
        'Passing a varying parameter from VS -> FS': 2,
        'Simple texturing': 3,
        'Multiple textures in the FS': 4,
        'Multiple textures in VS and FS': 5,
        'Sepia': 6,
        'Convolution': 7

    }).name('Shader examples');

    obj = this;
    this.gui.add(this.scene, 'wireframe').onChange(function (v) {
        obj.scene.updateWireframe(v)
    });

    this.gui.add(this.scene, 'scaleFactor', -50, 50).onChange(function (v) {
        obj.scene.updateScaleFactor(v);
    });

    return true;
}
