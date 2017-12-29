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

    return true;
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

MyInterface.prototype.addShadersGroup = function (selectables) {

    var group = this.gui.addFolder("Shaders");
    group.open();

    group.add(this.scene, 'selectedShaderIndex', {
        'Shader1': 0,
        'Flat Shading': 1,
        'Passing a scale as uniform': 2,
        'Passing a varying parameter from VS -> FS': 3,
        'Simple texturing': 4,
        'Multiple textures in the FS': 5,
        'Multiple textures in VS and FS': 6,
        'Sepia': 7,
        'Convolution': 8
    }).name('Shaders list');


    obj = this;

    group.add(this.scene, 'Node', selectables).onChange(function (v) {
        for (var i = 0; i < selectables.length; i++) {
            if (selectables[i] == v) {
                obj.scene.graph.useSelectable = i;
            }
        }
    });

    group.add(this.scene, 'scaleFactor', -25, 25).onChange(function (v) {
        obj.scene.updateScaleFactor(v);
    });

}

MyInterface.prototype.addStartGameOptionsGroup = function () {
    
    var group = this.gui.addFolder("Start Game");
    group.open();

    group.add(this.scene, 'GameType', [ 'Multiplayer', 'Singleplayer', 'Computer vs Computer']);
}
