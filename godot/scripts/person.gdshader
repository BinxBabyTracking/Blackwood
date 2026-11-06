// A person's skin and clothes, with the open mouth painted in the same texture space shown as the jaw opens.
shader_type spatial;
render_mode cull_disabled;

uniform sampler2D albedo_tex : source_color, filter_linear_mipmap_anisotropic;
uniform sampler2D mouth_tex : source_color, filter_linear_mipmap;
uniform float jaw = 0.0;

void fragment() {
	vec4 base = texture(albedo_tex, UV);
	vec4 mouth = texture(mouth_tex, UV);
	ALBEDO = mix(base.rgb, mouth.rgb, mouth.a * smoothstep(0.08, 0.6, jaw));
	ROUGHNESS = 0.85;
	METALLIC = 0.0;
	SPECULAR = 0.3;
}
