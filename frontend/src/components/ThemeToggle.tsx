"use client";

import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <button
            className=" px-4 py-2 font-semibold rounded-md z-10"
            onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
            }}
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
