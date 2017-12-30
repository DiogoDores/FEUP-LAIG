var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ILLUMINATION_INDEX = 1;
var LIGHTS_INDEX = 2;
var TEXTURES_INDEX = 3;
var MATERIALS_INDEX = 4;
var ANIMATIONS_INDEX = 5;
var NODES_INDEX = 6;

/**
 * MySceneGraph class, representing the scene graph.
 * @constructor
 */
function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];
    this.patches = [];
    this.patchesid = null;

    this.idRoot = null; // The id of the root element.

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading
    this.reader = new CGFXMLreader();

    this.selectables = ["No selected node"];
    this.useSelectable = 0;

    this.clockTextures=[];

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */

    this.reader.open('scenes/' + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function () {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseLSXFile(rootElement);

    if (error != null) {
        this.onXMLError(error);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
}

/**
 * Parses the LSX file, processing each block.
 */
MySceneGraph.prototype.parseLSXFile = function (rootElement) {
    if (rootElement.nodeName != "SCENE")
        return "root tag <SCENE> missing";

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
        nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    // <INITIALS>
    var index;
    if ((index = nodeNames.indexOf("INITIALS")) == -1)
        return "tag <INITIALS> missing";
    else {
        if (index != INITIALS_INDEX)
            this.onXMLMinorError("tag <INITIALS> out of order");

        if ((error = this.parseInitials(nodes[index])) != null)
            return error;
    }

    // <ILLUMINATION>
    if ((index = nodeNames.indexOf("ILLUMINATION")) == -1)
        return "tag <ILLUMINATION> missing";
    else {
        if (index != ILLUMINATION_INDEX)
            this.onXMLMinorError("tag <ILLUMINATION> out of order");

        if ((error = this.parseIllumination(nodes[index])) != null)
            return error;
    }

    // <LIGHTS>
    if ((index = nodeNames.indexOf("LIGHTS")) == -1)
        return "tag <LIGHTS> missing";
    else {
        if (index != LIGHTS_INDEX)
            this.onXMLMinorError("tag <LIGHTS> out of order");

        if ((error = this.parseLights(nodes[index])) != null)
            return error;
    }

    // <TEXTURES>
    if ((index = nodeNames.indexOf("TEXTURES")) == -1)
        return "tag <TEXTURES> missing";
    else {
        if (index != TEXTURES_INDEX)
            this.onXMLMinorError("tag <TEXTURES> out of order");

        if ((error = this.parseTextures(nodes[index])) != null)
            return error;
    }

    // <MATERIALS>
    if ((index = nodeNames.indexOf("MATERIALS")) == -1)
        return "tag <MATERIALS> missing";
    else {
        if (index != MATERIALS_INDEX)
            this.onXMLMinorError("tag <MATERIALS> out of order");

        if ((error = this.parseMaterials(nodes[index])) != null)
            return error;
    }

    // <ANIMATIONS>
    if ((index = nodeNames.indexOf("ANIMATIONS")) == -1)
        return "tag <ANIMATIONS> missing";
    else {
        if (index != ANIMATIONS_INDEX)
            this.onXMLMinorError("tag <ANIMATIONS> out of order");

        if ((error = this.parseAnimations(nodes[index])) != null)
            return error;
    }

    // <NODES>
    if ((index = nodeNames.indexOf("NODES")) == -1)
        return "tag <NODES> missing";
    else {
        if (index != NODES_INDEX)
            this.onXMLMinorError("tag <NODES> out of order");

        if ((error = this.parseNodes(nodes[index])) != null)
            return error;
    }

    this.createMapOfPieces();
    this.createMapOfCoord();
}

/**
 * Parses the <INITIALS> block.
 */
MySceneGraph.prototype.parseInitials = function (initialsNode) {

    var children = initialsNode.children;

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Frustum planes.
    this.near = 0.1;
    this.far = 500;
    var indexFrustum = nodeNames.indexOf("frustum");
    if (indexFrustum == -1) {
        this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
    } else {
        this.near = this.reader.getFloat(children[indexFrustum], 'near');
        this.far = this.reader.getFloat(children[indexFrustum], 'far');

        if (this.near == null) {
            this.near = 0.1;
            this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
        } else if (this.far == null) {
            this.far = 500;
            this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
        } else if (isNaN(this.near)) {
            this.near = 0.1;
            this.onXMLMinorError("non-numeric value found for near plane; assuming 'near = 0.1'");
        } else if (isNaN(this.far)) {
            this.far = 500;
            this.onXMLMinorError("non-numeric value found for far plane; assuming 'far = 500'");
        } else if (this.near <= 0) {
            this.near = 0.1;
            this.onXMLMinorError("'near' must be positive; assuming 'near = 0.1'");
        }

        if (this.near >= this.far)
            return "'near' must be smaller than 'far'";
    }

    // Checks if at most one translation, three rotations, and one scaling are defined.
    if (initialsNode.getElementsByTagName('translation').length > 1)
        return "no more than one initial translation may be defined";

    if (initialsNode.getElementsByTagName('rotation').length > 3)
        return "no more than three initial rotations may be defined";

    if (initialsNode.getElementsByTagName('scale').length > 1)
        return "no more than one scaling may be defined";

    // Initial transforms.
    this.initialTranslate = [];
    this.initialScaling = [];
    this.initialRotations = [];

    // Gets indices of each element.
    var translationIndex = nodeNames.indexOf("translation");
    var thirdRotationIndex = nodeNames.indexOf("rotation");
    var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
    var firstRotationIndex = nodeNames.lastIndexOf("rotation");
    var scalingIndex = nodeNames.indexOf("scale");

    // Checks if the indices are valid and in the expected order.
    // Translation.
    this.initialTransforms = mat4.create();
    mat4.identity(this.initialTransforms);
    if (translationIndex == -1)
        this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
    else {
        var tx = this.reader.getFloat(children[translationIndex], 'x');
        var ty = this.reader.getFloat(children[translationIndex], 'y');
        var tz = this.reader.getFloat(children[translationIndex], 'z');

        if (tx == null) {
            tx = 0;
            this.onXMLMinorError("failed to parse x-coordinate of initial translation; assuming tx = 0");
        } else if (isNaN(tx)) {
            tx = 0;
            this.onXMLMinorError("found non-numeric value for x-coordinate of initial translation; assuming tx = 0");
        }

        if (ty == null) {
            ty = 0;
            this.onXMLMinorError("failed to parse y-coordinate of initial translation; assuming ty = 0");
        } else if (isNaN(ty)) {
            ty = 0;
            this.onXMLMinorError("found non-numeric value for y-coordinate of initial translation; assuming ty = 0");
        }

        if (tz == null) {
            tz = 0;
            this.onXMLMinorError("failed to parse z-coordinate of initial translation; assuming tz = 0");
        } else if (isNaN(tz)) {
            tz = 0;
            this.onXMLMinorError("found non-numeric value for z-coordinate of initial translation; assuming tz = 0");
        }

        if (translationIndex > thirdRotationIndex || translationIndex > scalingIndex)
            this.onXMLMinorError("initial translation out of order; result may not be as expected");

        mat4.translate(this.initialTransforms, this.initialTransforms, [tx, ty, tz]);
    }

    // Rotations.
    var initialRotations = [];
    initialRotations['x'] = 0;
    initialRotations['y'] = 0;
    initialRotations['z'] = 0;

    var rotationDefined = [];
    rotationDefined['x'] = false;
    rotationDefined['y'] = false;
    rotationDefined['z'] = false;

    var axis;
    var rotationOrder = [];

    // Third rotation (first rotation defined).
    if (thirdRotationIndex != -1) {
        axis = this.reader.getItem(children[thirdRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null) {
            var angle = this.reader.getFloat(children[thirdRotationIndex], 'angle');
            if (angle != null && !isNaN(angle)) {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else this.onXMLMinorError("failed to parse third initial rotation 'angle'");
        }
    }

    // Second rotation.
    if (secondRotationIndex != -1) {
        axis = this.reader.getItem(children[secondRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null) {
            var angle = this.reader.getFloat(children[secondRotationIndex], 'angle');
            if (angle != null && !isNaN(angle)) {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else this.onXMLMinorError("failed to parse second initial rotation 'angle'");
        }
    }

    // First rotation.
    if (firstRotationIndex != -1) {
        axis = this.reader.getItem(children[firstRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null) {
            var angle = this.reader.getFloat(children[firstRotationIndex], 'angle');
            if (angle != null && !isNaN(angle)) {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else this.onXMLMinorError("failed to parse first initial rotation 'angle'");
        }
    }

    // Checks for undefined rotations.
    if (!rotationDefined['x'])
        this.onXMLMinorError("rotation along the Ox axis undefined; assuming Rx = 0");
    else if (!rotationDefined['y'])
        this.onXMLMinorError("rotation along the Oy axis undefined; assuming Ry = 0");
    else if (!rotationDefined['z'])
        this.onXMLMinorError("rotation along the Oz axis undefined; assuming Rz = 0");

    // Updates transform matrix.
    for (var i = 0; i < rotationOrder.length; i++)
        mat4.rotate(this.initialTransforms, this.initialTransforms, DEGREE_TO_RAD * initialRotations[rotationOrder[i]], this.axisCoords[rotationOrder[i]]);

    // Scaling.
    if (scalingIndex == -1)
        this.onXMLMinorError("initial scaling undefined; assuming S = (1, 1, 1)");
    else {
        var sx = this.reader.getFloat(children[scalingIndex], 'sx');
        var sy = this.reader.getFloat(children[scalingIndex], 'sy');
        var sz = this.reader.getFloat(children[scalingIndex], 'sz');

        if (sx == null) {
            sx = 1;
            this.onXMLMinorError("failed to parse x parameter of initial scaling; assuming sx = 1");
        } else if (isNaN(sx)) {
            sx = 1;
            this.onXMLMinorError("found non-numeric value for x parameter of initial scaling; assuming sx = 1");
        }

        if (sy == null) {
            sy = 1;
            this.onXMLMinorError("failed to parse y parameter of initial scaling; assuming sy = 1");
        } else if (isNaN(sy)) {
            sy = 1;
            this.onXMLMinorError("found non-numeric value for y parameter of initial scaling; assuming sy = 1");
        }

        if (sz == null) {
            sz = 1;
            this.onXMLMinorError("failed to parse z parameter of initial scaling; assuming sz = 1");
        } else if (isNaN(sz)) {
            sz = 1;
            this.onXMLMinorError("found non-numeric value for z parameter of initial scaling; assuming sz = 1");
        }

        if (scalingIndex < firstRotationIndex)
            this.onXMLMinorError("initial scaling out of order; result may not be as expected");

        mat4.scale(this.initialTransforms, this.initialTransforms, [sx, sy, sz]);
    }

    // ----------
    // Reference length.
    this.referenceLength = 1;

    var indexReference = nodeNames.indexOf("reference");
    if (indexReference == -1)
        this.onXMLMinorError("reference length undefined; assuming 'length = 1'");
    else {
        // Reads the reference length.
        var length = this.reader.getFloat(children[indexReference], 'length');

        if (length != null) {
            if (isNaN(length))
                this.onXMLMinorError("found non-numeric value for reference length; assuming 'length = 1'");
            else if (length <= 0)
                this.onXMLMinorError("reference length must be a positive value; assuming 'length = 1'");
            else
                this.referenceLength = length;
        } else
            this.onXMLMinorError("unable to parse reference length; assuming 'length = 1'");

    }

    console.log("Parsed initials");

    return null;
}

/**
 * Parses the <ILLUMINATION> block.
 */
MySceneGraph.prototype.parseIllumination = function (illuminationNode) {

    // Reads the ambient and background values.
    var children = illuminationNode.children;
    var nodeNames = [];
    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Retrieves the global ambient illumination.
    this.ambientIllumination = [0, 0, 0, 1];
    var ambientIndex = nodeNames.indexOf("ambient");
    if (ambientIndex != -1) {
        // R.
        var r = this.reader.getFloat(children[ambientIndex], 'r');
        if (r != null) {
            if (isNaN(r))
                return "ambient 'r' is a non numeric value on the ILLUMINATION block";
            else if (r < 0 || r > 1)
                return "ambient 'r' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[0] = r;
        } else
            this.onXMLMinorError("unable to parse R component of the ambient illumination; assuming R = 0");

        // G.
        var g = this.reader.getFloat(children[ambientIndex], 'g');
        if (g != null) {
            if (isNaN(g))
                return "ambient 'g' is a non numeric value on the ILLUMINATION block";
            else if (g < 0 || g > 1)
                return "ambient 'g' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[1] = g;
        } else
            this.onXMLMinorError("unable to parse G component of the ambient illumination; assuming G = 0");

        // B.
        var b = this.reader.getFloat(children[ambientIndex], 'b');
        if (b != null) {
            if (isNaN(b))
                return "ambient 'b' is a non numeric value on the ILLUMINATION block";
            else if (b < 0 || b > 1)
                return "ambient 'b' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[2] = b;
        } else
            this.onXMLMinorError("unable to parse B component of the ambient illumination; assuming B = 0");

        // A.
        var a = this.reader.getFloat(children[ambientIndex], 'a');
        if (a != null) {
            if (isNaN(a))
                return "ambient 'a' is a non numeric value on the ILLUMINATION block";
            else if (a < 0 || a > 1)
                return "ambient 'a' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[3] = a;
        } else
            this.onXMLMinorError("unable to parse A component of the ambient illumination; assuming A = 1");
    } else
        this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0, 0, 0, 1)");

    // Retrieves the background clear color.
    this.background = [0, 0, 0, 1];
    var backgroundIndex = nodeNames.indexOf("background");
    if (backgroundIndex != -1) {
        // R.
        var r = this.reader.getFloat(children[backgroundIndex], 'r');
        if (r != null) {
            if (isNaN(r))
                return "background 'r' is a non numeric value on the ILLUMINATION block";
            else if (r < 0 || r > 1)
                return "background 'r' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[0] = r;
        } else
            this.onXMLMinorError("unable to parse R component of the background colour; assuming R = 0");

        // G.
        var g = this.reader.getFloat(children[backgroundIndex], 'g');
        if (g != null) {
            if (isNaN(g))
                return "background 'g' is a non numeric value on the ILLUMINATION block";
            else if (g < 0 || g > 1)
                return "background 'g' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[1] = g;
        } else
            this.onXMLMinorError("unable to parse G component of the background colour; assuming G = 0");

        // B.
        var b = this.reader.getFloat(children[backgroundIndex], 'b');
        if (b != null) {
            if (isNaN(b))
                return "background 'b' is a non numeric value on the ILLUMINATION block";
            else if (b < 0 || b > 1)
                return "background 'b' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[2] = b;
        } else
            this.onXMLMinorError("unable to parse B component of the background colour; assuming B = 0");

        // A.
        var a = this.reader.getFloat(children[backgroundIndex], 'a');
        if (a != null) {
            if (isNaN(a))
                return "background 'a' is a non numeric value on the ILLUMINATION block";
            else if (a < 0 || a > 1)
                return "background 'a' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[3] = a;
        } else
            this.onXMLMinorError("unable to parse A component of the background colour; assuming A = 1");
    } else
        this.onXMLMinorError("background clear colour undefined; assuming (R, G, B, A) = (0, 0, 0, 1)");

    console.log("Parsed illumination");

    return null;
}

/**
 * Parses the <LIGHTS> node.
 */
MySceneGraph.prototype.parseLights = function (lightsNode) {

    var children = lightsNode.children;

    this.lights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {

        if (children[i].nodeName != "LIGHT") {
            this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current light.
        var lightId = this.reader.getString(children[i], 'id');
        if (lightId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        grandChildren = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            console.log(grandChildren[j].nodeName);
            nodeNames.push(grandChildren[j].nodeName);
        }

        // Gets indices of each element.
        var enableIndex = nodeNames.indexOf("enable");
        var positionIndex = nodeNames.indexOf("position");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        // Light enable/disable
        var enableLight = true;
        if (enableIndex == -1) {
            this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
        } else {
            var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
            if (aux == null) {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
            } else if (isNaN(aux))
                return "'enable value' is a non numeric value on the LIGHTS block";
            else if (aux != 0 && aux != 1)
                return "'enable value' must be 0 or 1 on the LIGHTS block"
            else
                enableLight = aux == 0 ? false : true;
        }

        // Retrieves the light position.
        var positionLight = [];
        if (positionIndex != -1) {
            // x
            var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
            if (x != null) {
                if (isNaN(x))
                    return "'x' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(x);
            } else
                return "unable to parse x-coordinate of the light position for ID = " + lightId;

            // y
            var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
            if (y != null) {
                if (isNaN(y))
                    return "'y' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(y);
            } else
                return "unable to parse y-coordinate of the light position for ID = " + lightId;

            // z
            var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
            if (z != null) {
                if (isNaN(z))
                    return "'z' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(z);
            } else
                return "unable to parse z-coordinate of the light position for ID = " + lightId;

            // w
            var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
            if (w != null) {
                if (isNaN(w))
                    return "'w' is a non numeric value on the LIGHTS block";
                else if (w < 0 || w > 1)
                    return "'w' must be a value between 0 and 1 on the LIGHTS block"
                else
                    positionLight.push(w);
            } else
                return "unable to parse w-coordinate of the light position for ID = " + lightId;
        } else
            return "light position undefined for ID = " + lightId;

        // Retrieves the ambient component.
        var ambientIllumination = [];
        if (ambientIndex != -1) {
            // R
            var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
            if (r != null) {
                if (isNaN(r))
                    return "ambient 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "ambient 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(r);
            } else
                return "unable to parse R component of the ambient illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
            if (g != null) {
                if (isNaN(g))
                    return "ambient 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "ambient 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(g);
            } else
                return "unable to parse G component of the ambient illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
            if (b != null) {
                if (isNaN(b))
                    return "ambient 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "ambient 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(b);
            } else
                return "unable to parse B component of the ambient illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
            if (a != null) {
                if (isNaN(a))
                    return "ambient 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "ambient 'a' must be a value between 0 and 1 on the LIGHTS block"
                ambientIllumination.push(a);
            } else
                return "unable to parse A component of the ambient illumination for ID = " + lightId;
        } else
            return "ambient component undefined for ID = " + lightId;

        // Retrieves the diffuse component
        var diffuseIllumination = [];
        if (diffuseIndex != -1) {
            // R
            var r = this.reader.getFloat(grandChildren[diffuseIndex], 'r');
            if (r != null) {
                if (isNaN(r))
                    return "diffuse 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "diffuse 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(r);
            } else
                return "unable to parse R component of the diffuse illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[diffuseIndex], 'g');
            if (g != null) {
                if (isNaN(g))
                    return "diffuse 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "diffuse 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(g);
            } else
                return "unable to parse G component of the diffuse illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[diffuseIndex], 'b');
            if (b != null) {
                if (isNaN(b))
                    return "diffuse 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "diffuse 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(b);
            } else
                return "unable to parse B component of the diffuse illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[diffuseIndex], 'a');
            if (a != null) {
                if (isNaN(a))
                    return "diffuse 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "diffuse 'a' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(a);
            } else
                return "unable to parse A component of the diffuse illumination for ID = " + lightId;
        } else
            return "diffuse component undefined for ID = " + lightId;

        // Retrieves the specular component
        var specularIllumination = [];
        if (specularIndex != -1) {
            // R
            var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
            if (r != null) {
                if (isNaN(r))
                    return "specular 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "specular 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(r);
            } else
                return "unable to parse R component of the specular illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
            if (g != null) {
                if (isNaN(g))
                    return "specular 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "specular 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(g);
            } else
                return "unable to parse G component of the specular illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
            if (b != null) {
                if (isNaN(b))
                    return "specular 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "specular 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(b);
            } else
                return "unable to parse B component of the specular illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
            if (a != null) {
                if (isNaN(a))
                    return "specular 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "specular 'a' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(a);
            } else
                return "unable to parse A component of the specular illumination for ID = " + lightId;
        } else
            return "specular component undefined for ID = " + lightId;

        // Light global information.
        this.lights[lightId] = [enableLight, positionLight, ambientIllumination, diffuseIllumination, specularIllumination];
        numLights++;
    }

    if (numLights == 0)
        return "at least one light must be defined";
    else if (numLights > 8)
        this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

    console.log("Parsed lights");

    return null;
}

/**
 * Parses the <TEXTURES> block.
 */
MySceneGraph.prototype.parseTextures = function (texturesNode) {

    this.textures = [];

    var eachTexture = texturesNode.children;
    // Each texture.

    var oneTextureDefined = false;

    for (var i = 0; i < eachTexture.length; i++) {
        var nodeName = eachTexture[i].nodeName;
        if (nodeName == "TEXTURE") {
            // Retrieves texture ID.
            var textureID = this.reader.getString(eachTexture[i], 'id');
            if (textureID == null)
                return "failed to parse texture ID";
            // Checks if ID is valid.
            if (this.textures[textureID] != null)
                return "texture ID must unique (conflict with ID = " + textureID + ")";

            var texSpecs = eachTexture[i].children;
            var filepath = null;
            var amplifFactorS = null;
            var amplifFactorT = null;
            // Retrieves texture specifications.
            for (var j = 0; j < texSpecs.length; j++) {
                var name = texSpecs[j].nodeName;
                if (name == "file") {
                    if (filepath != null)
                        return "duplicate file paths in texture with ID = " + textureID;

                    filepath = this.reader.getString(texSpecs[j], 'path');
                    if (filepath == null)
                        return "unable to parse texture file path for ID = " + textureID;
                } else if (name == "amplif_factor") {
                    if (amplifFactorS != null || amplifFactorT != null)
                        return "duplicate amplification factors in texture with ID = " + textureID;

                    amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
                    amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

                    if (amplifFactorS == null || amplifFactorT == null)
                        return "unable to parse texture amplification factors for ID = " + textureID;
                    else if (isNaN(amplifFactorS))
                        return "'amplifFactorS' is a non numeric value";
                    else if (isNaN(amplifFactorT))
                        return "'amplifFactorT' is a non numeric value";
                    else if (amplifFactorS <= 0 || amplifFactorT <= 0)
                        return "value for amplifFactor must be positive";
                } else
                    this.onXMLMinorError("unknown tag name <" + name + ">");
            }

            if (filepath == null)
                return "file path undefined for texture with ID = " + textureID;
            else if (amplifFactorS == null)
                return "s amplification factor undefined for texture with ID = " + textureID;
            else if (amplifFactorT == null)
                return "t amplification factor undefined for texture with ID = " + textureID;

            var texture = new CGFtexture(this.scene, "./scenes/" + filepath);

            this.textures[textureID] = [texture, amplifFactorS, amplifFactorT];

            if(textureID == "number_0" ||
               textureID == "number_1" ||
               textureID == "number_2" ||
               textureID == "number_3" ||
               textureID == "number_4" ||
               textureID == "number_5" ||
               textureID == "number_6" ||
               textureID == "number_7" ||
               textureID == "number_8" ||
               textureID == "number_9")
                this.clockTextures.push(textureID);

            oneTextureDefined = true;
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName + ">");
    }

    if (!oneTextureDefined)
        return "at least one texture must be defined in the TEXTURES block";

    console.log("Parsed textures");
}

/**
 * Parses the <MATERIALS> node.
 */
MySceneGraph.prototype.parseMaterials = function (materialsNode) {

    var children = materialsNode.children;
    // Each material.

    this.materials = [];

    var oneMaterialDefined = false;

    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName != "MATERIAL") {
            this.onXMLMinorError("unknown tag name <" + children[i].nodeName + ">");
            continue;
        }

        var materialID = this.reader.getString(children[i], 'id');
        if (materialID == null)
            return "no ID defined for material";

        if (this.materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";

        var materialSpecs = children[i].children;

        var nodeNames = [];

        for (var j = 0; j < materialSpecs.length; j++)
            nodeNames.push(materialSpecs[j].nodeName);

        // Determines the values for each field.
        // Shininess.
        var shininessIndex = nodeNames.indexOf("shininess");
        if (shininessIndex == -1)
            return "no shininess value defined for material with ID = " + materialID;
        var shininess = this.reader.getFloat(materialSpecs[shininessIndex], 'value');
        if (shininess == null)
            return "unable to parse shininess value for material with ID = " + materialID;
        else if (isNaN(shininess))
            return "'shininess' is a non numeric value";
        else if (shininess <= 0)
            return "'shininess' must be positive";

        // Specular component.
        var specularIndex = nodeNames.indexOf("specular");
        if (specularIndex == -1)
            return "no specular component defined for material with ID = " + materialID;
        var specularComponent = [];
        // R.
        var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');

        if (r == null)
            return "unable to parse R component of specular reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "specular 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
        specularComponent.push(r);
        // G.
        var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');

        if (g == null)
            return "unable to parse G component of specular reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "specular 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(g);
        // B.

        var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');

        if (b == null)
            return "unable to parse B component of specular reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "specular 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(b);
        // A.
        var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
        if (a == null)
            return "unable to parse A component of specular reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "specular 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(a);

        // Diffuse component.
        var diffuseIndex = nodeNames.indexOf("diffuse");
        if (diffuseIndex == -1)
            return "no diffuse component defined for material with ID = " + materialID;
        var diffuseComponent = [];
        // R.

        r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');

        if (r == null)
            return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "diffuse 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
        if (g == null)
            return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "diffuse 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');

        if (b == null)
            return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "diffuse 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
        if (a == null)
            return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "diffuse 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(a);

        // Ambient component.
        var ambientIndex = nodeNames.indexOf("ambient");
        if (ambientIndex == -1)
            return "no ambient component defined for material with ID = " + materialID;
        var ambientComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
        if (r == null)
            return "unable to parse R component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "ambient 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');

        if (g == null)
            return "unable to parse G component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "ambient 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');

        if (b == null)
            return "unable to parse B component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "ambient 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
        if (a == null)
            return "unable to parse A component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "ambient 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(a);

        // Emission component.
        var emissionIndex = nodeNames.indexOf("emission");
        if (emissionIndex == -1)
            return "no emission component defined for material with ID = " + materialID;
        var emissionComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
        if (r == null)
            return "unable to parse R component of emission for material with ID = " + materialID;
        else if (isNaN(r))
            return "emisson 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
        if (g == null)
            return "unable to parse G component of emission for material with ID = " + materialID;
        if (isNaN(g))
            return "emisson 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
        if (b == null)
            return "unable to parse B component of emission for material with ID = " + materialID;
        else if (isNaN(b))
            return "emisson 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
        if (a == null)
            return "unable to parse A component of emission for material with ID = " + materialID;
        else if (isNaN(a))
            return "emisson 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(a);

        // Creates material with the specified characteristics.
        var newMaterial = new CGFappearance(this.scene);
        newMaterial.setShininess(shininess);
        newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
        newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
        newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
        newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
        this.materials[materialID] = newMaterial;
        oneMaterialDefined = true;
    }

    if (!oneMaterialDefined)
        return "at least one material must be defined on the MATERIALS block";

    // Generates a default material.
    this.generateDefaultMaterial();

    console.log("Parsed materials");
}

/**
 * Parses the <ANIMATIONS> block.
 */
MySceneGraph.prototype.parseAnimations = function (animsNode) {
    var children = animsNode.children;

    this.anims = [];
    this.animsCreated = [];
    var numAnims = 0;

    var grandChildren = [];
    var cps = [];

    // Any number of animations.
    for (var i = 0; i < children.length; i++) {

        if (children[i].nodeName != "ANIMATION") {
            this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current animation.
        var animID = this.reader.getString(children[i], 'id');
        if (animID == null)
            return "no ID defined for animation";

        // Checks for repeated IDs.
        if (this.anims[animID] != null)
            return "ID must be unique for each light (conflict: ID = " + animID + ")";

        // Get type of the current animation.
        var type = this.reader.getItem(children[i], 'type', ['linear', 'circular', 'bezier', 'combo']);
        if (type != null)
            this.log("   Animation: " + type);
        else
            this.warn("Error in animation");

        if (type != 'combo') {
            // Get speed of the current animation.
            var animSpeed = this.reader.getFloat(children[i], 'speed');
            if (animSpeed == null)
                return "no SPEED defined for animation";
            else if (isNaN(animSpeed))
                return "'animSpeed' is a non numeric value on the ANIMATIONS block";

        } else {

            grandChildren = children[i].children;

            cps = [];
            var numberOfCP = 0;
            for (var j = 0; j < grandChildren.length; j++) {
                if (grandChildren[j].nodeName != "SPANREF") {
                    this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                    continue;
                }
                // Get id of the current spanref.
                var spanId = this.reader.getString(grandChildren[j], 'id');
                if (spanId == null)
                    return "no ID defined for spanref in combo animation";

                // Checks if exist the ID.
                if (this.animsCreated[spanId] == null)
                    return "ID " + spanId + " doesn't exist";

                if (this.animsCreated[spanId][0] == 'combo')
                    return "Combo Animations can't have combo animations"

                numberOfCP++;
                cps.push(this.animsCreated[spanId]);
            }

            if (numberOfCP == 0)
                return "at least one SPANREF must be defined";
            else {
                this.anims[animID] = [type, cps];
                this.animsCreated[animID] = new ComboAnimation(this, this.anims[animID]);
                numAnims++;
                continue;
            }

        }

        if (type == 'circular') {
            // Get centerx of the current animation.
            var centerx = this.reader.getFloat(children[i], 'centerx');
            if (centerx == null)
                return "no centerx defined for animation";
            else if (isNaN(centerx))
                return "'centerx' is a non numeric value on the ANIMATIONS block";

            // Get centery of the current animation.
            var centery = this.reader.getFloat(children[i], 'centery');
            if (centery == null)
                return "no centery defined for animation";
            else if (isNaN(centery))
                return "'centery' is a non numeric value on the ANIMATIONS block";

            // Get centerz of the current animation.
            var centerz = this.reader.getFloat(children[i], 'centerz');
            if (centerz == null)
                return "no centerz defined for animation";
            else if (isNaN(centerz))
                return "'centerz' is a non numeric value on the ANIMATIONS block";

            // Get radius of the current animation.
            var radius = this.reader.getFloat(children[i], 'radius');
            if (radius == null)
                return "no radius defined for animation";
            else if (isNaN(radius))
                return "'radius' is a non numeric value on the ANIMATIONS block";

            // Get startang of the current animation.
            var startang = this.reader.getFloat(children[i], 'startang');
            if (startang == null)
                return "no startang defined for animation";
            else if (isNaN(startang))
                return "'startang' is a non numeric value on the ANIMATIONS block";

            // Get rotang of the current animation.
            var rotang = this.reader.getFloat(children[i], 'rotang');
            if (rotang == null)
                return "no rotang defined for animation";
            else if (isNaN(rotang))
                return "'rotang' is a non numeric value on the ANIMATIONS block";

            this.anims[animID] = [type, animSpeed, centerx, centery, centerz, radius,
              startang * DEGREE_TO_RAD, rotang * DEGREE_TO_RAD];
            this.animsCreated[animID] = new CircularAnimation(this, this.anims[animID]);
            numAnims++;
            continue;
        }


        grandChildren = children[i].children;

        cps = [];
        var numberOfCP = 0;
        for (var j = 0; j < grandChildren.length; j++) {
            if (grandChildren[j].nodeName != "controlpoint") {
                this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                continue;
            }
            // Get xx of the current controlpoint.
            var xx = this.reader.getFloat(grandChildren[j], 'xx');
            if (xx == null)
                return "no xx defined for animation";
            else if (isNaN(xx))
                return "'xx' is a non numeric value on the controlpoint of ANIMATIONS block";

            // Get yy of the current controlpoint.
            var yy = this.reader.getFloat(grandChildren[j], 'yy');
            if (yy == null)
                return "no yy defined for animation";
            else if (isNaN(yy))
                return "'yy' is a non numeric value on the controlpoint of ANIMATIONS block";

            // Get zz of the current controlpoint.
            var zz = this.reader.getFloat(grandChildren[j], 'zz');
            if (zz == null)
                return "no zz defined for animation";
            else if (isNaN(zz))
                return "'zz' is a non numeric value on the controlpoint of ANIMATIONS block";

            numberOfCP++;
            var coord = [xx, yy, zz];
            cps.push(coord);
        }

        if (type == 'linear' && numberOfCP < 2)
            return "Needs at least to 2 controlpoints for linear Animation";
        else if (type == 'bezier' && numberOfCP != 4)
            return "Bezier Animation has to have precisely 4 controlpoints";
        else {
            this.anims[animID] = [type, animSpeed, cps];
            if (type == 'linear')
                this.animsCreated[animID] = new LinearAnimation(this, this.anims[animID]);
            else if (type == 'bezier')
                this.animsCreated[animID] = new BezierAnimation(this, this.anims[animID]);
            numAnims++;
        }

    }

    console.log("Parsed animations");

    return null;

}

/**
 * Parses the <NODES> block.
 */
MySceneGraph.prototype.parseNodes = function (nodesNode) {
    this.animRefs = [];
    // Traverses nodes.
    var children = nodesNode.children;

    for (var i = 0; i < children.length; i++) {
        var nodeName;
        if ((nodeName = children[i].nodeName) == "ROOT") {
            // Retrieves root node.
            if (this.idRoot != null)
                return "there can only be one root node";
            else {
                var root = this.reader.getString(children[i], 'id');
                if (root == null)
                    return "failed to retrieve root node ID";
                this.idRoot = root;
            }
        } else if (nodeName == "NODE") {
            // Retrieves node ID.
            var nodeID = this.reader.getString(children[i], 'id');

            if (nodeID == null)
                return "failed to retrieve node ID";
            // Checks if ID is valid.
            if (this.nodes[nodeID] != null)
                return "node ID must be unique (conflict: ID = " + nodeID + ")";

            var nodeShader = this.reader.getBoolean(children[i], 'selectable', false);

            if (nodeShader) {
                this.selectables.push(nodeID);
                console.log(nodeID + " is a selectable node for shader");
            }

            this.log("Processing node " + nodeID);

            // Creates node.
            this.nodes[nodeID] = new MyGraphNode(this, nodeID);

            // Gathers child nodes.
            var nodeSpecs = children[i].children;
            var specsNames = [];
            var possibleValues = ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "ANIMATIONREFS", "DESCENDANTS"];
            for (var j = 0; j < nodeSpecs.length; j++) {
                var name = nodeSpecs[j].nodeName;
                specsNames.push(nodeSpecs[j].nodeName);

                // Warns against possible invalid tag names.
                if (possibleValues.indexOf(name) == -1)
                    this.onXMLMinorError("unknown tag <" + name + ">");
            }

            // Retrieves material ID.
            var materialIndex = specsNames.indexOf("MATERIAL");
            if (materialIndex == -1)
                return "material must be defined (node ID = " + nodeID + ")";
            var materialID = this.reader.getString(nodeSpecs[materialIndex], 'id');
            if (materialID == null)
                return "unable to parse material ID (node ID = " + nodeID + ")";
            if (materialID != "null" && this.materials[materialID] == null)
                return "ID does not correspond to a valid material (node ID = " + nodeID + ")";

            this.nodes[nodeID].materialID = materialID;

            // Retrieves texture ID.
            var textureIndex = specsNames.indexOf("TEXTURE");
            if (textureIndex == -1)
                return "texture must be defined (node ID = " + nodeID + ")";
            var textureID = this.reader.getString(nodeSpecs[textureIndex], 'id');
            if (textureID == null)
                return "unable to parse texture ID (node ID = " + nodeID + ")";
            if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null)
                return "ID does not correspond to a valid texture (node ID = " + nodeID + ")";

            this.nodes[nodeID].textureID = textureID;

            // Retrieves possible transformations.
            for (var j = 0; j < nodeSpecs.length; j++) {
                switch (nodeSpecs[j].nodeName) {
                    case "TRANSLATION":
                        // Retrieves translation parameters.
                        var x = this.reader.getFloat(nodeSpecs[j], 'x');
                        if (x == null) {
                            this.onXMLMinorError("unable to parse x-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(x))
                            return "non-numeric value for x-coordinate of translation (node ID = " + nodeID + ")";

                        var y = this.reader.getFloat(nodeSpecs[j], 'y');
                        if (y == null) {
                            this.onXMLMinorError("unable to parse y-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(y))
                            return "non-numeric value for y-coordinate of translation (node ID = " + nodeID + ")";

                        var z = this.reader.getFloat(nodeSpecs[j], 'z');
                        if (z == null) {
                            this.onXMLMinorError("unable to parse z-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(z))
                            return "non-numeric value for z-coordinate of translation (node ID = " + nodeID + ")";

                        mat4.translate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [x, y, z]);
                        break;
                    case "ROTATION":
                        // Retrieves rotation parameters.
                        var axis = this.reader.getItem(nodeSpecs[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null) {
                            this.onXMLMinorError("unable to parse rotation axis; discarding transform");
                            break;
                        }
                        var angle = this.reader.getFloat(nodeSpecs[j], 'angle');
                        if (angle == null) {
                            this.onXMLMinorError("unable to parse rotation angle; discarding transform");
                            break;
                        } else if (isNaN(angle))
                            return "non-numeric value for rotation angle (node ID = " + nodeID + ")";

                        mat4.rotate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                    case "SCALE":
                        // Retrieves scale parameters.
                        var sx = this.reader.getFloat(nodeSpecs[j], 'sx');
                        if (sx == null) {
                            this.onXMLMinorError("unable to parse x component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sx))
                            return "non-numeric value for x component of scaling (node ID = " + nodeID + ")";

                        var sy = this.reader.getFloat(nodeSpecs[j], 'sy');
                        if (sy == null) {
                            this.onXMLMinorError("unable to parse y component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sy))
                            return "non-numeric value for y component of scaling (node ID = " + nodeID + ")";

                        var sz = this.reader.getFloat(nodeSpecs[j], 'sz');
                        if (sz == null) {
                            this.onXMLMinorError("unable to parse z component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sz))
                            return "non-numeric value for z component of scaling (node ID = " + nodeID + ")";

                        mat4.scale(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [sx, sy, sz]);
                        break;
                    default:
                        break;
                }
            }

            // Retrieves information about animations.
            var animationsIndex = specsNames.indexOf("ANIMATIONREFS");
            if (animationsIndex != -1) {
                var animR = [];
                var animations = nodeSpecs[animationsIndex].children;

                for (var j = 0; j < animations.length; j++) {
                    if (animations[j].nodeName == "ANIMATIONREF") {

                        var animId = this.reader.getString(animations[j], 'id');

                        this.log("   Animation: " + animId);

                        if (animId == null)
                            this.onXMLMinorError("unable to parse animation ref id");
                        else if (animId == nodeID)
                            return "a node may not be a child of its own";
                        else {
                            animR.push(this.animsCreated[animId]);

                        }
                    }
                }
                var animHolder = new AnimationsOfNode(this, animR);
                this.animRefs.push(animHolder);
                this.nodes[nodeID].addAnimation(this.animRefs[this.animRefs.length - 1]);
            }




            // Retrieves information about children.
            var descendantsIndex = specsNames.indexOf("DESCENDANTS");
            if (descendantsIndex == -1)
                return "an intermediate node must have descendants";

            var descendants = nodeSpecs[descendantsIndex].children;

            var sizeChildren = 0;
            for (var j = 0; j < descendants.length; j++) {
                if (descendants[j].nodeName == "NODEREF") {

                    var curId = this.reader.getString(descendants[j], 'id');

                    this.log("   Descendant: " + curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse descendant id");
                    else if (curId == nodeID)
                        return "a node may not be a child of its own";
                    else {
                        this.nodes[nodeID].addChild(curId);
                        sizeChildren++;
                    }

                } else
                if (descendants[j].nodeName == "LEAF") {
                    var type = this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'patch']);

                    if (type != null)
                        this.log("   Leaf: " + type);
                    else
                        this.warn("Error in leaf");

                    if (type == "patch") {
                        if ((error = this.parsePatch(descendants[j])) != null)
                            return error;
                        if (this.patchesid == null)
                            this.patchesid = 0;
                        else
                            this.patchesid++;

                        this.nodes[nodeID].addLeaf(new MyGraphLeaf(this, descendants[j], this.patches[this.patchesid]));

                    } else
                        this.nodes[nodeID].addLeaf(new MyGraphLeaf(this, descendants[j]));
                    sizeChildren++;
                } else
                    this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName);
    }

    console.log("Parsed nodes");

    return null;
}

/**
 * Parses the Patch block.
 */
MySceneGraph.prototype.parsePatch = function (nodesNode) {
    // Traverses nodes.
    var cplines = nodesNode.children;
    var controlVert = [];
    for (var i = 0; i < cplines.length; i++) {
        var nodeName;
        var cpline = [];
        //parse CPLINE
        if ((nodeName = cplines[i].nodeName) == "CPLINE") {
            //  var cpl = [];
            var cpoints = cplines[i].children;

            for (var j = 0; j < cpoints.length; j++) {
                //parse CPOINT
                if ((nodeName1 = cpoints[j].nodeName) == "CPOINT") {

                    var x = this.reader.getFloat(cpoints[j], 'xx');
                    if (x == null) {
                        this.onXMLMinorError("unable to parse XX; discarding CPOINT");
                        break;
                    } else if (isNaN(x))
                        return "non-numeric value for X (in Patch CPOINT)";

                    var y = this.reader.getFloat(cpoints[j], 'yy');
                    if (y == null) {
                        this.onXMLMinorError("unable to parse YY; discarding CPOINT");
                        break;
                    } else if (isNaN(y))
                        return "non-numeric value for Y (in Patch CPOINT)";

                    var z = this.reader.getFloat(cpoints[j], 'zz');
                    if (z == null) {
                        this.onXMLMinorError("unable to parse ZZ; discarding CPOINT");
                        break;
                    } else if (isNaN(z))
                        return "non-numeric value for Z (in Patch CPOINT)";

                    var w = this.reader.getFloat(cpoints[j], 'ww');
                    if (w == null) {
                        this.onXMLMinorError("unable to parse WW; discarding CPOINT");
                        break;
                    } else if (isNaN(w))
                        return "non-numeric value for W (in Patch CPOINT)";


                    var cpointVec = [x, y, z, w];
                    cpline.push(cpointVec);

                } else
                    this.onXMLMinorError("unknown tag name <" + nodeName);
            }
            controlVert.push(cpline);
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName);
        //controlVert.push(cpl);
    }
    this.patches.push(controlVert);
    console.log("Parsed Patch");
    return null;
}

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function (message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
}

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 */
MySceneGraph.prototype.onXMLMinorError = function (message) {
    console.warn("Warning: " + message);
}

MySceneGraph.prototype.log = function (message) {
    console.log("   " + message);
}

/**
 * Generates a default material, with a random name. This material will be passed onto the root node, which
 * may override it.
 */
MySceneGraph.prototype.generateDefaultMaterial = function () {
    var materialDefault = new CGFappearance(this.scene);
    materialDefault.setShininess(1);
    materialDefault.setSpecular(0, 0, 0, 1);
    materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
    materialDefault.setAmbient(0, 0, 0, 1);
    materialDefault.setEmission(0, 0, 0, 1);

    // Generates random material ID not currently in use.
    this.defaultMaterialID = null;
    do this.defaultMaterialID = MySceneGraph.generateRandomString(5);
    while (this.materials[this.defaultMaterialID] != null);

    this.materials[this.defaultMaterialID] = materialDefault;
}

/**
 * Generates a random string of the specified length.
 */
MySceneGraph.generateRandomString = function (length) {
    // Generates an array of random integer ASCII codes of the specified length
    // and returns a string of the specified length.
    var numbers = [];
    for (var i = 0; i < length; i++)
        numbers.push(Math.floor(Math.random() * 256)); // Random ASCII code.

    return String.fromCharCode.apply(null, numbers);
}

/**
 * Generates a map of the piece node to the position
 */
MySceneGraph.prototype.createMapOfPieces = function () {
  this.piecesMap = new Map();

  this.piecesMap.set("circle1_yellow", "y9");
  this.piecesMap.set("circle2_yellow", "y8");
  this.piecesMap.set("circle3_yellow", "y7");
  this.piecesMap.set("circle4_yellow", "y6");
  this.piecesMap.set("circle5_yellow", "y5");
  this.piecesMap.set("circle6_yellow", "y4");
  this.piecesMap.set("circle7_yellow", "y3");
  this.piecesMap.set("circle8_yellow", "y2");
  this.piecesMap.set("circle9_yellow", "y1");

  this.piecesMap.set("circle1_green", "g9");
  this.piecesMap.set("circle2_green", "g8");
  this.piecesMap.set("circle3_green", "g7");
  this.piecesMap.set("circle4_green", "g6");
  this.piecesMap.set("circle5_green", "g5");
  this.piecesMap.set("circle6_green", "g4");
  this.piecesMap.set("circle7_green", "g3");
  this.piecesMap.set("circle8_green", "g2");
  this.piecesMap.set("circle9_green", "g1");

  this.piecesMap.set("square1_blue", "b9");
  this.piecesMap.set("square2_blue", "b8");
  this.piecesMap.set("square3_blue", "b7");
  this.piecesMap.set("square4_blue", "b6");
  this.piecesMap.set("square5_blue", "b5");
  this.piecesMap.set("square6_blue", "b4");
  this.piecesMap.set("square7_blue", "b3");
  this.piecesMap.set("square8_blue", "b2");
  this.piecesMap.set("square9_blue", "b1");

  this.piecesMap.set("square1_red", "r9");
  this.piecesMap.set("square2_red", "r8");
  this.piecesMap.set("square3_red", "r7");
  this.piecesMap.set("square4_red", "r6");
  this.piecesMap.set("square5_red", "r5");
  this.piecesMap.set("square6_red", "r4");
  this.piecesMap.set("square7_red", "r3");
  this.piecesMap.set("square8_red", "r2");
  this.piecesMap.set("square9_red", "r1");

}

/**
 * Generates a map of the position to the position coordinates
 */
MySceneGraph.prototype.createMapOfCoord = function () {
  this.positionsMap = new Map();

  this.positionsMap.set("y9", vec3.fromValues(4,0,9.05));
  this.positionsMap.set("y8", vec3.fromValues(1.35,0,9.05));
  this.positionsMap.set("y7", vec3.fromValues(-1.3,0,9.05));
  this.positionsMap.set("y6", vec3.fromValues(-3.95,0,9.05));
  this.positionsMap.set("y5", vec3.fromValues(2.65,0,6.85));
  this.positionsMap.set("y4", vec3.fromValues(0,0,6.85));
  this.positionsMap.set("y3", vec3.fromValues(-2.65,0,6.85));
  this.positionsMap.set("y2", vec3.fromValues(1.3,0,4.65));
  this.positionsMap.set("y1", vec3.fromValues(-1.35,0,4.65));
  this.positionsMap.set("y0", vec3.fromValues(0,0,2.3));


  this.positionsMap.set("g9", vec3.fromValues(-4,0,-9.05));
  this.positionsMap.set("g8", vec3.fromValues(-1.35,0,-9.05));
  this.positionsMap.set("g7", vec3.fromValues(1.3,0,-9.05));
  this.positionsMap.set("g6", vec3.fromValues(3.95,0,-9.05));
  this.positionsMap.set("g5", vec3.fromValues(-2.65,0,-6.85));
  this.positionsMap.set("g4", vec3.fromValues(0,0,-6.85));
  this.positionsMap.set("g3", vec3.fromValues(2.65,0,-6.85));
  this.positionsMap.set("g2", vec3.fromValues(-1.3,0,-4.65));
  this.positionsMap.set("g1", vec3.fromValues(1.35,0,-4.65));
  this.positionsMap.set("g0", vec3.fromValues(0,0,-2.3));


  this.positionsMap.set("b9", vec3.fromValues(-9.05,0,4));
  this.positionsMap.set("b8", vec3.fromValues(-9.05,0,1.35));
  this.positionsMap.set("b7", vec3.fromValues(-9.05,0,-1.2));
  this.positionsMap.set("b6", vec3.fromValues(-9.05,0,-3.95));
  this.positionsMap.set("b5", vec3.fromValues(-6.85,0,2.65));
  this.positionsMap.set("b4", vec3.fromValues(-6.85,0,0));
  this.positionsMap.set("b3", vec3.fromValues(-6.85,0,-2.65));
  this.positionsMap.set("b2", vec3.fromValues(-4.65,0,1.3));
  this.positionsMap.set("b1", vec3.fromValues(-4.65,0,-1.35));
  this.positionsMap.set("b0", vec3.fromValues(-2.3,0,0));

  this.positionsMap.set("r9", vec3.fromValues(9.05,0,-4));
  this.positionsMap.set("r8", vec3.fromValues(9.05,0,-1.55));
  this.positionsMap.set("r7", vec3.fromValues(9.05,0,1.3));
  this.positionsMap.set("r6", vec3.fromValues(9.05,0,3.95));
  this.positionsMap.set("r5", vec3.fromValues(6.85,0,-2.5));
  this.positionsMap.set("r4", vec3.fromValues(6.85,0,0));
  this.positionsMap.set("r3", vec3.fromValues(6.85,0,2.65));
  this.positionsMap.set("r2", vec3.fromValues(4.65,0,-1.3));
  this.positionsMap.set("r1", vec3.fromValues(4.65,0,1.35));
  this.positionsMap.set("r0", vec3.fromValues(2.3,0,0));

  this.positionsMap.set("mid", vec3.fromValues(0,0,0));
  this.positionsMap.set("y_out", vec3.fromValues(7.95,0,7.95));
  this.positionsMap.set("g_out", vec3.fromValues(-7.95,0,-7.95));
  this.positionsMap.set("b_out", vec3.fromValues(-7.95,0,7.95));
  this.positionsMap.set("r_out", vec3.fromValues(7.95,0,-7.95));
}

/**
 * Adds an animation to a piece to change position
 */
MySceneGraph.prototype.movePiece = function (pos1, pos2) {
  let nodePos1;
  for (var [key, value] of this.piecesMap) {
    if(value == pos1){
      nodePos1 = key;
      break;
    }
  }
  this.piecesMap.delete(nodePos1);
  this.piecesMap.set(nodePos1, pos2);

  let coordPos1 = vec3.create();
  coordPos1 = this.positionsMap.get(pos1);
  let coordPos2 = vec3.create();
//  coordPos2 = this.positionsMap.get(pos2);
  vec3.subtract(coordPos2, this.positionsMap.get(pos2), this.positionsMap.get(pos1));
  let animation = new BezierAnimation(this, ["bezier", "3", [[0,0,0], [0,5,0], [coordPos2[0],5,coordPos2[2]],coordPos2]]);
  console.log(coordPos2);
  if(this.nodes[nodePos1].anim == null){

    var animHolder = new AnimationsOfNode(this, [animation]);
    this.animRefs.push(animHolder);
    this.nodes[nodePos1].addAnimation(this.animRefs[this.animRefs.length - 1]);
  } else {
    this.nodes[nodePos1].anim.addAnimationAfter(animation);
  }

}

/**
 * Adds an animation to a piece to change position
 */
MySceneGraph.prototype.removePiece = function (pos) {
  let nodePos;
  for (var [key, value] of this.piecesMap) {
    if(value == pos){
      nodePos = key;
      break;
    }
  }
  let colors=["y", "g", "r", "b"];
  let color;
  switch(nodePos.length){
    case 14: //yellow
      color = 0;
      break;
    case 13: //green
      color = 1;
      break;
    case 12: //blue
      color = 2;
      break;
    case 11: //red
      color = 3;
      break;
  }

  let nodePos2 = colors[color] + "_out";
  this.piecesMap.delete(nodePos);
  this.piecesMap.set(nodePos, nodePos2);


  let coordPos2 = vec3.create();
//  coordPos2 = this.positionsMap.get(pos2);
  vec3.subtract(coordPos2, this.positionsMap.get(nodePos2), this.positionsMap.get(pos));
  coordPos2[1] = 0.3*this.scene.piecesOut[color];
  let animation = new BezierAnimation(this, ["bezier", "3", [[0,0,0],
      [0,5+coordPos2[1],0], [coordPos2[0],5+coordPos2[1],coordPos2[2]],coordPos2]]);
  console.log(coordPos2);
  if(this.nodes[nodePos].anim == null){

    var animHolder = new AnimationsOfNode(this, [animation]);
    this.animRefs.push(animHolder);
    this.nodes[nodePos].addAnimation(this.animRefs[this.animRefs.length - 1]);
  } else {
    this.nodes[nodePos].anim.addAnimationAfter(animation);
  }

  this.scene.piecesOut[color]++;
}



/**
 * Displays the scene, processing each node, starting in the root node.
 */
MySceneGraph.prototype.displayScene = function () {

    this.displayNodes(this.idRoot, null, null);


}

MySceneGraph.prototype.displayNodes = function (id, matToApply, texToApply) {

    var selected;

    if (this.materials[this.nodes[id].materialID] != null)
        matToApply = this.materials[this.nodes[id].materialID];

    if (this.textures[this.nodes[id].textureID] == "clear")
        texToApply = null;
    else if (this.textures[this.nodes[id].textureID] != null)
        texToApply = this.textures[this.nodes[id].textureID];

    this.scene.pushMatrix();

    if (id == this.selectables[this.useSelectable]) {
        selected = true;
    } else {
      selected = false;
    }

    this.scene.multMatrix(this.nodes[id].transformMatrix);

    if (this.nodes[id].anim != null) {
      this.scene.multMatrix(this.nodes[id].anim.matrix);
      if(this.scene.playing && this.nodes[id].anim.isFinished && this.nodes[id].anim.notChanged){
        mat4.multiply(this.nodes[id].transformMatrix, this.nodes[id].transformMatrix, this.nodes[id].anim.matrix);
        mat4.identity(this.nodes[id].anim.oldMatrix);
        mat4.identity(this.nodes[id].anim.matrix);
        this.nodes[id].anim.notChanged = false;
      }
    }

    if(selected)
      this.scene.setActiveShader(this.scene.testShaders[this.scene.selectedShaderIndex]);

    for (var i = 0; i < this.nodes[id].children.length; i++)
        this.displayNodes(this.nodes[id].children[i], matToApply, texToApply, selected);

    for (var i = 0; i < this.nodes[id].leaves.length; i++) {

        matToApply.apply();
        if (texToApply != null) {

            this.nodes[id].leaves[i].primitive.assignTexture();
            texToApply[0].bind();
        }

        this.nodes[id].leaves[i].primitive.display();
    }

    this.scene.popMatrix();

    if(selected)
      this.scene.setActiveShader(this.scene.defaultShader);

}
