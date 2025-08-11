"use client";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { type TempData, type CalculatedDataPoints } from "@/lib/types";
import { useTheme } from "next-themes";

interface Props {
  data: TempData[] | undefined;
  title: string;
  calculatedDataPoints: CalculatedDataPoints;
}

export default function Graph({ data, title, calculatedDataPoints }: Props) {
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
        {
          x: calculatedDataPoints
            ? Object.values(calculatedDataPoints).map((reading) =>
                reading ? reading.time : null
              )
            : [],
          y: calculatedDataPoints
            ? Object.values(calculatedDataPoints).map((reading) =>
                reading ? reading.temperature : null
              )
            : [],
          type: "scatter",
          mode: "text+markers",
          marker: { color: "red", size: 5 },
          text:
            //calculatedDataPoints
            //   ? Object.entries(calculatedDataPoints).map(([key, value]) => {
            //       if (!value) {
            //         return "";
            //       }
            //       if (key.includes("current")) {
            //         return "Latest";
            //       }
            //       if (key.includes("Temp")) {
            //         if (value.time === calculatedDataPoints.current?.time) {
            //           return "";
            //         }
            //         return `${value.temperature.toFixed(1)}°F`;
            //       }
            //       if (key.includes("Humidity")) {
            //         return `${value.humidity.toFixed(1)}%`;
            //       }
            //       return "";
            //     })
            //   :
            undefined,
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
