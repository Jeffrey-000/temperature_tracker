"use client";
import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";
import { toEpochTimeInSec } from "./utils";
import { Card, CardContent } from "./ui/card";

type TempJson = [{ temperature: number; humidity: number; time: number }];
export type TempData = {
  temps: number[];
  hum: number[];
  times: Date[];
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
  const [data, setData] = useState<TempData | undefined>(undefined);
  const [disabledDates, setDisabledDates] = useState<disabledDatesType>();

  useEffect(() => {
    async function fetchData() {
      const URL = "/api/sensor";
      const startEpoch =
        dateRange && dateRange.from
          ? toEpochTimeInSec(dateRange.from)
          : undefined;
      const stopEpoch =
        dateRange && dateRange.to ? toEpochTimeInSec(dateRange.to) : undefined;
      const response = await fetch(
        `${URL}?start=${startEpoch ?? ""}&stop=${stopEpoch ?? ""}`
      );
      const jason = await response.json();
      const data = parseTempData(jason);
      if (data == undefined) return;
      setData(data);
      //console.log(data.temps.length);
    }
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    async function fetchValidDates() {
      const response = await fetch("/api/sensor/min_time");
      const timestr = await response.text();
      setDisabledDates({
        before: new Date(Number(timestr) * 1000),
        after: new Date(),
      });
    }
    fetchValidDates();
  }, []);

  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <CustomCalendar
        dateRangeState={[dateRange, setDateRange]}
        disabledDates={disabledDates}
      />
      <div className="w-full px-10">
        <Graph title="Bedroom Temps" data={data} />
      </div>
    </div>
  );
}

function parseTempData(json: TempJson): TempData {
  const temps = json.map((item) => item.temperature);
  const hum = json.map((item) => item.humidity);
  const times = json.map((item) => new Date(item.time * 1000)); //date assumes epoch time in ms
  return { temps, hum, times };
}
