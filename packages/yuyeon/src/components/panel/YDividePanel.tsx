import { type CSSProperties, computed, defineComponent, ref, watch } from 'vue';

import { useRender } from '@/composables/component';

import './YDividePanel.scss';

export const YDividePanel = defineComponent({
  name: 'YDividePanel',
  setup(props, { slots }) {
    const contentRate = ref(50);
    const isResizing = ref(false);
    const secondarySlot = ref();
    const activeSecondary = ref(false);
    const rootRef = ref();

    watch(secondarySlot, (neo) => {
      activeSecondary.value = !!neo;
    });

    const topStyles = computed<CSSProperties>(() => {
      let inset = '0 0';
      if (activeSecondary.value) {
        inset = `0 0 ${100 - contentRate.value}% 0`;
      }
      return {
        position: 'absolute',
        inset,
      };
    });

    const classes = computed(() => {
      return {
        'y-divide-panel': true,
        'y-divide-panel--resizing': isResizing.value,
      };
    });

    function moveListener(event: Event) {
      const mouseEvent = event as MouseEvent;
      const containerRect = rootRef.value.getBoundingClientRect();
      requestAnimationFrame(() => {
        contentRate.value = Math.min(
          Math.max(
            10,
            ((mouseEvent.clientY - containerRect.y) / containerRect.height) *
              100,
          ),
          90,
        );
      });
    }

    function cancelEvent() {
      isResizing.value = false;
      rootRef.value.removeEventListener('mousemove', moveListener);
      rootRef.value.removeEventListener('mouseup', upListener);
      rootRef.value.removeEventListener('mouseleave', leaveListener);
    }

    function upListener(event: Event) {
      cancelEvent();
    }

    function leaveListener(event: Event) {
      cancelEvent();
    }

    function onMousedown(event: MouseEvent) {
      event.preventDefault();
      isResizing.value = true;
      rootRef.value.addEventListener('mousemove', moveListener);
      rootRef.value.addEventListener('mouseup', upListener);
      rootRef.value.addEventListener('mouseleave', leaveListener);
    }

    useRender(() => {
      return (
        <>
          <div class={classes.value} ref={rootRef}>
            <div
              class={'y-divide-panel__top-container'}
              style={topStyles.value}
            >
              {slots.default?.()}
            </div>
            {
              (secondarySlot.value = slots.secondary && (
                <>
                  <div
                    class="y-divide-panel__divider"
                    style={{
                      position: 'absolute',
                      inset: `${contentRate.value}% 0 0 0`,
                    }}
                    onMousedown={onMousedown}
                  >
                    <div class="y-divide-panel__divider-line"></div>
                  </div>
                  <div
                    class={'y-divide-panel__secondary-container'}
                    style={{
                      position: 'absolute',
                      inset: `${contentRate.value}% 0 0 0`,
                    }}
                  >
                    {slots.secondary?.()}
                  </div>
                </>
              ))
            }
          </div>
        </>
      );
    });

    return {
      activeSecondary,
    };
  },
});

export type YDividePanel = InstanceType<typeof YDividePanel>;
