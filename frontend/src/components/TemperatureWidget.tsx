import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import CurrentDataBox from "./CurrentDataBox";
import { type TopicStats } from "@/lib/types";

export default function TemperatureWidget({
  data,
  fixed,
}: {
  data: TopicStats;
  fixed?: boolean;
}) {
  const { mostRecent, maxTemp, minTemp, maxHumidity, minHumidity } = data;
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={`rounded-lg bg-blue-600 px-6 py-4 text-white shadow-lg hover:bg-blue-700 transition ${
            fixed ? "fixed bottom-6 right-6 z-50 " : ""
          }`}
          aria-label="Open Temperature and Humidity Drawer"
        >
          <CurrentDataBox current={mostRecent} />
        </button>
      </DrawerTrigger>

      <DrawerContent className="w-80 p-6">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">
            Temperature & Humidity Stats
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">Temperature (°F)</h3>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Max: ${maxTemp[0]?.temperature.toFixed(1)}`}</span>
              <span>{`(${maxTemp[0]?.time.toLocaleString()})`}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Min: ${minTemp[0]?.temperature.toFixed(1)}`}</span>
              <span>{`(${minTemp[0]?.time.toLocaleString()})`}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">Humidity (%)</h3>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Max: ${maxHumidity[0]?.humidity.toFixed(1)}`}</span>
              <span>{`(${maxHumidity[0]?.time.toLocaleString()})`}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{`Min: ${minHumidity[0]?.humidity.toFixed(1)}`}</span>
              <span>{`(${minHumidity[0]?.time.toLocaleString()})`}</span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
