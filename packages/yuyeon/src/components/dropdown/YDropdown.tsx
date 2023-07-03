import { PropType, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';
import { YCard } from '../card';
import { YList } from '../list';
import { YMenu } from '../menu';

export interface YDropdownOption {
  key: string;
  value: string;
  text: string;
}

export const pressYDropdownPropsOptions = propsFactory(
  {
    options: {
      type: Array as PropType<YDropdownOption[]>,
      default: () => [],
    },
  },
  'YDropdown',
);

export const YDropdown = defineComponent({
  name: 'YDropdown',
  components: {
    YMenu,
  },
  props: {},
  setup(props, { slots }) {
    useRender(() => {
      return (
        <>
          <YMenu>
            {{
              base: slots.base ? (
                (...args: any[]) => slots.base?.(...args)
              ) : (
                <YButton></YButton>
              ),
              default: () =>
                slots.default ? (
                  slots.default()
                ) : (
                  <YCard>
                    <YList></YList>
                  </YCard>
                ),
            }}
          </YMenu>
        </>
      );
    });
  },
});
