export interface DateAdapter<T = unknown> {
  /**
   *
   * @param value
   */
  date(value?: any): T | null;

  /**
   *
   * @param date
   * @param formatString
   */
  format(date: T, formatString: string): string;

  /**
   *
   * @param value
   */
  toJsDate(value: T): Date;

  /**
   *
   * @param date
   */
  parseISO(date: string): T;

  /**
   *
   * @param date
   */
  toISO(date: T): string;

  /**
   *
   * @param date
   */
  startOfDay(date: T): T;

  /**
   *
   * @param date
   */
  endOfDay(date: T): T;

  /**
   *
   * @param date
   */
  startOfMonth(date: T): T;

  /**
   *
   * @param date
   */
  endOfMonth(date: T): T;

  /**
   *
   * @param date
   */
  startOfYear(date: T): T;

  /**
   *
   * @param date
   */
  endOfYear(date: T): T;

  /**
   *
   * @param date
   * @param comparing
   */
  isBefore(date: T, comparing: T): boolean;

  /**
   *
   * @param date
   * @param comparing
   */
  isAfter(date: T, comparing: T): boolean;

  /**
   *
   * @param date
   * @param comparing
   */
  isEqual(date: T, comparing: T): boolean;

  /**
   *
   * @param date
   * @param comparing
   */
  isSameDay(date: T, comparing: T): boolean;

  /**
   *
   * @param date
   * @param comparing
   */
  isSameMonth(date: T, comparing: T): boolean;

  /**
   *
   * @param date
   */
  isValid(date: any): boolean;

  /**
   *
   * @param date
   * @param range
   */
  isWithinRange(date: T, range: [T, T]): boolean;

  /**
   *
   * @param date
   * @param amount
   */
  addDays(date: T, amount: number): T;

  /**
   *
   * @param date
   * @param amount
   */
  addMonths(date: T, amount: number): T;

  /**
   *
   * @param date
   */
  getYear(date: T): number;

  /**
   *
   * @param date
   * @param year
   */
  setYear(date: T, year: number): T;

  /**
   *
   * @param date
   * @param comparing
   * @param unit
   */
  getDiff(date: T, comparing: T | string, unit?: string): number;

  /**
   *
   *
   * @param date
   */
  getWeekArray(date: T): T[][];

  /**
   *
   */
  getWeekdays(): string[];

  /**
   *  0 ~ 11
   * @param date
   */
  getMonth(date: T): number;

  /**
   *
   * @param date
   * @param month
   */
  setMonth(date: T, month: number): T;

  /**
   *
   * get day (1-31) number
   *
   * @param date
   */
  getDay(date: T): number;

  /**
   *
   * @param date
   */
  getNextMonth(date: T): T;
}

export type DateFormatOptions =
  | Intl.DateTimeFormatOptions
  | ((date: Date, formatString: string, locale: string) => string);
