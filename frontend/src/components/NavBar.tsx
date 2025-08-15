"use client";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { stateTuple } from "../lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageState: stateTuple<string>;
}

const sections = ["Overview", "Graph"];
export default function NavBar({ pageState }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_pageState, setPageState] = pageState;
  return (
    <div className="sticky top-0 bg-background w-full px-4 py-3 flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div></div>
      <div>
        {sections.map((item, index) => (
          <Button
            className={_pageState === item ? "underline" : ""}
            key={index}
            onClick={() => {
              setPageState(item);
              const params = new URLSearchParams(searchParams.toString());
              params.set("tab", item);
              router.push(`?${params.toString()}`);
            }}
            variant={"link"}
          >
            {item}
          </Button>
        ))}
      </div>
      <ThemeToggle />
    </div>
  );
}
