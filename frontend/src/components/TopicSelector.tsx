"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";

import { stateTuple } from "../lib/utils";

type Props = {
  topicList: string[];
  valueState: stateTuple<string>;
};

export default function TopicSelector({ topicList, valueState }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = valueState;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-min-[200px] justify-between"
        >
          {value
            ? topicList.find((topic) => topic === value)
            : "Select room..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-min-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search room..." className="h-9" />
          <CommandList>
            <CommandEmpty>No room found.</CommandEmpty>
            <CommandGroup>
              {topicList.map((topic) => (
                <CommandItem
                  key={topic}
                  value={topic}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set(
                      "topic",
                      currentValue === value ? "" : currentValue
                    );
                    router.push(`?${params.toString()}`);
                  }}
                >
                  {topic}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === topic ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
