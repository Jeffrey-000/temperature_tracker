import {
  type disabledDatesType,
  type TopicStats,
  type TopicStatsDB,
  type SensorData,
  type SensorDataDB,
  type TopicMetaDataDto,
} from "./types";
import { type DateRange } from "react-day-picker";
import { toEpochTimeInSec } from "./utils";

import { NetworkError, HttpError, JsonError, DataParseError } from "./error";

async function _fetch(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new NetworkError((err as Error).message);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      errorMessage = await response.text();
    } catch {
      errorMessage = "";
    }
    throw new HttpError(errorMessage, response.status);
  }
  return response;
}

export async function fetchSensorData(
  topic: string,
  dateRange: DateRange | undefined
): Promise<SensorData[]> {
  const startEpoch = dateRange?.from
    ? toEpochTimeInSec(dateRange.from)
    : undefined;
  const stopEpoch = dateRange?.to ? toEpochTimeInSec(dateRange.to) : undefined;

  const response: Response = await _fetch(
    `/api/data/${topic}?start=${startEpoch ?? ""}&stop=${stopEpoch ?? ""}`
  );

  let jason: SensorDataDB[];
  try {
    jason = await response.json();
  } catch (err) {
    throw new JsonError((err as Error).message);
  }

  try {
    return jason.map((item) => {
      return { ...item, time: new Date(item.time * 1000) };
    });
  } catch (err) {
    throw new DataParseError((err as Error).message);
  }
}

export async function fetchValidDateRange(
  topic: string
): Promise<disabledDatesType> {
  const response: Response = await _fetch(`/api/topics/${topic}/metadata`);
  let jason: TopicMetaDataDto;
  try {
    jason = await response.json();
  } catch (e) {
    throw new JsonError((e as Error).message);
  }
  try {
    return {
      before: new Date(Number(jason.start) * 1000),
      after: new Date(),
    };
  } catch (e) {
    throw new DataParseError((e as Error).message);
  }
}

export async function fetchTopics(): Promise<string[]> {
  const response: Response = await _fetch("/api/topics");
  try {
    return await response.json();
  } catch (e) {
    throw new JsonError((e as Error).message);
  }
}

export async function fetchTopicStatistics(topic: string): Promise<TopicStats> {
  const response: Response = await _fetch(`/api/data/${topic}/statistics`);
  let jason: TopicStatsDB;
  try {
    jason = await response.json();
  } catch (e) {
    throw new JsonError((e as Error).message);
  }

  try {
    return {
      current: {
        ...jason.current,
        time: new Date(jason.current.time * 1000),
      },
      maxTemp: jason.maxTemp.map((item) => ({
        ...item,
        time: new Date(item.time * 1000),
      })),

      minTemp: jason.minTemp.map((item) => ({
        ...item,
        time: new Date(item.time * 1000),
      })),

      maxHumidity: jason.maxHumidity.map((item) => ({
        ...item,
        time: new Date(item.time * 1000),
      })),

      minHumidity: jason.minHumidity.map((item) => ({
        ...item,
        time: new Date(item.time * 1000),
      })),
    };
  } catch (e) {
    throw new DataParseError((e as Error).message);
  }
}
