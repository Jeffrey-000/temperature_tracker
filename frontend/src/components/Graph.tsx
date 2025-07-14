"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { type TempData } from "./CalandarGraphWrapper";
import { useTheme } from "next-themes";

interface Props {
  data: TempData | undefined;
  title: string;
}

export default function Graph({ data, title }: Props) {
  const { theme } = useTheme();
  return (
    <Plot
      className="w-full"
      data={[
        {
          x: data ? data.times : [],
          y: data ? data.temps : [],
          type: "scattergl", // <-- WebGL-accelerated rendering
          mode: "lines",
          line: { color: "#BB86FC" },
          name: "Temperature",
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
