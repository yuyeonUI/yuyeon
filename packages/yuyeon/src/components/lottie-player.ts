import { defineComponent, h, PropType } from 'vue';
import lottie, {
  AnimationConfigWithData,
  AnimationConfigWithPath,
} from 'lottie-web';

export default defineComponent({
  name: 'lottie-player',
  props: {
    src: {
      type: [String, Object] as PropType<string | Record<string, any>>,
    },
    loop: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    autoplay: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  mounted() {
    const params: AnimationConfigWithPath | AnimationConfigWithData = {
      container: this.$el,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoplay,
    };
    if (this.src) {
      if (typeof this.src === 'string') {
        (params as AnimationConfigWithPath).path = this.src;
      } else {
        (params as AnimationConfigWithData).animationData = this.src;
      }
      lottie.loadAnimation(params);
    }
  },
  render() {
    return h('div', { class: 'lottie-player' });
  },
});
