"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { type TempData } from "./CalandarGraphWrapper";

interface Props {
  data: TempData | undefined;
}

export default function Graph({ data }: Props) {
  return (
    <Plot
      className="w-full"
      data={[
        {
          x: data ? data.times : [],
          y: data ? data.temps : [],
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
