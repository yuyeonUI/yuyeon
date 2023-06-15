import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
import './YListItem.scss';

export const pressYListItemProps = propsFactory({
  tag: {
    type: String,
    default: 'div',
  },
}, 'y-list-item');

export const YListItem = defineComponent({
  name: 'YListItem',
  props: {
    ...pressYListItemProps(),
  },
  setup(props, { slots }) {
    useRender(() => {
      const ElTag = props.tag as keyof HTMLElementTagNameMap;
      return (
        <ElTag class={['y-list-item']}>
          {slots.prepend && (
            <div class={'y-list-item__prepend'}>{slots.prepend()}</div>
          )}
          <div class={'y-list-item__content'}>{slots.default?.()}</div>
          {slots.append && (
            <div class={'y-list-item__append'}>{slots.append()}</div>
          )}
        </ElTag>
      )
    });
  },
});

export type YListItem = InstanceType<typeof YListItem>;
