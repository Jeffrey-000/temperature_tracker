"use client";
import { useState, useEffect, useMemo } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";
import { toEpochTimeInSec } from "./utils";
import { RoomSelector, RoomSelectorRoomType } from "./RoomSelector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type TempJson = [{ temperature: number; humidity: number; time: number }];
export type TempData = {
  temperature: number;
  humidity: number;
  time: Date;
};
export type disabledDatesType = {
  before?: Date;
  after?: Date;
  dates?: Date[];
};

export default function CalandarGraphWrapper() {
  const presets = getPresets();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: presets[0].from,
    to: presets[0].to,
  });
  const [data, setData] = useState<TempData[] | undefined>(undefined);
  const [disabledDates, setDisabledDates] = useState<disabledDatesType>();
  const [selectorValue, setSelectorValue] = useState<string>("");

  const [selectorData, setSelectorData] = useState<RoomSelectorRoomType[]>([]);

  useEffect(() => {
    async function fetchData() {
      const URL = "/api/sensor/temps";
      const startEpoch =
        dateRange && dateRange.from
          ? toEpochTimeInSec(dateRange.from)
          : undefined;
      const stopEpoch =
        dateRange && dateRange.to ? toEpochTimeInSec(dateRange.to) : undefined;
      const response = await fetch(
        `${URL}?start=${startEpoch ?? ""}&stop=${
          stopEpoch ?? ""
        }&topic=${selectorValue}`
      );
      const jason = await response.json();
      const data = parseTempData(jason);
      if (data == undefined) return;
      setData(data);
      //console.log(data.temps.length);
    }
    if (selectorValue.length === 0) {
      setData(undefined);
      return;
    }
    fetchData();
  }, [dateRange, selectorValue]);

  useEffect(() => {
    async function fetchValidDates() {
      const response = await fetch("/api/sensor/min_time");
      const timestr = await response.text();
      setDisabledDates({
        before: new Date(Number(timestr) * 1000),
        after: new Date(),
      });
    }
    async function fetchSelectorData() {
      const response = await fetch("/api/sensor/topic_list");
      const data = await response.json();
      setSelectorData(
        data.map((data: string): RoomSelectorRoomType => {
          return {
            value: data,
            label: data
              .substring("sensors/temperature/".length) //cuts off front
              .replace("_", "/"),
          };
        })
      );
      if (data && data.length > 0) {
        setSelectorValue(data[0]); // ----------> sets default chart to first item in topic list
      }
    }
    fetchValidDates();
    fetchSelectorData();
  }, []);

  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <RoomSelector
        valueState={[selectorValue, setSelectorValue]}
        rooms={selectorData}
      />
      <CustomCalendar
        dateRangeState={[dateRange, setDateRange]}
        disabledDates={disabledDates}
      ></CustomCalendar>
      <div className="w-full px-10 flex flex-col items-center justify-between pt-2">
        <Graph
          title={selectorValue
            .substring("sensors/temperature/".length) //cuts off front
            .replace("_", "/")}
          data={data}
        />
      </div>
      {<TemperatureWidget data={data} />}
    </div>
  );
}

function parseTempData(json: TempJson): TempData[] {
  return json.map((item) => {
    return { ...item, time: new Date(item.time * 1000) };
  });
}

function TemperatureWidget({ data }: { data: TempData[] | undefined }) {
  const {
    currentTemp,
    currentHumidity,
    maxTemp,
    minTemp,
    maxHumidity,
    minHumidity,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        currentTemp: null,
        currentHumidity: null,
        maxTemp: null,
        minTemp: null,
        maxHumidity: null,
        minHumidity: null,
      };
    }

    const last = data[data.length - 1]; // usually last is the current/latest

    const result = data.reduce(
      (acc, item) => {
        return {
          maxTemp:
            item.temperature > acc.maxTemp.temperature ? item : acc.maxTemp,
          minTemp:
            item.temperature < acc.minTemp.temperature ? item : acc.minTemp,
          maxHumidity:
            item.humidity > acc.maxHumidity.humidity ? item : acc.maxHumidity,
          minHumidity:
            item.humidity < acc.minHumidity.humidity ? item : acc.minHumidity,
        };
      },
      {
        maxTemp: data[0],
        minTemp: data[0],
        maxHumidity: data[0],
        minHumidity: data[0],
      }
    );

    return {
      currentTemp: last.temperature,
      currentHumidity: last.humidity,
      ...result,
    };
  }, [data]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-blue-600 px-6 py-4 text-white shadow-lg hover:bg-blue-700 transition"
          aria-label="Open Temperature and Humidity Drawer"
        >
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg font-bold">
              🌡 {currentTemp?.toFixed(1)}°F
            </span>
            <span className="text-sm opacity-80">
              💧 {currentHumidity?.toFixed(1)}%
            </span>
          </div>
        </button>
      </DrawerTrigger>

      <DrawerContent className="w-80 p-6">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">
            Temperature & Humidity Stats
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">Temperature (°F)</h3>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Max: ${maxTemp?.temperature.toFixed(1)}`}</span>
              <span>{`(${maxTemp?.time.toLocaleString()})`}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Min: ${minTemp?.temperature.toFixed(1)}`}</span>
              <span>{`(${minTemp?.time.toLocaleString()})`}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">Humidity (%)</h3>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Max: ${maxHumidity?.humidity.toFixed(1)}`}</span>
              <span>{`(${maxHumidity?.time.toLocaleString()})`}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Min: ${minHumidity?.humidity.toFixed(1)}`}</span>
              <span>{`(${minHumidity?.time.toLocaleString()})`}</span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
