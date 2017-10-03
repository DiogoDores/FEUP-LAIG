/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem) {

    this.graph = graph;
    this.elem = xmlelem;
    this.primitive = null;

    this.type = this.graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);
    this.parseLeafs();

}

MyGraphLeaf.prototype.parseLeafs = function(){

  var args = this.graph.reader.getString(this.elem, 'args');
  var a = args.split(' ');

  for(var i = 0; i < a.length; i++){
    a[i] = parseFloat(a[i]);
  }

    switch(this.type){
        case "rectangle":
            this.primitive = new MyQuad(this.graph.scene, a);
            break;
        /*case "cylinder":
            this.primitive = new MyCylinder(this.graph.scene, 12, 20, true);
            break;
        case "sphere":
            this.primitive = new MyQuad(this.graph.scene, 0, 1, 0, 1);
            break;*/
        case "triangle":
        console.log(a);
            this.primitive = new MyTriangle(this.graph.scene, a);
            break;
        default:
            this.primitive = null;
            break;
    }

}

MyGraphLeaf.prototype.display = function(){
  if(this.primitive != null){
    this.primitive.display();
  }
}
