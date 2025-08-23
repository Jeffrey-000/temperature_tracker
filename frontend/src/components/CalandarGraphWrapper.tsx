"use client";
import {
  type SensorData,
  type disabledDatesType,
  type TopicStats,
} from "@/lib/types";
import { type DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";
import TopicSelector from "./TopicSelector";
import TemperatureWidget from "./TemperatureWidget";
import {
  fetchSensorData,
  fetchValidDateRange,
  fetchTopics,
  fetchTopicStatistics,
} from "@/lib/fetch";
import { FetchError } from "@/lib/error";

export default function CalandarGraphWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presets = getPresets();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: presets[0].from,
    to: presets[0].to,
  });
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [disabledDates, setDisabledDates] = useState<disabledDatesType>();
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const [topicList, setTopicList] = useState<string[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStats>();

  useEffect(() => {
    fetchTopics()
      .then((topics) => {
        setTopicList(topics);
        const topicParam = searchParams.get("topic"); //localStorage.getItem("selectedTopic");
        if (topicParam && topics.includes(topicParam)) {
          setSelectedTopic(topicParam);
        } else if (searchParams.has("topic")) {
          const param = new URLSearchParams(searchParams.toString());
          param.set("topic", "");
          router.push(`?${param.toString()}`);
        }
      })
      .catch((err) => {
        if (err instanceof FetchError) {
          console.error("Fetch Error:", err.message, err.status);
        } else {
          console.error("Unexpected Error:", err);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedTopic.length === 0) {
      setSensorData([]);
      return;
    }
    fetchSensorData(selectedTopic, dateRange)
      .then((sensorData) => setSensorData(sensorData))
      .catch((err) => {
        if (err instanceof FetchError) {
          console.error("Fetch Error:", err.message, err.status);
        } else {
          console.error("Unexpected Error:", err);
        }
      });

    localStorage.setItem("selectedTopic", selectedTopic);
  }, [dateRange, selectedTopic]);

  useEffect(() => {
    if (selectedTopic.length === 0) {
      return;
    }
    fetchValidDateRange(selectedTopic)
      .then((value) => setDisabledDates(value))
      .catch((err) => {
        if (err instanceof FetchError) {
          console.error("Fetch Error:", err.message, err.status);
        } else {
          console.error("Unexpected Error:", err);
        }
      });
    let start: Date | number | undefined = dateRange
      ? dateRange.from ?? undefined
      : undefined;
    start = start ? Math.floor(start.getTime() / 1000) : undefined;

    fetchTopicStatistics(selectedTopic, start)
      .then((data) => setTopicStats(data))
      .catch((err) => {
        if (err instanceof FetchError) {
          console.error("Fetch Error:", err.message, err.status);
        } else {
          console.error("Unexpected Error:", err);
        }
      });
  }, [selectedTopic]);

  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <TopicSelector
        valueState={[selectedTopic, setSelectedTopic]}
        topicList={topicList}
      />
      <CustomCalendar
        dateRangeState={[dateRange, setDateRange]}
        disabledDates={disabledDates}
      ></CustomCalendar>
      <div className="w-full px-10 flex flex-col items-center justify-between pt-2">
        <Graph
          title={selectedTopic
            .substring("sensors/temperature/".length) //cuts off front
            .replace("_", "/")}
          data={sensorData}
          topicStats={topicStats}
        />
      </div>
      {topicStats && <TemperatureWidget data={topicStats} fixed />}
    </div>
  );
}
