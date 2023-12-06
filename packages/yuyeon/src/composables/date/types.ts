import type { DateAdapter } from '../../util/date/types';

export interface DateOptions {
  adapter: any;
  locale: Record<string, any>;
  formats?: Record<string, any>;
}

export interface DateInstanceType {
  instanceType: unknown;
}

export interface DateInstance<T = DateInstanceType['instanceType']>
  extends DateAdapter<T> {
  locale?: any;
}
