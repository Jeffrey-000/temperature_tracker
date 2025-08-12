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
          type: "scattergl", // <-- WebGL-accelerated rendering
          mode: "lines",
          line: { color: "#BB86FC" },
          name: "Temperature",
        },
        // {
        //   x: topicStats
        //     ? Object.values(topicStats).map((reading) =>
        //         reading ? reading.time : null
        //       )
        //     : [],
        //   y: topicStats
        //     ? Object.values(topicStats).map((reading) =>
        //         reading ? reading.temperature : null
        //       )
        //     : [],
        //   type: "scatter",
        //   mode: "text+markers",
        //   marker: { color: "red", size: 5 },
        //   text:
        //     //topicStats
        //     //   ? Object.entries(topicStats).map(([key, value]) => {
        //     //       if (!value) {
        //     //         return "";
        //     //       }
        //     //       if (key.includes("current")) {
        //     //         return "Latest";
        //     //       }
        //     //       if (key.includes("Temp")) {
        //     //         if (value.time === topicStats.current?.time) {
        //     //           return "";
        //     //         }
        //     //         return `${value.temperature.toFixed(1)}°F`;
        //     //       }
        //     //       if (key.includes("Humidity")) {
        //     //         return `${value.humidity.toFixed(1)}%`;
        //     //       }
        //     //       return "";
        //     //     })
        //     //   :
        //     undefined,
        //   textposition: "top center",
        //   showlegend: false,
        // },
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
