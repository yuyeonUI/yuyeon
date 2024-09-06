import type { ComponentPublicInstance, FunctionalComponent } from 'vue';

export type CandidateKey = string | number;

export type JSXComponent<Props = any> =
  | FunctionalComponent<Props>
  | { new (): ComponentPublicInstance<Props> };
