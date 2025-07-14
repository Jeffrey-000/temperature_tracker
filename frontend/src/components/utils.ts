import { Dispatch, SetStateAction } from "react";

export type stateTuple<T> = [T, Dispatch<SetStateAction<T>>];

export function dateAtMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toEpochTimeInSec(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
