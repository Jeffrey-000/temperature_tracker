"use client";
import {
  SensorData,
  disabledDatesType,
  TopicStats,
  TopicStatsDB,
} from "@/lib/types";
import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import CustomCalendar from "@/components/calendars/CustomCalendar";
import Graph from "@/components/Graph";
import { getPresets } from "@/components/calendars/CustomCalendar";
import { TopicSelector } from "./TopicSelector";
import TemperatureWidget from "./TemperatureWidget";
import {
  fetchSensorData,
  fetchValidDateRange,
  fetchTopics,
} from "@/lib/CalandarGraphWrapperFunctions";
import { FetchError } from "@/lib/error";

export default function CalandarGraphWrapper() {
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
        const savedTopic = localStorage.getItem("selectedTopic");
        if (savedTopic && topics.includes(savedTopic)) {
          setSelectedTopic(savedTopic);
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
    fetchValidDateRange(selectedTopic)
      .then((value) => setDisabledDates(value))
      .catch((err) => {
        if (err instanceof FetchError) {
          console.error("Fetch Error:", err.message, err.status);
        } else {
          console.error("Unexpected Error:", err);
        }
      });
  }, [selectedTopic]);

  useEffect(() => {
    async function getstats() {
      const response = await fetch(`/api/data/${selectedTopic}/statistics`);
      if (!response.ok) {
        return;
      }
      const jason: TopicStatsDB = await response.json();
      console.log(jason);

      setTopicStats({
        current: {
          ...jason.current,
          time: new Date(jason.current.time * 1000),
        },
        maxTemp: jason.maxTemp.map((item) => ({
          ...item,
          time: new Date(item.time * 1000),
        })),

        minTemp: jason.maxTemp.map((item) => ({
          ...item,
          time: new Date(item.time * 1000),
        })),

        maxHumidity: jason.maxHumidity.map((item) => ({
          ...item,
          time: new Date(item.time * 1000),
        })),

        minHumidity: jason.minHumidity.map((item) => ({
          ...item,
          time: new Date(item.time * 1000),
        })),
      });
    }
    getstats();
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
      {topicStats && <TemperatureWidget data={topicStats} />}
    </div>
  );
}
