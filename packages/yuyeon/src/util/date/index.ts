export { YuyeonDateAdapter } from './adapters/yuyeon-date-adapter';
export * from './built-in';

export function createDateAdapter() {}

export function validateDate(date: Date) {
  return date instanceof Date && !Number.isNaN(date?.getTime());
}
