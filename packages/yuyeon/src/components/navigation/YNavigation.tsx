import { defineComponent, getCurrentInstance } from "vue";
import { YBench } from "../bench/YBench";

export const YNavigation = defineComponent({
  name: 'YNavigation',
  components: {
    YBench,
  },
  setup(props, { slots }) {
    const vm = getCurrentInstance();
    return (
      <YBench>

      </YBench>
    )
  }
});

