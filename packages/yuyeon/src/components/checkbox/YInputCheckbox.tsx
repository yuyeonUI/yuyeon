import { type PropType, h } from 'vue';

import { defineComponent } from '@/util/component';

import { YIconCheckbox } from '../icons/YIconCheckbox';

import './YInputCheckbox.scss';

export default defineComponent({
  name: 'YInputCheckbox',
  components: { YIconCheckbox },
  props: {
    id: String as PropType<string>,
    value: Boolean as PropType<boolean>,
    icon: String as PropType<string>,
    color: {
      type: String as PropType<string>,
      default: () => 'primary',
    },
    disabled: Boolean as PropType<boolean>,
    readonly: Boolean as PropType<boolean>,
  },
  emits: ['focus', 'blur', 'click'],
  data() {
    return {
      counterId: this.$.uid.toString(),
      checked: false,
      focused: false,
    };
  },
  computed: {
    coloredClass() {
      if (this.color.startsWith('#')) {
        return undefined;
      }
      return `color--${this.color}`;
    },
    classes() {
      const ret: Record<string, boolean> = {
        'y-input': true,
        'y-input--checkbox': true,
        'y-input--active': this.checked,
        'y-input--focused': this.focused,
      };
      if (this.coloredClass) {
        ret[this.coloredClass] = true;
      }
      return ret;
    },
    inputId() {
      let id = this.counterId;
      if (this.id) {
        id = this.id;
      }
      return `input-${id}`;
    },
    iconComponent() {
      if (!this.icon) {
        return YIconCheckbox;
      }
      return null;
    },
  },
  methods: {
    onFocus(e: FocusEvent) {
      this.focused = true;
      this.$emit('focus', e);
    },
    onBlur(e: FocusEvent) {
      this.focused = false;
      this.$emit('blur', e);
    },
    onClick(event: MouseEvent) {
      this.$emit('click', event);
    },
  },
  watch: {
    value(neo: boolean) {
      this.checked = neo;
    },
  },
  created() {
    this.checked = !!this.value;
  },
  render() {
    const {
      onClick,
      classes,
      inputId,
      checked,
      onFocus,
      onBlur,
      disabled,
      readonly,
      iconComponent,
    } = this;
    return (
      <>
        <div onClick={onClick} class={classes}>
          <input
            id={inputId}
            aria-checked={checked}
            role="checkbox"
            type="checkbox"
            checked={checked}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            readonly={readonly}
          />
          {this.$slots.icon ? (
            this.$slots.icon({ checked })
          ) : iconComponent ? (
            h(iconComponent)
          ) : (
            <YIconCheckbox></YIconCheckbox>
          )}
        </div>
      </>
    );
  },
});
