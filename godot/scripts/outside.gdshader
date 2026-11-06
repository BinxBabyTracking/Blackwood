// The view through a window: the painting runs on past its edges as a mirror image,
// so close to the glass you never see where it stops (as on the website).
shader_type spatial;
render_mode unshaded, cull_disabled;

uniform sampler2D tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform float repeats = 5.0;
uniform float shade = 1.0;

void fragment() {
	vec2 uv = UV * repeats - vec2((repeats - 1.0) * 0.5);
	vec2 m = mod(uv, 2.0);
	uv = mix(m, 2.0 - m, step(1.0, m));
	ALBEDO = texture(tex, uv).rgb * shade;
}
