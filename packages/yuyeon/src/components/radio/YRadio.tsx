import type { PropType, SlotsType } from "vue";

import { useRender } from "@/composables/component";
import { defineComponent, getUid, propsFactory } from "@/util/component";

import { YRadioIcon } from "./YRadioIcon";

import "./YRadio.scss";

export const pressYRadioPropsOptions = propsFactory(
  {
    modelValue: Boolean as PropType<boolean>,
    disabled: Boolean as PropType<boolean>,
    value: String as PropType<string>,
    label: String as PropType<string>,
  },
  "YRadio",
);

const YRadio = defineComponent({
  name: "YRadio",
  props: {
    ...pressYRadioPropsOptions(),
  },
  slots: Object as SlotsType<{
    leading: any;
    icon: any;
    label: any;
    trailing: any;
  }>,
  emits: ["update:modelValue", "input"],
  setup(props, { slots, attrs, emit }) {
    const uid = getUid();

    function onInput(e: Event) {
      emit("input", e);
    }

    useRender(() => {
      const inputId = `input-${uid}`;
      return (
        <div class={["y-radio", { "z-radio--disabled": props.disabled }]}>
          {slots.leading && slots.leading()}
          <div class="y-radio__input">
            {slots.icon ? (
              slots.icon()
            ) : (
              <YRadioIcon active={props.modelValue} disabled={props.disabled} />
            )}
            <input
              id={inputId}
              name={attrs.name as string}
              type="radio"
              value={props.value}
              checked={props.modelValue}
              disabled={props.disabled}
              class="y-radio__input-native"
              onInput={onInput}
            />
          </div>
          {slots.label ? (
            slots.label({ inputId })
          ) : (
            <label for={inputId} class="y-radio__label">
              {props.label}
            </label>
          )}
        </div>
      );
    });
  },
});
