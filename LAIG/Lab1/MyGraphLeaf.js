/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem) {

    this.graph = graph;

    this.type=graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);
    this.parseLeafs();

}

MyGraphLeaf.prototype.parseLeafs = function(){

    switch(this.type){
        case "rectangle":
        this.primitive = new MyQuad(this.graph.scene, 0, 1, 0, 1);
        break;
        case "cylinder":
        this.primitive = new MyCylinder(this.graph.scene, 12, 20, true);
        break;
        case "sphere":
        console.log("No sphere available");
        break;
        case "triangle":
        this.primitive = new MyTriangle(this.graph.scene, 0, 0, 0, 1, 0, 0, 0, 1, 0);
        break;
    }

}

MyGraphLeaf.prototype.display = function(){
    this.primitive.display();
}
