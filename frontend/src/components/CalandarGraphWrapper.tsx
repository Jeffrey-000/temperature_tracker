"use client";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";

export default function CalandarGraphWrapper() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <CustomCalendar dateRangeState={[dateRange, setDateRange]} />
      <Graph dateRangeState={[dateRange, setDateRange]} />
    </div>
  );
}
