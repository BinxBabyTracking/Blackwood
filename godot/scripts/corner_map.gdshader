// The map in the top right corner: a quarter circle centred on the screen's corner, with a pale edge.
shader_type canvas_item;

uniform float edge = 0.012;
uniform vec4 edge_color : source_color = vec4(0.91, 0.86, 0.75, 0.85);

void fragment() {
	float d = distance(UV, vec2(1.0, 0.0));
	if (d > 1.0) {
		discard;
	}
	vec4 c = texture(TEXTURE, UV * 0.86 + vec2(0.07));
	COLOR = d > 1.0 - edge ? edge_color : c;
}
