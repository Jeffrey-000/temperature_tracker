"use client";

import Link from "next/link";

import ThemeToggle from "./ThemeToggle";
import { House } from "lucide-react";

export default function NavBar() {
  return (
    <div className="sticky top-0 bg-background w-full px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="ml-auto">
        {" "}
        <ThemeToggle />
      </div>
    </div>
  );
}
