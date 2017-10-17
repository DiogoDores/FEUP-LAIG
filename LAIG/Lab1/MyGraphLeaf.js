/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/

function MyGraphLeaf(graph, xmlelem, controlVer) {

    this.graph = graph;
    this.elem = xmlelem;
    this.controlVer = controlVer;

    this.type = this.graph.reader.getItem(xmlelem, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'patch']);
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
        case "cylinder":
            this.primitive = new MyCylinderTops(this.graph.scene, a);
            break;
        case "sphere":
            this.primitive = new MySphere(this.graph.scene, a);
            break;
        case "triangle":
            this.primitive = new MyTriangle(this.graph.scene, a);
            break;
        case "patch":
            this.primitive = new MyPatch(this.graph.scene, a, this.controlVer);
            break;
        default:
            this.primitive = null;
            break;
    }

}

MyGraphLeaf.prototype.display = function(){

  if(this.primitive == null){
    console.log("It is not possible to create that type of object.");
    return;
  }

  this.primitive.display();

}
