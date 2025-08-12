import {
  disabledDatesType,
  type SensorData,
  type TopicMetaDataDto,
} from "./types";
import { toEpochTimeInSec } from "../lib/utils";
import { type DateRange } from "react-day-picker";

import { NetworkError, HttpError, JsonError, DataParseError } from "./error";

type TempJson = { temperature: number; humidity: number; time: number }[];
function parseSensorData(json: TempJson): SensorData[] {
  return json.map((item) => {
    return { ...item, time: new Date(item.time * 1000) };
  });
}

export async function fetchSensorData(
  topic: string,
  dateRange: DateRange | undefined
): Promise<SensorData[]> {
  const startEpoch = dateRange?.from
    ? toEpochTimeInSec(dateRange.from)
    : undefined;
  const stopEpoch = dateRange?.to ? toEpochTimeInSec(dateRange.to) : undefined;

  let response: Response;
  try {
    response = await fetch(
      `/api/data/${topic}?start=${startEpoch ?? ""}&stop=${stopEpoch ?? ""}`
    );
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

  let jsonData: TempJson;
  try {
    jsonData = await response.json();
  } catch (err) {
    throw new JsonError((err as Error).message);
  }

  try {
    return parseSensorData(jsonData);
  } catch (err) {
    throw new DataParseError((err as Error).message);
  }
}

export async function fetchValidDateRange(
  topic: string
): Promise<disabledDatesType> {
  let response: Response;
  try {
    response = await fetch(`/api/topics/${topic}/metadata`);
  } catch (e) {
    throw new NetworkError((e as Error).message);
  }
  if (!response.ok) {
    let errMsg: string;
    try {
      errMsg = await response.text();
      // eslint-disable-next-line
    } catch (e) {
      errMsg = "";
    }
    throw new HttpError(errMsg, response.status);
  }
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
  let response: Response;
  try {
    response = await fetch("/api/topics");
  } catch (e) {
    throw new NetworkError((e as Error).message);
  }
  if (!response.ok) {
    let errMsg: string;
    try {
      errMsg = await response.text();
      // eslint-disable-next-line
    } catch (e) {
      errMsg = "";
    }
    throw new HttpError(errMsg, response.status);
  }
  let jason: string[];
  try {
    jason = await response.json();
  } catch (e) {
    throw new JsonError((e as Error).message);
  }
  try {
    return jason;
    // return jason.map((data: string): RoomSelectorRoomType => {
    //   return {
    //     value: data,
    //     label: data
    //       .substring("sensors/temperature/".length) //cuts off front
    //       .replace("_", "/"),
    //   };
    // });
  } catch (e) {
    throw new DataParseError((e as Error).message);
  }
}
