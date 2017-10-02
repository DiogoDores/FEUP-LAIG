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
    ///witch(this.type){
        //case triangle:
            this.primitive = new MyTriangle(this.graph.scene, 0,0, 0, 1,0,0, 0,1,0);
    //}
  /*
    switch(this.type){
        case "rectangle":
        this.rectangle = new MyQuad(this.graph.scene, 0, 1, 0, 1);
        break;
        case "cylinder":
        this.cylinder = new MyCylinder(this.graph.scene, 12, 20, true);
        break;
        case "sphere":
        console.log("No sphere available");
        break;
        case "triangle":
        this.triangle = new MyTriangle(this.graph.scene, 0, 0, 0, 0, 0, 0, 0, 0, 0); //shit ton de zeros = coordenadas
        break;
    }
    */
}

MyGraphLeaf.prototype.display = function(){
    this.primitive.display();
}
