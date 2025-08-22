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
// eslint-disable-next-line
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
