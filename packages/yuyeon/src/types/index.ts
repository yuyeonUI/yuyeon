import { HTMLAttributes } from '@vue/runtime-dom';
import type { ComponentPublicInstance, FunctionalComponent } from 'vue';

export type CandidateKey = string | number;
export type JSXComponent<Props = any> =
  | FunctionalComponent<Props | Props & HTMLAttributes>
  | { new (): ComponentPublicInstance<Props | Props & HTMLAttributes> };
