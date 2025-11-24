import { computed, type ExtractPropTypes } from "vue";

import { colorRgb, isColorValue } from "@/util/color";
import { propsFactory } from "@/util/component/props";

export const styleColorPropsOptions = {
	color: String,
	background: String,
	backgroundOpacity: {
		type: Number,
	},
};

export const pressColorPropsOptions = propsFactory(styleColorPropsOptions, 'style-color');

export function useStyleColor(
	props: ExtractPropTypes<typeof styleColorPropsOptions>,
	name: string,
) {
	const colorVars = computed(() => {
		let { color, background } = props;
		if (!background) background = color;

		if (color && !isColorValue(color)) {
			color = `var(--y-theme-${color})`;
		}

		if (background) {
			if (isColorValue(background)) {
				background = `rgba(${colorRgb(background)}, ${props.backgroundOpacity})`;
			} else if (!background.startsWith("var(")) {
				background = `rgba(${`var(--y-theme-${background}-rgb)`}, ${props.backgroundOpacity})`;
			}
		}

		return {
			[`--y-${name}__color`]: color,
			[`--y-${name}__background`]: background,
		};
	});

	return {
		colorVars,
	};
}
