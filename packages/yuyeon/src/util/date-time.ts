import { DateTime } from 'luxon';
import yeonyuUtils from 'yeonyu-utils';

const { dateFromObjectId } = yeonyuUtils.parser;

export const MILLISECOND_OF_DAY = 86400000;
export const MILLISECOND_OF_HOUR = 3600000;
export const MILLISECOND_OF_MINUTE = 60000;

export function getDate(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd');
}

export function getTime(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('HH:mm:ss');
}

export function getTimeWithNoon(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('h:mm a');
}

export function getDateTime(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd HH:mm:ss');
}

export function getTimezone(): number {
  return new Date().getTimezoneOffset() / -60;
}

export function convertObjectIdToTimestamp(objectId: string): number {
  return dateFromObjectId(objectId).getTime();
}

export function getStartTime(date: string): number {
  return DateTime.fromISO(`${date}T00:00:00`).toMillis();
}

export default {
  getDate,
  getTime,
};
