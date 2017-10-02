/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem) {
    this.graph = graph;
    var type=graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);

    this.element = xmlelem;

    console.log(type);

    this.parseLeafs();
    
}

MyGraphLeaf.prototype.parseLeafs = function(){
    ///witch(this.type){
        //case triangle:
            this.primitive = new MyTriangle(this.graph.scene, 0,0, 0, 1,0,0, 0,1,0);
    //}
}

MyGraphLeaf.prototype.display = function(){
    this.primitive.display();
}
