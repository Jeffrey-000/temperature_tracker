"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { type SensorData, type TopicStats } from "@/lib/types";
import { useTheme } from "next-themes";

interface Props {
  data: SensorData[] | undefined;
  title: string;
  topicStats?: TopicStats;
}
export default function Graph({ data, title, topicStats }: Props) {
  const { theme } = useTheme();

  return (
    <Plot
      className="w-full"
      data={[
        {
          x: data ? data.map((item) => item.time) : [],
          y: data ? data.map((item) => item.temperature) : [],
          type: "scattergl",
          mode: "lines",
          line: { color: "#BB86FC" },
          name: "Temperature",
        },
        {
          x: data ? data.map((item) => item.time) : [],
          y: data ? data.map((item) => item.humidity) : [],
          type: "scattergl",
          mode: "lines",
          line: { color: "#86c7fc" },
          name: "Humidity",
        },
        {
          x: topicStats ? topicStats.maxTemp.map((item) => item.time) : [],
          y: topicStats
            ? topicStats.maxTemp.map((item) => item.temperature)
            : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text: undefined,
          textposition: "top center",
          showlegend: false,
        },
        {
          x: topicStats ? topicStats.minTemp.map((item) => item.time) : [],
          y: topicStats
            ? topicStats.minTemp.map((item) => item.temperature)
            : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text: undefined,
          textposition: "top center",
          showlegend: false,
        },
        {
          x: topicStats ? topicStats.maxHumidity.map((item) => item.time) : [],
          y: topicStats
            ? topicStats.maxHumidity.map((item) => item.humidity)
            : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text: undefined,
          textposition: "top center",
          showlegend: false,
        },
        {
          x: topicStats ? topicStats.minHumidity.map((item) => item.time) : [],
          y: topicStats
            ? topicStats.minHumidity.map((item) => item.humidity)
            : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text: undefined,
          textposition: "top center",
          showlegend: false,
        },
      ]}
      layout={{
        title: { text: title },
        autosize: true,
        plot_bgcolor: theme === "dark" ? "#171717" : undefined,
        paper_bgcolor: theme === "dark" ? "#171717" : undefined,
      }}
      useResizeHandler={true}
    />
  );
}
//#BB86FC
