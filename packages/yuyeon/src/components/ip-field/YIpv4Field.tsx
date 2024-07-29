import {
  PropType,
  computed,
  defineComponent,
  mergeProps,
  nextTick,
  reactive,
  ref,
  toRef,
  watch,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { chooseProps } from '../../util/vue-component';
import { YInput, pressYInputPropsOptions } from '../input';

import './YIpField.scss';

const INHERIT_NAME = 'y-ip-field';
const NAME = 'y-ipv4-field';
const IP_PART_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

type PartId = 0 | 1 | 2 | 3 | 4;

export const YIpv4Field = defineComponent({
  name: NAME,
  props: {
    fixedUntil: Number as PropType<0 | 1 | 2 | 3>,
    text: Boolean as PropType<boolean>,
    subnet: Boolean as PropType<boolean>,
    autoFillSubnet: [Boolean, Number, String] as PropType<
      boolean | number | string
    >,
    ...pressYInputPropsOptions(),
  },
  emits: {
    'update:modelValue': (_v: string) => true,
    tab: (_id?: number) => true,
    focus: () => true,
    blur: () => true,
  },
  setup(props, { slots, emit }) {
    const field$ = ref();
    const yInput$ = ref();
    const input$ = ref<any[]>([]);

    const model = useModelDuplex(props);

    const parts = reactive<Record<PartId, any>>({
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
    });
    //
    const lazyParts = reactive({
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
    });

    const isFocused = ref(false);
    const fieldFocused = ref<number[]>([]);

    /// Events
    function testSubnetRange(value: string) {
      return !/[^0-9]/.test(value) && Number(value) < 33 && Number(value) > -1;
    }

    function onInput(id: PartId, event: Event) {
      const target = event.target as HTMLInputElement | null;
      const neoValue = target?.value || '';
      const oldValue = lazyParts[id];
      const pass =
        id < 4 ? IP_PART_REGEX.test(neoValue) : testSubnetRange(neoValue);
      const neo = neoValue !== '' ? Number(neoValue).toString() : '';
      parts[id] = neo;
      if (!pass && neoValue !== '') {
        nextChange(id, oldValue);
      } else {
        if (neoValue.length > 2) {
          focusNextPart(id);
        }
        lazyParts[id] = neo;
        emitInput();
      }
    }

    function onFocus(id: PartId, _event: FocusEvent) {
      isFocused.value = true;
      fieldFocused.value.push(id);
    }

    function onBlur(id: PartId, _event: FocusEvent) {
      isFocused.value = false;
      nextTick(() => {
        setTimeout(() => {
          fieldFocused.value.forEach((value, index) => {
            if (value === id) {
              fieldFocused.value.splice(index, 1);
            }
          });
        });
      });
    }

    function onChange(_id: PartId, _event: Event) {
      //
      // const changed = [id, event];
    }

    function onKeydown(id: PartId, event: KeyboardEvent) {
      const $target = event.target as HTMLInputElement;
      if (event.key === 'Backspace' && event.target && $target.value === '') {
        focusPrevPart(id);
      }
      if (
        event.key === 'ArrowRight' ||
        (event.key === 'ArrowDown' && !event.shiftKey)
      ) {
        if (
          $target.selectionStart !== null &&
          $target.value.length <= $target.selectionStart
        ) {
          if (id === 3) {
            event.preventDefault();
            emit('tab');
            return;
          } else {
            event.preventDefault();
            focusNextPart(id);
            return;
          }
        }
      }
      if (
        event.key === 'ArrowLeft' ||
        (event.key === 'ArrowUp' && !event.shiftKey)
      ) {
        if ($target.selectionStart !== null && $target.selectionStart === 0) {
          if (id === 0) {
            event.preventDefault();
            emit('tab', -1);
            return;
          } else {
            event.preventDefault();
            focusPrevPart(id);
            return;
          }
        }
      }
      if (
        ((event.key === 'Tab' && !event.shiftKey && $target.value !== '') ||
          event.key === 'Enter' ||
          event.key === '.') &&
        props.onTab &&
        id === 3
      ) {
        event.preventDefault();
        emit('tab', 3);
      }
    }

    function onKeyup(id: PartId, event: KeyboardEvent) {
      if (event.key === '.') {
        focusNextPart(id);
      }
    }

    function putParts(neo: string | undefined) {
      if (typeof neo === 'string') {
        let tempParts: string[] = [];
        if (neo.lastIndexOf('/') > -1) {
          const sub = neo.substring(neo.lastIndexOf('/') + 1, neo.length);
          if (props.subnet && testSubnetRange(sub)) {
            parts[4] = sub;
          }
          tempParts = neo.substring(0, neo.lastIndexOf('/')).split('.');
        } else {
          tempParts = neo.split('.');
        }
        if (tempParts.length > 2) {
          for (let index = 0; index < 4; index += 1) {
            const part = tempParts[index];
            if (part !== undefined && IP_PART_REGEX.test(part)) {
              parts[index as PartId] = part;
            } else {
              parts[index as PartId] = '';
            }
          }
          emitInput();
        }
      }
    }

    function onPaste(event: ClipboardEvent) {
      const content = (
        event.clipboardData || (window as any).clipboardData
      ).getData('text');
      if (isNaN(Number(content))) {
        event.preventDefault();
        putParts(content);
      }
    }

    function whenBlur() {
      if (
        props.autoFillSubnet &&
        parts[0] &&
        parts[1] &&
        parts[2] &&
        parts[3] &&
        !parts[4]
      ) {
        if (typeof props.autoFillSubnet === 'boolean') {
          parts[4] = '32';
        } else {
          parts[4] = props.autoFillSubnet.toString();
        }
        emitInput();
      }
    }

    /// Actions
    function nextChange(id: PartId, value: any) {
      nextTick(() => {
        parts[id] = value;
        emitInput();
      });
    }

    function focusNextPart(currentId: PartId) {
      const nextId = currentId + 1;
      if (nextId < 4) {
        const $input = input$.value[nextId] as HTMLInputElement;
        $input.focus();
        $input.selectionStart = 0;
      }
    }

    function focusPrevPart(currentId: PartId) {
      const prevId = currentId - 1;
      if (prevId > -1) {
        const $input = input$.value[prevId] as HTMLInputElement;
        $input.focus();
        $input.selectionStart = $input.value.length + 1;
      }
    }

    function emitInput() {
      model.value = joinParts();
    }

    function joinParts(): string {
      if (
        parts[0] === '' &&
        parts[1] === '' &&
        parts[2] === '' &&
        parts[3] === ''
      ) {
        return '';
      }
      return `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}${
        props.subnet ? '/' + parts[4] : ''
      }`;
    }

    const focused = computed(() => {
      return fieldFocused.value.length > 0;
    });

    watch(
      model,
      (neo: string | undefined) => {
        if (neo === '') {
          for (let index = 0; index < 5; index += 1) {
            parts[index as PartId] = '';
            lazyParts[index as PartId] = '';
          }
          return;
        } else {
          putParts(neo);
        }
      },
      { immediate: true },
    );

    watch(focused, (neo: boolean) => {
      if (!neo) {
        whenBlur();
      }
    });

    watch(isFocused, (neo: boolean) => {
      if (neo) {
        emit('focus');
      } else {
        emit('blur');
      }
    });

    useRender(() => {
      input$.value = [];
      return (
        <YInput
          ref={yInput$}
          class={[
            NAME,
            INHERIT_NAME,
            { [`${INHERIT_NAME}--text`]: props.text },
          ]}
          {...chooseProps(props, YInput.props)}
        >
          {{
            leading: (...args: any[]) => slots.leading?.(...args),
            default: (defaultProps: any) => {
              return (
                <div
                  class={[`${INHERIT_NAME}__field`]}
                  {...mergeProps({ 'data-id': defaultProps.attrId })}
                  ref={field$}
                >
                  {([0, 1, 2, 3, 4] as PartId[]).map((id) => {
                    const inputValue = toRef(parts, id);
                    return (
                      ((!props.subnet && id < 4) || props.subnet) && [
                        <div class={[`${INHERIT_NAME}__part`]}>
                          <input
                            ref={(el) => input$.value.push(el)}
                            id={`${defaultProps.attrId}__part--${id}`}
                            value={inputValue.value}
                            class={[`${INHERIT_NAME}__part-input`]}
                            readonly={props.readonly || props.loading}
                            disabled={props.disabled}
                            autocomplete="false"
                            maxlength={id === 4 ? 2 : 3}
                            onInput={($event) => onInput(id, $event)}
                            onFocus={($event) => onFocus(id, $event)}
                            onBlur={($event) => onBlur(id, $event)}
                            onChange={($event) => onChange(id, $event)}
                            onKeydown={($event) => onKeydown(id, $event)}
                            onKeyup={($event) => onKeyup(id, $event)}
                            onPaste={onPaste}
                          />
                        </div>,
                        id !== 4 &&
                          ((!props.subnet && id < 3) || props.subnet) && (
                            <div class={[`${INHERIT_NAME}__part`]}>
                              {id < 3 ? '.' : '/'}
                            </div>
                          ),
                      ]
                    );
                  })}
                </div>
              );
            },
            trailing: (...args: any[]) => slots.trailing?.(...args),
            label: slots.label && (() => slots.label?.()),
            'helper-text':
              slots['helper-text'] && (() => slots['helper-text']?.()),
          }}
        </YInput>
      );
    });

    return {};
  },
});

export type YIpv4Field = InstanceType<typeof YIpv4Field>;
