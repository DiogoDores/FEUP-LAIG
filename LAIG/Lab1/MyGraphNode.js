/**
 * MyGraphNode class, representing an intermediate node in the scene graph.
 * @constructor
**/

function MyGraphNode(graph, nodeID) {
    this.graph = graph;

    this.nodeID = nodeID;

    // IDs of child nodes.
    this.children = [];

    // IDs of child nodes.
    this.leaves = [];

    // The material ID.
    this.materialID = null ;

    // The texture ID.
    this.textureID = null ;

    this.anims = [];
    this.currAnim = null;
    this.transformMatrix = mat4.create();
    mat4.identity(this.transformMatrix);
}

/**
 * Adds the reference (ID) of another node to this node's children array.
 */
MyGraphNode.prototype.addChild = function(nodeID) {
    this.children.push(nodeID);
}

/**
 * Adds a leaf to this node's leaves array.
 */
MyGraphNode.prototype.addAnimation = function(anim) {
    this.anims.push(anim);
}

/**
 * Adds a leaf to this node's leaves array.
 */
MyGraphNode.prototype.addLeaf = function(leaf) {
    this.leaves.push(leaf);
}

MyGraphNode.prototype.nextAnim = function(){
  //console.log("Aqui m");
  if(this.currAnim != null && this.currAnim.finished){
    if(this.anims[0] != null){
      let anim = this.graph.anims[this.anims[0]];
      switch (anim[0]) {
        case linear:
          this.currAnim = new LinearAnimation(this.graph.scene, anim);
          break;
        default:
        break;
      }
      this.anims.shift();
    }
  }
}
