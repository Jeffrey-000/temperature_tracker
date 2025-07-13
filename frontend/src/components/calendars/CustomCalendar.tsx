"use client";
import { Calendar } from "../ui/calendar";
import { useState, useEffect, useMemo } from "react";
import { type DateRange } from "react-day-picker";
import { addDays, subDays, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { stateTuple } from "../utils";

type disabledDatesType = {
  before?: Date;
  after?: Date;
  dates?: Date[];
};

interface Props {
  dateRangeState: stateTuple<DateRange | undefined>;
}

export default function CustomCalendar({ dateRangeState }: Props) {
  const [dateRange, setDateRange] = dateRangeState;
  const [disabledDates, setDisabledDates] = useState<disabledDatesType>();
  const [state, setState] = useState<String>("Today");

  useEffect(() => {
    async function fetchValidDates() {
      const response = await fetch("/api/sensor/min_time");
      const timestr = await response.text();
      setDisabledDates({
        before: new Date(Number(timestr) * 1000),
        after: new Date(),
      });
    }
    fetchValidDates();
  }, []);
  const disabledMatcher = useMemo(() => {
    return (date: Date) => {
      // Static rule: Always disable dates before .before date
      if (
        disabledDates &&
        disabledDates.before &&
        date < subDays(disabledDates.before, 1) //for some reason it includes the before date. fix by subtracting an extra date
      ) {
        return true;
      }

      // Static rule: Disable dates after a certain date
      if (disabledDates && disabledDates.after && date > disabledDates.after) {
        return true;
      }

      // Dynamic rule: Check if date is in our disabled dates array
      if (disabledDates && disabledDates.dates) {
        return disabledDates.dates.some(
          (disabledDate) =>
            date.getFullYear() === disabledDate.getFullYear() &&
            date.getMonth() === disabledDate.getMonth() &&
            date.getDate() === disabledDate.getDate()
        );
      }
      return false;
    };
  }, [disabledDates]);

  return (
    <Card className="w-fit min-w-1/3 py-4">
      <CardHeader className="flex flex-wrap">
        {getPresets().map((preset, index) => (
          <Button
            key={index}
            variant={state == preset.label ? undefined : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setState(preset.label);
              setDateRange({
                from:
                  disabledDates &&
                  disabledDates.before &&
                  preset.from >= disabledDates.before
                    ? preset.from
                    : disabledDates?.before,
                to: preset.to,
              });
            }}
          >
            {preset.label}
          </Button>
        ))}{" "}
        <Button
          variant={state == "Custom" ? undefined : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => {
            setState("Custom");
            //setDateRange({ from: undefined, to: undefined });
          }}
        >
          {"Custom"}
        </Button>
      </CardHeader>
      <CardContent className="px-4 flex justify-center">
        <Calendar
          mode="range"
          defaultMonth={subMonths(new Date(), 1)}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          disabled={disabledMatcher}
          showOutsideDays={false}
          className={`rounded-lg border shadow-sm ${
            state == "Custom" ? "" : "hidden"
          }`}
        />
      </CardContent>
    </Card>
  );
}

export function getPresets(): { label: string; from: Date; to: Date }[] {
  const now = new Date();
  const midnightToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  let presetVals = [
    { label: "Today", from: midnightToday, to: now },
    {
      label: "Yesterday",
      from: subDays(midnightToday, 1),
      to: midnightToday,
    },
    {
      label: "Past 3 Days",
      from: subDays(midnightToday, 2),
      to: new Date(),
    },
    { label: "Past Week", from: subDays(midnightToday, 6), to: new Date() },
    {
      label: "Past Month",
      from: subMonths(midnightToday, 1),
      to: new Date(),
    },
  ];
  return presetVals;
}
