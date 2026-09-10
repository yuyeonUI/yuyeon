import type { ComponentPublicInstance, FunctionalComponent } from 'vue';

export type CandidateKey = string | number;

export type JSXComponent<Props = any> =
  | FunctionalComponent<Props>
  | { new (): ComponentPublicInstance<Props> };

export type CssProperties = { [p: `--${string}`]: string | number | undefined };

export type LiteralUnion<T extends string> = T | (string & {});

export type XYPoint = [x: number, y: number];
