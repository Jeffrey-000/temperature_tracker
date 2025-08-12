import { SensorData } from "@/lib/types";

interface Props {
  current: SensorData;
}

export default function CurrentDataBox({ current }: Props) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <span className="text-lg font-bold">
        🌡 {current.temperature.toFixed(1)}°F
      </span>
      <span className="text-sm opacity-80">
        💧 {current.humidity.toFixed(1)}%
      </span>
    </div>
  );
}
