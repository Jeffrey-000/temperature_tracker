"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { type TempData } from "./CalandarGraphWrapper";
import { useTheme } from "next-themes";

interface Props {
  data: TempData[] | undefined;
  title: string;
}

export default function Graph({ data, title }: Props) {
  const { theme } = useTheme();
  const lastTemp: TempData | undefined =
    data && data.length > 0 ? data[0] : undefined;
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
        {
          // Highlight last point
          x: lastTemp ? [lastTemp.time] : [],
          y: lastTemp ? [lastTemp.temperature] : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text: lastTemp ? [`${lastTemp.temperature.toFixed(1)}°F`] : [],
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
