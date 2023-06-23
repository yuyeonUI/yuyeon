
import type { Component, PropType } from "vue";

export type IconValue = string | (string | [path: string, opacity: number])[] | Component;

export const IconPropOption = [String, Function, Object, Array] as PropType<IconValue>;

type IconProps = {
  tag: string;
  icon?: IconValue,
  disabled?: Boolean,
}

type IconComponent = Component<IconProps>;
