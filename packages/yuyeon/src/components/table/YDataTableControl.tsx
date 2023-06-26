import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { YButton } from '../button';
import { YFieldInput } from '../field-input';

import { YIconExpand } from '../icons';
import './YDataTableControl.scss';

export const YDataTableControl = defineComponent({
  name: 'YDataTableControl',
  components: {
    YButton,
    YIconExpand,
    YFieldInput,
  },
  setup(props, { slots }) {
    useRender(() => {
      return (
        <footer class={['y-data-table-control']}>
          {slots.default ? (
            slots.default()
          ) : (
            <>
              <YButton outlined>
                20
                <YIconExpand
                  style={{ width: '16px', height: '16px' }}
                ></YIconExpand>
              </YButton>
              페이지
              <div>
                <YFieldInput outlined></YFieldInput>
              </div>
            </>
          )}
        </footer>
      );
    });
  },
});

export type YDataTableControl = InstanceType<typeof YDataTableControl>;
