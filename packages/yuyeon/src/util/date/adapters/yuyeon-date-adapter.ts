import { DateUtil } from '../built-in';
import { DateAdapter, DateFormatOptions } from '../types';

export class YuyeonDateAdapter implements DateAdapter<Date> {
  public locale = 'ko-kr';

  public formats?: Record<string, DateFormatOptions>;

  constructor(options: {
    locale: string;
    formats?: Record<string, DateFormatOptions>;
  }) {
    this.locale = options.locale;
    this.formats = options.formats;
  }

  public getWeekArray(date: Date) {
    return DateUtil.getWeekArray(date, this.locale);
  }

  public startOfMonth(date: Date) {
    return DateUtil.startOfMonth(date);
  }

  public endOfMonth(date: Date) {
    return DateUtil.endOfMonth(date);
  }

  public addDays(date: Date, amount: number): Date {
    return DateUtil.addDays(date, amount);
  }

  public addMonths(date: Date, amount: number): Date {
    return DateUtil.addMonths(date, amount);
  }

  public date(value?: any): Date | null {
    return DateUtil.date(value);
  }

  public endOfDay(date: Date): Date {
    return DateUtil.endOfDay(date);
  }

  public endOfYear(date: Date): Date {
    return DateUtil.endOfYear(date);
  }

  public format(date: Date, formatString: string): string {
    return DateUtil.format(date, formatString, this.locale, this.formats);
  }

  public getDiff(date: Date, comparing: string | Date, unit?: string): number {
    return DateUtil.getDiff(date, comparing, unit);
  }

  public getYear(date: Date): number {
    return DateUtil.getYear(date);
  }

  public getMonth(date: Date): number {
    return DateUtil.getMonth(date);
  }

  public getDay(date: Date): number {
    return DateUtil.getDay(date);
  }

  public getNextMonth(date: Date): Date {
    return DateUtil.getNextMonth(date);
  }

  public getWeekdays(): string[] {
    return DateUtil.getWeekdays(this.locale);
  }

  public isAfter(date: Date, comparing: Date): boolean {
    return DateUtil.isAfter(date, comparing);
  }

  public isBefore(date: Date, comparing: Date): boolean {
    return DateUtil.isBefore(date, comparing);
  }

  public isEqual(date: Date, comparing: Date): boolean {
    return DateUtil.isEqual(date, comparing);
  }

  public isSameDay(date: Date, comparing: Date): boolean {
    return DateUtil.isSameDay(date, comparing);
  }

  public isSameMonth(date: Date, comparing: Date): boolean {
    return DateUtil.isSameMonth(date, comparing);
  }

  public isValid(date: any): boolean {
    return DateUtil.isValid(date);
  }

  public isWithinRange(date: Date, range: [Date, Date]): boolean {
    return DateUtil.isWithinRange(date, range);
  }

  public parseISO(date: string): Date {
    return DateUtil.parseISO(date);
  }

  public setMonth(date: Date, month: number): Date {
    return DateUtil.setMonth(date, month);
  }

  public setYear(date: Date, year: number): Date {
    return DateUtil.setYear(date, year);
  }

  public startOfDay(date: Date): Date {
    return DateUtil.startOfDay(date);
  }

  public startOfYear(date: Date): Date {
    return DateUtil.startOfYear(date);
  }

  public toISO(date: Date): string {
    return DateUtil.toISO(this, date);
  }

  public toJsDate(date: Date): Date {
    return date;
  }

  getHour(date: Date): number {
    return DateUtil.getHour(date);
  }

  getMinute(date: Date): number {
    return DateUtil.getMinute(date);
  }

  setHour(date: Date, hour: number): Date {
    return DateUtil.setHour(date, hour);
  }

  setMinute(date: Date, minute: number): Date {
    return DateUtil.setMinute(date, minute);
  }
}
