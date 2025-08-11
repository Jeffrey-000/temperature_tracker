"use client";

import NavBar from "@/components/NavBar";
import CalandarGraphWrapper from "@/components/CalandarGraphWrapper";
import { useState } from "react";

export default function HomePageGovernor() {
  const [pageState, setPageState] = useState<string>("Overview");
  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <NavBar pageState={[pageState, setPageState]} />
      {pageState === "Overview" && <div>hi</div>}
      {pageState === "Graph" && <CalandarGraphWrapper />}
    </div>
  );
}
