import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type TopicStats } from "@/lib/types";
import { fetchTopics, fetchTopicStatistics } from "@/lib/fetch";
import TemperatureWidget from "./TemperatureWidget";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

export default function OverviewGrid() {
  const router = useRouter();
  const searchParms = useSearchParams();
  const [gridElements, setGridElements] = useState<Record<string, TopicStats>>(
    {}
  );
  const [topics, setTopics] = useState<string[]>([]);
  useEffect(() => {
    fetchTopics().then((topics) => {
      setTopics(topics);

      topics.forEach((topic) =>
        fetchTopicStatistics(topic).then((stats) =>
          setGridElements((previous) => ({ ...previous, [topic]: stats }))
        )
      );
    });
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
      {topics.map((topic) => (
        <div
          key={topic}
          className={`flex flex-col p-4 rounded shadow transition-all duration-300
                      ${gridElements[topic] ? "opacity-100" : "opacity-0"}`}
        >
          <h3>
            {topic.substring("sensors_temperature_".length).replace("_", "/")}
          </h3>
          {gridElements[topic] ? (
            <div className="flex flex-col md:flex-row items-center">
              <TemperatureWidget data={gridElements[topic]} />
              <Button
                variant={"link"}
                onClick={() => {
                  const params = new URLSearchParams(searchParms.toString());
                  params.set("topic", topic);
                  params.set("tab", "Graph");
                  router.push(`?${params}`);
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>
      ))}
    </div>
  );
}
