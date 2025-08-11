"use client";
import { Calendar } from "../ui/calendar";
import { useState, useMemo } from "react";
import { type DateRange } from "react-day-picker";
import { subDays, subMonths } from "date-fns";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { disabledDatesType } from "@/lib/types";
import { dateAtMidnight, stateTuple } from "@/lib/utils";
interface Props {
  dateRangeState: stateTuple<DateRange | undefined>;
  disabledDates: disabledDatesType | undefined;
  children?: React.ReactNode;
}

export default function CustomCalendar({
  dateRangeState,
  disabledDates,
}: Props) {
  const [dateRange, setDateRange] = dateRangeState;
  const [state, setState] = useState<string>("Today");

  const disabledMatcher = useMemo(() => {
    return (date: Date) => {
      const beforeDateMidnight = //normalize the dates to midnight first
        disabledDates && disabledDates.before
          ? dateAtMidnight(disabledDates.before)
          : undefined;
      const afterDateMidnight =
        disabledDates && disabledDates.after
          ? dateAtMidnight(disabledDates.after)
          : undefined;
      // Static rule: Always disable dates before .before date
      if (
        beforeDateMidnight &&
        date < beforeDateMidnight //for some reason it includes the before date. fix by subtracting an extra date
      ) {
        return true;
      }

      // Static rule: Disable dates after a certain date
      if (afterDateMidnight && date > afterDateMidnight) {
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
        ))}
        <Button
          variant={state == "Custom" ? undefined : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => {
            setState("Custom");
          }}
        >
          {"Custom"}
        </Button>
      </CardHeader>
      <CardContent className="px-4 flex justify-center">
        {state == "Custom" && (
          <Calendar
            className={`rounded-lg border shadow-sm `}
            mode="range"
            defaultMonth={subMonths(new Date(), 1)}
            numberOfMonths={2}
            selected={dateRange}
            onSelect={setDateRange}
            disabled={disabledMatcher}
            showOutsideDays={false}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function getPresets(): { label: string; from: Date; to: Date }[] {
  const now = new Date();
  const midnightToday = dateAtMidnight(now);
  return [
    { label: "Today", from: midnightToday, to: now },
    {
      label: "Yesterday",
      from: subDays(midnightToday, 1),
      to: midnightToday,
    },
    {
      label: "Past 3 Days",
      from: subDays(midnightToday, 2),
      to: now,
    },
    { label: "Past Week", from: subDays(midnightToday, 6), to: now },
    {
      label: "Past Month",
      from: subMonths(midnightToday, 1),
      to: now,
    },
  ];
}
