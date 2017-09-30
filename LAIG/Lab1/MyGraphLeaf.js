/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem) {

    var type = graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);
    parseLeafs(type);
    
}

MyGraphLeaf.prototype.parseLeafs = function(){

    console.log("cona1");

    if(type = "rectangle")
        console.log("cona");

}

