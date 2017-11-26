#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float amplitude;

void main() {

	vec4 color = texture2D(uSampler, vTextureCoord);

	color.r = color.r + amplitude * (1.0 - color.r);
	color.g = color.g + amplitude * (0.5 - color.g);
	color.b = color.b + amplitude * (0.0 - color.b);

	gl_FragColor = color;
}
