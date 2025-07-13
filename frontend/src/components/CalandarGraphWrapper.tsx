"use client";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";

export default function CalandarGraphWrapper() {
  const presets = getPresets();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: presets[0].from,
    to: presets[0].to,
  });

  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <CustomCalendar dateRangeState={[dateRange, setDateRange]} />
      <Graph dateRangeState={[dateRange, setDateRange]} />
    </div>
  );
}
