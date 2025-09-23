import { useRender } from "@/composables/component";
import { defineComponent } from "@/util/component/component";

import "./YRadioIcon.scss";

export const YRadioIcon = defineComponent({
  name: "YRadioIcon",
  props: {
    active: Boolean,
    disabled: Boolean,
  },
  setup(props) {
    useRender(() => (
      <svg
        class={[
          "y-radio-icon",
          {
            "y-radio-icon--active": props.active,
            "y-radio-icon--disabled": props.disabled,
          },
        ]}
        viewBox="0 0 24 24"
      >
        <circle
          class="y-radio-icon__plate"
          r="11"
          cx="12"
          cy="12"
          stroke-width="2"
          stroke="currentColor"
        />
        <circle class="y-radio-icon__bead" r="6" cx="12" cy="12" />
      </svg>
    ));
  },
});

export type YRadioIcon = InstanceType<typeof YRadioIcon>;
