"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import { type Data } from "plotly.js";

import { type SensorData, type TopicStats } from "@/lib/types";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
interface Props {
  data: SensorData[] | undefined;
  title: string;
  topicStats?: TopicStats;
}
const checkBoxOptions = [
  { id: "temperature" },
  { id: "humidity" },
  { id: "stats" },
];
export default function Graph({ data, title, topicStats }: Props) {
  const { theme } = useTheme();
  const [plotData, setPlotData] = useState<Data[]>([]);
  const [checked, setChecked] = useState<string[]>(["temperature"]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (checked.includes("temperature")) {
      if (
        !plotData.some((elem) => elem.name?.toLowerCase() === "temperature")
      ) {
        setPlotData((prev) => [...prev, temperaturePlotData(data)]);
      }
    } else {
      setPlotData((prev) =>
        prev.filter((item) => item.name?.toLowerCase() !== "temperature")
      );
    }
    if (checked.includes("humidity")) {
      if (!plotData.some((elem) => elem.name?.toLowerCase() === "humidity")) {
        setPlotData((prev) => [...prev, humidityPlotData(data)]);
      }
    } else {
      setPlotData((prev) =>
        prev.filter((item) => item.name?.toLowerCase() !== "humidity")
      );
    }

    setPlotData((prev) => prev.filter((item) => item.name !== "stats")); //always remove stats on check change then add them back in conditionally
    if (checked.includes("stats")) {
      setPlotData((prev) => [
        ...prev,
        ...(topicStats && checked.includes("temperature")
          ? tempStatsPlotData(topicStats)
          : []),
        ...(topicStats && checked.includes("humidity")
          ? humStatsPlotData(topicStats)
          : []),
      ]);
    }
    //warning for missing plotdata in dependencies
    // eslint-disable-next-line
  }, [data, topicStats, checked]);
  return (
    <>
      <div className="flex flex-row gap-2">
        {checkBoxOptions.map((option) => (
          <div className="flex items-center space-x-2" key={option.id}>
            <Checkbox
              id={option.id}
              checked={checked.includes(option.id)}
              onCheckedChange={(check) => {
                if (check) {
                  setChecked([...checked, option.id]);
                } else {
                  setChecked((prev) =>
                    prev.filter((item) => item !== option.id)
                  );
                }
              }}
            />
            <Label htmlFor={option.id}>
              {option.id.charAt(0).toUpperCase() + option.id.slice(1)}
            </Label>
          </div>
        ))}
      </div>
      <Plot
        className="w-full"
        data={plotData}
        layout={{
          title: { text: title },
          autosize: true,
          plot_bgcolor: theme === "dark" ? "#171717" : undefined,
          paper_bgcolor: theme === "dark" ? "#171717" : undefined,
        }}
        useResizeHandler={true}
      />
    </>
  );
}
//#BB86FC

function temperaturePlotData(data: SensorData[]): Data {
  return {
    x: data ? data.map((item) => item.time) : [],
    y: data ? data.map((item) => item.temperature) : [],
    type: "scattergl",
    mode: "lines",
    line: { color: "#BB86FC" },
    name: "Temperature",
  };
}

function humidityPlotData(data: SensorData[]): Data {
  return {
    x: data ? data.map((item) => item.time) : [],
    y: data ? data.map((item) => item.humidity) : [],
    type: "scattergl",
    mode: "lines",
    line: { color: "#86c7fc" },
    name: "Humidity",
  };
}
function tempStatsPlotData(topicStats: TopicStats): Data[] {
  return [
    {
      x: topicStats ? topicStats.maxTemp.map((item) => item.time) : [],
      y: topicStats ? topicStats.maxTemp.map((item) => item.temperature) : [],
      type: "scatter",
      mode: "text+markers",
      marker: { color: "red", size: 5 },
      text: undefined,
      textposition: "top center",
      showlegend: false,
      name: "stats",
    },
    {
      x: topicStats ? topicStats.minTemp.map((item) => item.time) : [],
      y: topicStats ? topicStats.minTemp.map((item) => item.temperature) : [],
      type: "scatter",
      mode: "text+markers",
      marker: { color: "red", size: 5 },
      text: undefined,
      textposition: "top center",
      showlegend: false,
      name: "stats",
    },
  ];
}
function humStatsPlotData(topicStats: TopicStats): Data[] {
  return [
    {
      x: topicStats ? topicStats.maxHumidity.map((item) => item.time) : [],
      y: topicStats ? topicStats.maxHumidity.map((item) => item.humidity) : [],
      type: "scatter",
      mode: "text+markers",
      marker: { color: "red", size: 5 },
      text: undefined,
      textposition: "top center",
      showlegend: false,
      name: "stats",
    },
    {
      x: topicStats ? topicStats.minHumidity.map((item) => item.time) : [],
      y: topicStats ? topicStats.minHumidity.map((item) => item.humidity) : [],
      type: "scatter",
      mode: "text+markers",
      marker: { color: "red", size: 5 },
      text: undefined,
      textposition: "top center",
      showlegend: false,
      name: "stats",
    },
  ];
}
