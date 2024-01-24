import type {DateAdapter, DateFormatOptions} from './types';

const FIRST_DAY_INDEX: Record<string, number> = {
  AD: 1,
  AE: 6,
  AF: 6,
  AG: 0,
  AI: 1,
  AL: 1,
  AM: 1,
  AN: 1,
  AR: 1,
  AS: 0,
  AT: 1,
  AU: 1,
  AX: 1,
  AZ: 1,
  BA: 1,
  BD: 0,
  BE: 1,
  BG: 1,
  BH: 6,
  BM: 1,
  BN: 1,
  BR: 0,
  BS: 0,
  BT: 0,
  BW: 0,
  BY: 1,
  BZ: 0,
  CA: 0,
  CH: 1,
  CL: 1,
  CM: 1,
  CN: 1,
  CO: 0,
  CR: 1,
  CY: 1,
  CZ: 1,
  DE: 1,
  DJ: 6,
  DK: 1,
  DM: 0,
  DO: 0,
  DZ: 6,
  EC: 1,
  EE: 1,
  EG: 6,
  ES: 1,
  ET: 0,
  FI: 1,
  FJ: 1,
  FO: 1,
  FR: 1,
  GB: 1,
  GE: 1,
  GF: 1,
  GP: 1,
  GR: 1,
  GT: 0,
  GU: 0,
  HK: 0,
  HN: 0,
  HR: 1,
  HU: 1,
  ID: 0,
  IE: 1,
  IL: 0,
  IN: 0,
  IQ: 6,
  IR: 6,
  IS: 1,
  IT: 1,
  JM: 0,
  JO: 6,
  JP: 0,
  KE: 0,
  KG: 1,
  KH: 0,
  KR: 0,
  KW: 6,
  KZ: 1,
  LA: 0,
  LB: 1,
  LI: 1,
  LK: 1,
  LT: 1,
  LU: 1,
  LV: 1,
  LY: 6,
  MC: 1,
  MD: 1,
  ME: 1,
  MH: 0,
  MK: 1,
  MM: 0,
  MN: 1,
  MO: 0,
  MQ: 1,
  MT: 0,
  MV: 5,
  MX: 0,
  MY: 1,
  MZ: 0,
  NI: 0,
  NL: 1,
  NO: 1,
  NP: 0,
  NZ: 1,
  OM: 6,
  PA: 0,
  PE: 0,
  PH: 0,
  PK: 0,
  PL: 1,
  PR: 0,
  PT: 0,
  PY: 0,
  QA: 6,
  RE: 1,
  RO: 1,
  RS: 1,
  RU: 1,
  SA: 0,
  SD: 6,
  SE: 1,
  SG: 0,
  SI: 1,
  SK: 1,
  SM: 1,
  SV: 0,
  SY: 6,
  TH: 0,
  TJ: 1,
  TM: 1,
  TR: 1,
  TT: 0,
  TW: 0,
  UA: 1,
  UM: 0,
  US: 0,
  UY: 1,
  UZ: 1,
  VA: 1,
  VE: 0,
  VI: 0,
  VN: 1,
  WS: 0,
  XK: 1,
  YE: 0,
  ZA: 0,
  ZW: 0,
};

export const ONE_DAY = 1000 * 60 * 60 * 24;
export const YYYY_MM_DD_REGEX =
  /^([12]\d{3}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[12]\d|3[01]))$/;
export const FIRST_SUNDAY = new Date(1970, 0, 4);

export class DateUtil {
  static date(value?: any): Date | null {
    if (value == null) return new Date();
    if (value instanceof Date) {
      return value;
    }
    let parsed;
    if (typeof value === 'string') {
      if (YYYY_MM_DD_REGEX.test(value)) {
        return DateUtil.parseLocalDate(value);
      } else {
        parsed = Date.parse(value);
      }

      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    }
    return null;
  }

  static format(
    value: Date,
    formatString: string,
    locale: string,
    formats?: Record<string, DateFormatOptions>,
  ): string {
    const neo = DateUtil.date(value) ?? new Date();
    const formatFunction = formats?.[formatString];

    if (typeof formatFunction === 'function') {
      return formatFunction(neo, formatString, locale);
    }

    let options: Intl.DateTimeFormatOptions = {};
    switch (formatString) {
      case 'fullDateWithWeekday':
        options = {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        };
        break;
      case 'normalDateWithWeekday':
        options = { weekday: 'short', day: 'numeric', month: 'short' };
        break;
      case 'keyboardDate':
        options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        break;
      case 'monthAndDate':
        options = { month: 'long', day: 'numeric' };
        break;
      case 'monthAndYear':
        options = { month: 'long', year: 'numeric' };
        break;
      case 'year':
        options = { year: 'numeric' };
        break;
      case 'month':
        options = { month: 'long' };
        break;
      case 'monthShort':
        options = { month: 'short' };
        break;
      case 'dayOfMonth':
        options = { day: 'numeric' };
        break;
      case 'shortDate':
        options = { year: '2-digit', month: 'numeric', day: 'numeric' };
        break;
      default:
        options = formatFunction ?? { timeZone: 'UTC', timeZoneName: 'short' };
    }

    return new Intl.DateTimeFormat(locale, options).format(neo);
  }

  static parseLocalDate(value: string) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  static parseISO(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  static toISO(adapter: DateAdapter<any>, value: Date): string {
    const date = adapter.toJsDate(value)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    return `${year}-${month}-${day}`;
  }

  static getWeekArray(date: Date, locale: string) {
    const weeks = [];
    let currentWeek = [];
    const firstDayOfMonth = DateUtil.startOfMonth(date);
    const lastDayOfMonth = DateUtil.endOfMonth(date);
    const firstDayWeekIndex =
      (firstDayOfMonth.getDay() -
        FIRST_DAY_INDEX[locale.slice(-2).toUpperCase()] +
        7) %
      7;
    const lastDayWeekIndex =
      (lastDayOfMonth.getDay() -
        FIRST_DAY_INDEX[locale.slice(-2).toUpperCase()] +
        7) %
      7;
    // prev month
    for (let i = 0; i < firstDayWeekIndex; i++) {
      const adjacentDay = new Date(firstDayOfMonth);
      adjacentDay.setDate(adjacentDay.getDate() - (firstDayWeekIndex - i));
      currentWeek.push(adjacentDay);
    }
    // this month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      currentWeek.push(new Date(date.getFullYear(), date.getMonth(), i));
      // flush full week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    // next month
    for (let i = 1; i < 7 - lastDayWeekIndex; i++) {
      const adjacentDay = new Date(lastDayOfMonth);
      adjacentDay.setDate(adjacentDay.getDate() + i);
      currentWeek.push(adjacentDay);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  static startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  static endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  static startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
  }

  static endOfDay(date: Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  static endOfYear(date: Date) {
    return new Date(date.getFullYear(), 11, 31);
  }

  static getYear(date: Date) {
    return date.getFullYear();
  }

  static getMonth(date: Date): number {
    return date.getMonth();
  }

  static getDay(date: Date): number {
    return date.getDate();
  }

  static getNextMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  static getWeekdays(locale: string) {
    const sundayIndex = FIRST_DAY_INDEX[locale.slice(-2).toUpperCase()] ?? 0;
    return [...Array(7).keys()].map((i) => {
      const weekday = new Date(FIRST_SUNDAY);
      weekday.setDate(FIRST_SUNDAY.getDate() + sundayIndex + i);
      return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
        weekday,
      );
    });
  }

  static isAfter(date: Date, comparing: Date): boolean {
    return date.getTime() > comparing.getTime();
  }

  static isBefore(date: Date, comparing: Date): boolean {
    return date.getTime() < comparing.getTime();
  }

  static isEqual(date: Date, comparing: Date): boolean {
    return date.getTime() === comparing.getTime();
  }

  static isSameDay(date: Date, comparing: Date): boolean {
    return (
      date.getDate() === comparing.getDate() &&
      date.getMonth() === comparing.getMonth() &&
      date.getFullYear() === comparing.getFullYear()
    );
  }

  static isSameMonth(date: Date, comparing: Date): boolean {
    return !!(
      date.getMonth() === comparing.getMonth() &&
      date.getFullYear() &&
      comparing.getFullYear()
    );
  }

  static isValid(date: any): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  static isWithinRange(date: Date, range: [Date, Date]): boolean {
    return (
      DateUtil.isAfter(date, range[0]) && DateUtil.isBefore(date, range[1])
    );
  }

  static addDays(date: Date, amount: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  }

  static addMonths(date: Date, amount: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + amount);
    return d;
  }

  static getDiff(
    date: Date,
    comparing: string | Date,
    unit?: 'month' | string,
  ): number {
    const b = new Date(date);
    const c = new Date(comparing);

    if (unit === 'month') {
      return (
        b.getMonth() - c.getMonth() + (b.getFullYear() - c.getFullYear()) * 12
      );
    }

    return Math.floor(b.getTime() - c.getTime()) / ONE_DAY;
  }

  static setMonth(date: Date, month: number) {
    const d = new Date(date);
    d.setMonth(month);
    return d;
  }

  static setYear(date: Date, year: number) {
    const d = new Date(date);
    d.setFullYear(year);
    return d;
  }
}
