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

    this.scaleFactor = 1.0;

    this.Node = 0;
    this.lastime = 0;
    this.delta = 0;
    this.timeFactor = 0;

    this.objects=[];
    this.pickIDs=[];
    this.runOnce = true;

    this.picks = ["", ""];
    this.pickCounter = 0;

    this.players = ["y", "b"];
    this.player = 0;
    this.makeRequest(0);

    this.timeToPlayBot = 0;
    this.globalCounter = 0;
    this.runTimer = false;
    this.secondsIndex = 10;
    this.minutesIndex = 5;

    this.gameMode = 3;
    this.isGameModeSelected = false;
    this.alignCamera = false;
    this.orbitCamera = false;
    this.orbitCounter = 0;

    this.playing = false;
    this.player1Score = 0;
    this.player2Score = 0;

    this.needMoverToRemove = false;

    this.piecesOut = [0,0,0,0]; //[yellow, green, blue, red]

    this.ChooseScene = "Venice";
    this.Undo = function Undo(){//Chamar funções aqui
      this.undoAux();
    };
    this.Movie = function Movie(){};

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

    for (var i = 0; i < 44; i++) {
       this.objects.push(new CGFplane(this));
    }

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(26);

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
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(25, 45, 50), vec3.fromValues(0,0,0));
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
                    if(!this.isGameModeSelected)
                      this.selectGameMode(customId);
                    else if(this.playing && !this.needMoverToRemove){
                      this.picks[this.pickCounter] = this.pickIDs[customId - 1];
                      this.pickCounter++;
                      if(this.pickCounter == 2)
                        this.makeRequest(1);

                    } else if(this.playing && this.needMoverToRemove){
                      if(this.graph.checkIfBelongs(this.pickIDs[customId - 1],this.players[this.player])){
                         console.log("there");
                        this.moverRemove = this.pickIDs[customId - 1];
                        this.makeRequest(2);
                        this.needMoverToRemove = false;
                       } else {
                        console.log("here2");
                         //TODO add message to say: "Mover To Remove Selected Invalid. Select Another"
                       }
                    }

                    console.log("Picked id " + customId);
                }
            }
            this.pickResults.splice(0,this.pickResults.length);
        }
    }
}

XMLscene.prototype.undoAux = function() {
  if(this.playing && this.gameMode != 3 && this.allPlays.length > 1 && this.graph.removedPieces.length > 0){
    let responseArr = this.allPlays.pop();
    console.log(responseArr);
    this.graph.readdPiece(this.graph.removedPieces.pop(),responseArr[responseArr.length - 2]);
    this.graph.movePiece(responseArr[responseArr.length - 1],responseArr[responseArr.length - 3]);
    //this.graph.removePiece(responseArr[responseArr.length - 2]);
    this.pickCounter = 0;
    this.player = this.player == 0? 1 : 0;
    this.orbitCamera = true; // TODO rodar ao contrario aqui
    this.resetTimer();
    this.timeToPlayBot = 0;
    this.makeRequest(9);
  }
}

XMLscene.prototype.selectGameMode = function(id) {
    if(id == 42){
        this.gameMode = 0;
        this.isGameModeSelected = true;
        this.runTimer = true;
        this.playing = true;
        console.log("Playing Multiplayer Mode");
        this.camera.setPosition(vec3.fromValues(15, 10, 30));
        this.alignCamera = true;
    } else if(id == 43){
        this.gameMode = 1;
        this.isGameModeSelected = true;
        this.runTimer = true;
        this.playing = true;
        console.log("Playing Singleplayer Mode");
        this.camera.setPosition(vec3.fromValues(15, 10, 30));
        this.alignCamera = true;
    } else if(id == 44){
        this.gameMode = 2;
        this.isGameModeSelected = true;
        this.runTimer = true;
        this.playing = true;
        console.log("Playing Computer vs Computer Mode");
        this.camera.setPosition(vec3.fromValues(15, 10, 30));
        this.alignCamera = true;
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

}

XMLscene.prototype.getPrologRequest = function(requestString, onSuccess, onError, port)
{
  var requestPort = port || 8081
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

  request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
  request.onerror = onError || function(){console.log("Error waiting for response");};

  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send();
}

XMLscene.prototype.makeRequest = function(type)
{
  if(type == 0){
    this.getPrologRequest(0, this.handleReply.bind(this));

  } else if(type == 1){
    console.log(this.picks[0] + this.picks[1]);
    this.getPrologRequest("1-" + this.allPlays[this.allPlays.length - 1][1] + "-"
    + this.allPlays[this.allPlays.length - 1][2] + "-" + this.players[this.player]
    + "-" + (this.gameMode + 1) + "-" + this.picks[0] + "-" + this.picks[1], this.handleReply.bind(this));

  } else if(type == 2) {
    console.log(this.picks[0] + this.picks[1] + " mover to remove " + this.moverRemove);
    this.getPrologRequest("2-" + this.allPlays[this.allPlays.length - 1][1] + "-"
    + this.allPlays[this.allPlays.length - 1][2] + "-" + this.players[this.player]
    + "-" + (this.gameMode + 1) + "-" + this.picks[0] + "-" + this.picks[1] + "-" + this.moverRemove, this.handleReply.bind(this));

  } else if (type == 9) {
    this.getPrologRequest("9-" + this.players[this.player] + "-"
     + this.allPlays[this.allPlays.length - 1][1] + "-"
     + this.allPlays[this.allPlays.length - 1][2], this.handleReply.bind(this));
  }
  //TODO

  // Make Request
  //getPrologRequest("handshake", handleReply);
}

//Handle the Reply
XMLscene.prototype.handleReply = function(data){
  let response = data.target.response;
  console.log("answer from prolog: " + response);

  let responseArr = response.split("-");
  console.log(responseArr);
  if(responseArr[0] == "0"){
    this.allPlays = [responseArr];
    this.makeRequest(9);

  } else if(responseArr[0] == "1"){
    console.log("nice move");
    this.allPlays.push(responseArr);
    this.graph.movePiece(responseArr[responseArr.length - 3], responseArr[responseArr.length - 1]);
    this.graph.removePiece(responseArr[responseArr.length - 2]);
    this.pickCounter = 0;
    this.player = this.player == 0? 1 : 0;
    this.orbitCamera = true;
    this.resetTimer();
    this.timeToPlayBot = 0;
    this.makeRequest(9);

  } else if(responseArr[0] == "2") {
    this.pickCounter = 0;
    console.log("bad move");

  } else if(responseArr[0] == "3") {
    this.needMoverToRemove = true;
    this.graph.movePiece(this.picks[0], this.picks[1]);

  } else if(responseArr[0] == "4") {
    this.allPlays.push(responseArr);
    this.graph.removePiece(responseArr[responseArr.length - 2]);
    this.pickCounter = 0;
    this.player = this.player == 0? 1 : 0;
    this.orbitCamera = true;
    this.resetTimer();
    this.timeToPlayBot = 0;
    this.makeRequest(9);

  } else if (responseArr[0] == "8") {
    this.player1Score = responseArr[1];
    this.player2Score = responseArr[2];

  } else if (responseArr[0] == "9") {
    this.player1Score = responseArr[1];
    this.player2Score = responseArr[2];
    this.playing = false;
    this.isGameOver = true;
    if(this.player1Score > this.player2Score)
       console.log("Player 2 Wins");//TODO replace with text to: Player 2 Wins
    else if (this.player1Score < this.player2Score)
        console.log("Player 1 Wins");//TODO replace with text to: Player 1 Wins
    else
        console.log("Draw");//TODO replace with text to: Draw
  }
  console.log(this.allPlays);
  // TODO reset counter caso successo.
  //TODO Fazer movimentos e cenas
}

XMLscene.prototype.resetTimer = function () {
    this.graph.nodes["units"].textureID = this.graph.clockTextures[0];
    this.graph.nodes["dozens"].textureID = this.graph.clockTextures[6];
    this.secondsIndex = 0;
    this.minutesIndex = 5;
}

/*
 *
 */
XMLscene.prototype.update = function (currTime) {
    this.lastTime = this.lastTime || 0.0;
    this.delta = currTime - this.lastTime || 0.0;
    this.timeFactor += this.delta / 1000;
    if (this.graph.animRefs != undefined && this.graph.animRefs.length > 0) {
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

    //Timer handling

    if(this.globalCounter == 33){

        if (this.graph.nodes != null && this.graph.clockTextures != null) {

            if(this.runTimer){

                if(this.graph.nodes["units"].textureID != this.graph.clockTextures[0]){
                    this.graph.nodes["units"].textureID = this.graph.clockTextures[this.secondsIndex--];
                } else {
                    this.graph.nodes["dozens"].textureID = this.graph.clockTextures[this.minutesIndex--];
                    this.secondsIndex = 9;
                    this.graph.nodes["units"].textureID = this.graph.clockTextures[this.secondsIndex--];
                }

                if(this.graph.nodes["units"].textureID == this.graph.clockTextures[0] && this.graph.nodes["dozens"].textureID == this.graph.clockTextures[0]){
                    this.resetTimer();
                    this.orbitCamera = true;
                    this.player = this.player == 0? 1 : 0;
                }

            }

            this.globalCounter = 0;
        }
    }

    this.globalCounter++;
    if(this.playing && this.gameMode != 0)
      this.timeToPlayBot++;
    if(this.playing && (this.gameMode == 2 || (this.gameMode == 1 && this.player == 1)) && this.timeToPlayBot == 99){
      this.timeToPlayBot = 0;
      this.picks = ["0","0"];
      this.makeRequest(1);
   }

    //Moves camera to board
    if(this.alignCamera){
        this.moveCameraToBoard();
    }

    if(this.orbitCamera){
        if(this.orbitCounter == 30){
            this.orbitCounter = 0;
            this.orbitCamera = false;
        } else {
            this.camera.orbit(vec3.fromValues(0, 1, 0), -3*Math.PI/180);
            this.orbitCounter++;
        }
    }
}

XMLscene.prototype.moveCameraToBoard = function () {

    if(this.camera.position[0] == 0 && this.camera.position[1] == 20 && this.camera.position[2] == 1){
        this.alignCamera = false;
    }

    if(this.camera.position[0] != 0){
        if(this.camera.position[0] > 0)
            this.camera.setPosition(vec3.fromValues(this.camera.position[0] - 1, this.camera.position[1], this.camera.position[2]));
        else
            this.camera.setPosition(vec3.fromValues(this.camera.position[0] + 1, this.camera.position[1], this.camera.position[2]));
    }

    if(this.camera.position[1] != 20){
        if(this.camera.position[1] > 20)
            this.camera.setPosition(vec3.fromValues(this.camera.position[0], this.camera.position[1] - 1, this.camera.position[2]));
        else
            this.camera.setPosition(vec3.fromValues(this.camera.position[0], this.camera.position[1] + 1, this.camera.position[2]));
    }

    if(this.camera.position[2] != 1){
        if(this.camera.position[2] > 1)
            this.camera.setPosition(vec3.fromValues(this.camera.position[0], this.camera.position[1], this.camera.position[2] - 1));
        else
            this.camera.setPosition(vec3.fromValues(this.camera.position[0], this.camera.position[1], this.camera.position[2] + 1));
    }
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
        // this.axis.display();

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

        this.makePickable();

        // Displays the scene.
        this.graph.displayScene();


    } else {
        // Draw axis
        this.axis.display();
    }


    this.popMatrix();

    // ---- END Background, camera and axis setup

}

XMLscene.prototype.makePickable = function(){

    var counter = 1;
    var inverseCounter = 9;
    var lastX = -9.05;
    var lastZ = 6.65;
    var angle = 0;
    var name = ["b", "g", "r", "y"];
    var nameCounter = 0;

    this.setActiveShader(this.transparent);

    if(!this.isGameModeSelected){
        var buttonCounter = 1.1;
        for(var i = 42; i < 45; i++){
            this.pushMatrix();
                this.translate(-0.5, 26.5, -39.8);
                this.scale(13, 7, 1);
                this.translate(0, buttonCounter, 0);
                this.rotate(90*Math.PI/180, 1, 0, 0);
                this.registerForPick(i, this.objects[i-1]);
                this.objects[i-1].display();
            this.popMatrix();
            buttonCounter -= 1.1;
        }
    }

    this.pushMatrix();
        this.scale(0.7, 1, 0.7);
        this.translate(0,0.4,0);
        this.registerForPick(41, this.objects[this.objects.length-4]);
        this.objects[this.objects.length-4].display();
    this.popMatrix();

    for (var i = 0; i < this.objects.length - 4; i++) {

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

            this.scale(0.7, 1, 0.7);
            this.rotate(angle*Math.PI/180, 0,1,0);
            this.translate(lastX, 0.4, lastZ);
        }

        this.registerForPick(i+1, this.objects[i]);
        if(this.runOnce){
            var idName = name[nameCounter] + inverseCounter;
            this.pickIDs.push(idName);
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
        this.pickIDs.push("mid");

    this.runOnce = false;

    this.setActiveShader(this.defaultShader);

    this.clearPickRegistration();
}
