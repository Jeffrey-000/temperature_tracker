"use client";
import { useState, useEffect, useMemo } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";
import { toEpochTimeInSec } from "../lib/utils";
import { RoomSelector, RoomSelectorRoomType } from "./RoomSelector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import CurrentDataBox from "./CurrentDataBox";
import { TempData, disabledDatesType, CalculatedDataPoints } from "@/lib/types";

type TempJson = [{ temperature: number; humidity: number; time: number }];

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
      const URL = `/api/data/${selectorValue}`;
      const startEpoch =
        dateRange && dateRange.from
          ? toEpochTimeInSec(dateRange.from)
          : undefined;
      const stopEpoch =
        dateRange && dateRange.to ? toEpochTimeInSec(dateRange.to) : undefined;
      const response = await fetch(
        `${URL}?start=${startEpoch ?? ""}&stop=${stopEpoch ?? ""}`
      );
      if (!response.ok) return;
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
    localStorage.setItem("selectorValue", selectorValue);
  }, [dateRange, selectorValue]);

  useEffect(() => {
    async function fetchValidDates() {
      const response = await fetch(`/api/topics/${selectorValue}/metadata`);
      const timestr = await response.json();
      setDisabledDates({
        before: new Date(Number(timestr.start) * 1000),
        after: new Date(),
      });
    }
    async function fetchSelectorData() {
      const response = await fetch("/api/topics");
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

      const saved = localStorage.getItem("selectorValue");
      if (data && data.length > 0) {
        if (saved && data.includes(saved)) {
          setSelectorValue(saved);
        } else {
          setSelectorValue(data[0]); // ----------> sets default chart to first item in topic list
        }
      }
    }
    fetchValidDates();
    fetchSelectorData();
  }, []);

  const calculatedDataPoints: CalculatedDataPoints =
    useMemo((): CalculatedDataPoints => {
      if (!data || data.length === 0) {
        return {
          current: null,
          maxTemp: null,
          minTemp: null,
          maxHumidity: null,
          minHumidity: null,
        };
      }

      const last = data[data.length - 1];

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
        current: last,

        ...result,
      };
    }, [data]);

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
          calculatedDataPoints={calculatedDataPoints}
        />
      </div>
      {<TemperatureWidget data={calculatedDataPoints} />}
    </div>
  );
}

function parseTempData(json: TempJson): TempData[] {
  return json.map((item) => {
    return { ...item, time: new Date(item.time * 1000) };
  });
}

function TemperatureWidget({ data }: { data: CalculatedDataPoints }) {
  const { current, maxTemp, minTemp, maxHumidity, minHumidity } = data;
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-blue-600 px-6 py-4 text-white shadow-lg hover:bg-blue-700 transition"
          aria-label="Open Temperature and Humidity Drawer"
        >
          <CurrentDataBox current={current} />
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
