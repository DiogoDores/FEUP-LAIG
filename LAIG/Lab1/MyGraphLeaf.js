/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem) {

    var type=graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);

    this.element = xmlelem;

    console.log(type);
    
}

