#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float amplitude;

void main() {

	vec4 color = texture2D(uSampler, vTextureCoord);

	color.r = color.r * 0.0 + color.g *0.769 + color.b * 0.1;
	color.g = color.r * 0.0 + color.g *amplitude + color.b * 0.1;
	color.b = color.r * 0.0 + color.g *0.534 + color.b * amplitude;

	gl_FragColor = color;
}