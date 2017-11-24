#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uNMatrix;
uniform float amplitude;
uniform float displacement;
varying vec3 vNormal;


void main(){
    
    vNormal = aVertexNormal;
    vec3 newPosition = aVertexPosition + aVertexNormal * vec3(displacement*amplitude);

    gl_Position = uPMatrix*uMVMatrix*vec4(newPosition,1.0);
}