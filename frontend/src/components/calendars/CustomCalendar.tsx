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
  setDateRange({
    from: new Date(),
    to: new Date(),
  }); //default to today
  const [disabledDates, setDisabledDates] = useState<disabledDatesType>();
  const [state, setState] = useState<String>("Today");

  useEffect(() => {
    async function fetchValidDates() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDisabledDates({
        before: subDays(new Date(), 14),
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
        {[
          { label: "Today", from: new Date(), to: new Date() },
          {
            label: "Yesterday",
            from: subDays(new Date(), 1),
            to: subDays(new Date(), 1),
          },
          {
            label: "Past 3 Days",
            from: subDays(new Date(), 2),
            to: new Date(),
          },
          { label: "Past Week", from: subDays(new Date(), 6), to: new Date() },
          {
            label: "Past Month",
            from: subMonths(new Date(), 1),
            to: new Date(),
          },
        ].map((preset, index) => (
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
          min={2}
          max={20}
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
