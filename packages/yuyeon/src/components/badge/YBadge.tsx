import { type PropType, type SlotsType, vShow, withDirectives } from 'vue';

import { useRender } from '@/composables/component';
import { useI18n } from '@/composables/i18n';
import { IconValue } from '@/composables/icon';
import { PolyTransition } from '@/composables/transition';
import { defineComponent, propsFactory } from '@/util/component';

import { YIcon } from '../icon/YIcon';

import './YBadge.scss';

export const pressYBadgePropsOptions = propsFactory(
  {
    tag: {
      type: String as PropType<string>,
      default: 'div',
    },
    dot: Boolean,
    bordered: Boolean,
    floating: Boolean,
    inline: Boolean,
    icon: IconValue,
    color: String,
    hide: Boolean,
    label: {
      type: String,
      default: '$yuyeon.badge',
    },
    content: [Number, String],
    max: Number,
    transition: {
      type: String,
      default: 'fade',
    },
  },
  'YBadge',
);

export const YBadge = defineComponent({
  name: 'YBadge',
  props: pressYBadgePropsOptions(),
  slots: Object as SlotsType<{
    default: any;
    badge: any;
  }>,
  setup(props, { slots }) {
    const { t } = useI18n();

    useRender(() => {
      const ElTag = props.tag as keyof HTMLElementTagNameMap;
      const value = Number(props.content);
      const content =
        !props.max || isNaN(value)
          ? props.content
          : value <= +props.max
            ? value
            : `${props.max}+`;
      return (
        <ElTag
          class={[
            'y-badge',
            {
              'y-badge--bordered': props.bordered,
              'y-badge--dot': props.dot,
              'y-badge--floating': props.floating,
              'y-badge--inline': props.inline,
            },
          ]}
        >
          <div class="y-badge__base">
            {slots.default?.()}
            <PolyTransition
              is={props.transition}
              transitionProps={{ name: props.transition }}
            >
              {withDirectives(
                <span
                  class={['y-badge__badge']}
                  aria-atomic="true"
                  aria-label={t(props.label, value)}
                  aria-live="polite"
                  role="status"
                >
                  {props.dot ? undefined : slots.badge ? (
                    slots.badge?.()
                  ) : props.icon ? (
                    <YIcon icon={props.icon} />
                  ) : (
                    content
                  )}
                </span>,
                [[vShow, !props.hide]],
              )}
            </PolyTransition>
          </div>
        </ElTag>
      );
    });
  },
});

export type YBadge = InstanceType<typeof YBadge>;
