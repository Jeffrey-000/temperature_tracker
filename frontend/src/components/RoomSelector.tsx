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

import { stateTuple } from "../lib/utils";

export type RoomSelectorRoomType = { value: string; label: string };

type Props = {
  rooms: RoomSelectorRoomType[];
  valueState: stateTuple<string>;
};

export function RoomSelector({ rooms, valueState }: Props) {
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
            ? rooms.find((room) => room.value === value)?.label
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
              {rooms.map((room) => (
                <CommandItem
                  key={room.value}
                  value={room.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {room.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === room.value ? "opacity-100" : "opacity-0"
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
