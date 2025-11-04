import type { PropType, Ref } from "vue";
import { onScopeDispose, ref, watch } from "vue";

import type { CssProperties } from "@/types";

import { propsFactory } from "../../util/component";
import type { Rect } from "../../util/rect";
import { useToggleScope } from "../scope";
import { applyArrangement } from "./arrangement";
import { applyLevitation } from "./levitation";
import type { CoordinateState } from "./types";

const coordinateStrategies = {
	levitation: applyLevitation,
	arrangement: applyArrangement,
};

export type CoordinateStrategyFn = (
	props: any,
	state: CoordinateState,
	coordination: Ref<any>,
	coordinateStyles: Ref<CssProperties>,
) => undefined | { updateCoordinate: (e: Event) => void };

export const pressCoordinateProps = propsFactory(
	{
		coordinateStrategy: {
			type: [String, Function] as PropType<
				keyof typeof coordinateStrategies | CoordinateStrategyFn
			>,
			default: "arrangement",
		},
		position: {
			type: String as PropType<
				"default" | "top" | "end" | "right" | "bottom" | "left" | "start"
			>,
			default: "default",
		},
		align: {
			type: String as PropType<"start" | "center" | "end" | "top" | "bottom">,
			default: "start",
		},
		origin: {
			type: String,
			default: "auto",
		},
		offset: {
			type: [Number, String, Array] as PropType<number | string | number[]>,
		},
		viewportMargin: {
			type: [Number, String, Array],
			default: 16,
		},
	},
	"Coordinate",
);

export function useCoordinate(props: any, state: CoordinateState) {
	const updateCoordinate = ref<(e: Event) => void>();
	const coordination = ref<any>({
		side: '',
		align: '',
		offset: [0, 0],
		rect: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		}
	});
	const coordinateStyles = ref<CssProperties>({});

	useToggleScope(
		() => !!(state.active.value && props.coordinateStrategy),
		(reset) => {
			watch(() => props.coordinateStrategy, reset);
			onScopeDispose(() => {
				updateCoordinate.value = undefined;
			});

			if (typeof props.coordinateStrategy === "function") {
				updateCoordinate.value = props.coordinateStrategy(
					props,
					state,
					coordination,
					coordinateStyles,
				)?.updateCoordinate;
			} else {
				const strategy =
					coordinateStrategies[
						props.coordinateStrategy as keyof typeof coordinateStrategies
					];
				updateCoordinate.value = strategy?.(
					props,
					state,
					coordination,
					coordinateStyles,
				)?.updateCoordinate;
			}
		},
	);

	window.addEventListener("resize", onResize, { passive: true });

	onScopeDispose(() => {
		window.removeEventListener("resize", onResize);
		updateCoordinate.value = undefined;
	});

	function onResize(e: Event) {
		updateCoordinate.value?.(e);
	}

	return {
		coordination,
		coordinateStyles,
		updateCoordinate,
	};
}
