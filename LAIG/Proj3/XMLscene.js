var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 * @constructor
 */
function XMLscene(interface) {
    CGFscene.call(this);

    this.interface = interface;

    this.lightValues = {};
    this.selectablesValues = {};

    this.selectedShaderIndex = 0;
    this.scaleFactor = 1.0;

    this.Node = 0;
    this.lastime = 0;
    this.delta = 0;
    this.timeFactor = 0;

    this.objects=[];
    this.pickIDs=[];
    this.runOnce = true;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
 */
XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();
    this.initShaders();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    for (var i = 0; i < 41; i++) {
       this.objects.push(new CGFplane(this));
    }

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(30);

    this.setPickEnabled(true);
}

/**
 * Initializes the scene lights with the values read from the LSX file.
 */
XMLscene.prototype.initLights = function () {
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
        if (i >= 8)
            break; // Only eight lights allowed by WebGL.

        if (this.graph.lights.hasOwnProperty(key)) {
            var light = this.graph.lights[key];

            this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
            this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
            this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            i++;
        }
    }

}

XMLscene.prototype.initShaders = function () {

    this.testShaders = [
    new CGFshader(this.gl, "scenes/shaders/shader1.vert", "scenes/shaders/shader1.frag"),
		new CGFshader(this.gl, "scenes/shaders/flat.vert", "scenes/shaders/flat.frag"),
		new CGFshader(this.gl, "scenes/shaders/uScale.vert", "scenes/shaders/uScale.frag"),
		new CGFshader(this.gl, "scenes/shaders/varying.vert", "scenes/shaders/varying.frag"),
		new CGFshader(this.gl, "scenes/shaders/texture1.vert", "scenes/shaders/texture1.frag"),
		new CGFshader(this.gl, "scenes/shaders/texture2.vert", "scenes/shaders/texture2.frag"),
		new CGFshader(this.gl, "scenes/shaders/texture3.vert", "scenes/shaders/texture3.frag"),
		new CGFshader(this.gl, "scenes/shaders/texture3.vert", "scenes/shaders/sepia.frag"),
		new CGFshader(this.gl, "scenes/shaders/texture3.vert", "scenes/shaders/convolution.frag")
	];

    this.transparent = new CGFshader(this.gl, "scenes/shaders/texture3.vert", "scenes/shaders/transparent.frag");

    // texture will have to be bound to unit 1 later, when using the shader, with "this.texture2.bind(1);"
    this.testShaders[5].setUniformsValues({
        uSampler2: 1
    });
    this.testShaders[6].setUniformsValues({
        uSampler2: 1
    });
}

XMLscene.prototype.updateScaleFactor = function (v) {
    this.testShaders[2].setUniformsValues({
        normScale: this.scaleFactor
    });
    this.testShaders[3].setUniformsValues({
        normScale: this.scaleFactor
    });
    this.testShaders[6].setUniformsValues({
        normScale: this.scaleFactor
    });
}

/**
 * Initializes the scene cameras.
 */
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
}

XMLscene.prototype.logPicking = function ()
{
    if (this.pickMode == false) {
        if (this.pickResults != null && this.pickResults.length > 0) {
            for (var i=0; i< this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj)
                {
                    var customId = this.pickResults[i][1];
                    makeRequest(); // TODO remover daqui, so para teste
                    console.log("Picked object: " + obj + ", with pick id " + customId);
                }
            }
            this.pickResults.splice(0,this.pickResults.length);
        }
    }
}

/* Handler called when the graph is finally loaded.
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function () {
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.setGlobalAmbientLight(this.graph.ambientIllumination[0], this.graph.ambientIllumination[1],
        this.graph.ambientIllumination[2], this.graph.ambientIllumination[3]);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.initLights();

    this.updateScaleFactor();

    // Adds lights group.
    this.interface.addLightsGroup(this.graph.lights);

    this.interface.addShadersGroup(this.graph.selectables);

}

function getPrologRequest(requestString, onSuccess, onError, port)
{
  var requestPort = port || 8081
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

  request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
  request.onerror = onError || function(){console.log("Error waiting for response");};

  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send();
}

function makeRequest()
{
  //TODO

  // Make Request
  getPrologRequest("handshake", handleReply);
}

//Handle the Reply
function handleReply(data){

}

/*
 *
 */
XMLscene.prototype.update = function (currTime) {
    this.lastTime = this.lastTime || 0.0;
    this.delta = currTime - this.lastTime || 0.0;
    this.timeFactor += this.delta / 1000;
    if (this.graph.animRefs != undefined) {
        for (let i = 0; i < this.graph.animRefs.length; i++) {

            this.graph.animRefs[i].updates(this.delta / 1000);
        }
    }
    this.testShaders[0].setUniformsValues({
        amplitude: (1 + Math.sin(this.timeFactor)) / 2
    })

    this.testShaders[0].setUniformsValues({
        displacement: (1 + Math.sin(1.5 * this.timeFactor)) / 2
    })

    this.lastTime = currTime;
}

/**
 * Displays the scene.
 */
XMLscene.prototype.display = function () {

    this.logPicking();
    this.clearPickRegistration();

    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.graph.loadedOk) {
        // Applies initial transformations.
        this.multMatrix(this.graph.initialTransforms);

        // Draw axis
        this.axis.display();

        var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                } else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        var counter = 1;
        var inverseCounter = 9;
        var lastX = -9.05;
        var lastZ = 6.65;
        var angle = 0;
        var name = ["b", "g", "r", "y"];
        var nameCounter = 0;

        this.setActiveShader(this.transparent);

        this.pushMatrix();
        this.translate(0,0.4,0);
        this.registerForPick(this.objects.length, this.objects[this.objects.length-1]);
        this.objects[this.objects.length-1].display();
        this.popMatrix();

        for (var i = 0; i < this.objects.length - 1; i++) {

            if(counter == 5){
                lastZ = 5.3;
                lastX += 2.2;
            } else if (counter == 8) {
                lastZ = 3.95;
                lastX += 2.2;
            } else if (counter == 10){
                lastZ = 2.6;
                lastX += 2.2;
            }

            this.pushMatrix()
            if(counter <= 10){
                lastZ -= 2.65;

                this.rotate(angle*Math.PI/180, 0,1,0);
                this.translate(lastX, 0.4, lastZ);
            }

            this.registerForPick(i+1, this.objects[i]);
            if(this.runOnce){
                var idName = name[nameCounter] + inverseCounter;
                this.pickIDs.push(i+1, idName);
            }

            if(counter == 10){
                counter = 0;
                inverseCounter = 10;
                angle -= 90;
                lastX = -9.05;
                lastZ = 6.65;
                nameCounter++;
            }

            this.objects[i].display();
            this.popMatrix();

            counter++;
            inverseCounter--;
        }

        if(this.runOnce)
            this.pickIDs.push(this.objects.length, "middle");

        this.runOnce = false;

        console.log(this.pickIDs);

    this.setActiveShader(this.defaultShader);

    this.clearPickRegistration();


        // Displays the scene.
        this.graph.displayScene();


    } else {
        // Draw axis
        this.axis.display();
    }


    this.popMatrix();

    // ---- END Background, camera and axis setup

}
