import { VNode, defineComponent, h } from 'vue';

import './YTextHighlighter.scss';

export const YTextHighlighter = defineComponent({
  name: 'YTextHighlighter',
  props: {
    text: {
      type: String,
    },
    keyword: {
      type: String,
    },
    color: {
      type: String,
    },
    sensitive: {
      type: Boolean,
    },
  },
  computed: {
    splitText(): { text: string; isKeyword: boolean }[] {
      const { keyword, text } = this;
      if (keyword && text) {
        const split: { text: string; isKeyword: boolean }[] = [];
        let stack = text;
        const keyExp = new RegExp(keyword, this.sensitive ? '' : 'i');
        while (stack.length > 0) {
          const index = stack.search(keyExp);
          if (index < 0) {
            split.push({ text: stack, isKeyword: false });
            stack = '';
          } else if (index < 1) {
            split.push({
              text: stack.substring(0, keyword.length),
              isKeyword: true,
            });
            stack = stack.substring(keyword.length, stack.length);
          } else {
            split.push({ text: stack.substring(0, index), isKeyword: false });
            split.push({
              text: stack.substring(index, index + keyword.length),
              isKeyword: true,
            });
            stack = stack.substring(index + keyword.length, stack.length);
          }
        }
        return split;
      }
      return [{ text: this.text || '', isKeyword: false }];
    },
  },
  methods: {
    createItem(text: string): VNode {
      return h(
        'span',
        {
          staticClass: 'y-text-highlighter__item',
        },
        [text],
      );
    },
    createHighlightKeywordItem(text: string): VNode {
      return h(
        'span',
        {
          staticClass: 'y-text-highlighter__item',
          class: 'y-text-highlighter__item--highlight',
          style: {
            backgroundColor: this.color,
          },
        },
        [text],
      );
    },
    createSplitTexts(): VNode[] {
      return this.splitText.map((splitItem) => {
        if (splitItem.isKeyword) {
          return this.createHighlightKeywordItem(splitItem.text);
        }
        return this.createItem(splitItem.text);
      });
    },
  },
  render(): VNode {
    const children = this.createSplitTexts();
    return h('span', { staticClass: 'y-text-highlighter' }, children);
  },
});

export type YTextHighlighter = InstanceType<typeof YTextHighlighter>;
