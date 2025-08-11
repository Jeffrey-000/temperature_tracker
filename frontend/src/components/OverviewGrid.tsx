import CurrentDataBox from "./CurrentDataBox";
import { type TempData } from "@/lib/types";

type OverviewGridElement = {
  topic: string;
  data: TempData;
};
interface Props {
  gridElements: OverviewGridElement[];
}
export default function OverviewGrid({ gridElements }: Props) {
  return (
    <div className="grid grid-cols-3">
      {gridElements.map((item, index) => {
        return (
          <div className="flex flex-col items-center" key={index}>
            <p>{item.topic}</p>
            <CurrentDataBox current={item.data} />
          </div>
        );
      })}
    </div>
  );
}
