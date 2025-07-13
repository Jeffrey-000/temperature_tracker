"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { stateTuple } from "@/components/utils";
import { DateRange } from "react-day-picker";

type TempData = {
  temps: number[];
  hum: number[];
  times: Date[];
};
type TempJson = [{ temperature: number; humidity: number; time: number }];

interface Props {
  dateRangeState: stateTuple<DateRange | undefined>;
}
const URL = "/api/sensor";

export default function Graph({ dateRangeState }: Props) {
  const [dateRange, setDateRange] = dateRangeState;
  const [data, setData] = useState<TempData | undefined>(undefined);
  useEffect(() => {
    async function fetchData(limit: number) {
      const response = await fetch(
        `${URL}${limit != null ? `?limit=${limit}` : ""}`
      );
      const jason = await response.json();
      const data = parseTempData(jason);
      if (data == undefined) return;
      setData(data);
      console.log(data.temps.length);
    }
    fetchData(10);
  }, []);
  return (
    <>
      <GraphComponent
        timestamps={data != undefined ? data.times : []}
        temperatureData={data != undefined ? data.temps : []}
      />
    </>
  );
}
//**
function GraphComponent({
  timestamps,
  temperatureData,
}: {
  timestamps: Date[];
  temperatureData: number[];
}) {
  return (
    <Plot
      className="w-full"
      data={[
        {
          x: timestamps,
          y: temperatureData,
          type: "scattergl", // <-- WebGL-accelerated rendering
          mode: "lines",
          line: { color: "red" },
          name: "Temperature",
        },
      ]}
      layout={{
        title: { text: "Temperature Over Time" },

        autosize: true,
      }}
      useResizeHandler={true}
    />
  );
}
//**/
function parseTempData(json: TempJson): TempData {
  let temps = json.map((item) => item.temperature);
  let hum = json.map((item) => item.humidity);
  let times = json.map((item) => new Date(item.time * 1000)); //date assumes epoch time in ms
  return { temps, hum, times };
}
