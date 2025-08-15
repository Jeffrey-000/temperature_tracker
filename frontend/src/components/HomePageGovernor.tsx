"use client";

import NavBar from "@/components/NavBar";
import CalandarGraphWrapper from "@/components/CalandarGraphWrapper";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import OverviewGrid from "./OverviewGrid";

export default function HomePageGovernor() {
  const params = useSearchParams();
  const [pageState, setPageState] = useState<string>("");
  useEffect(() => {
    const tab = params.get("tab");
    setPageState(tab ?? "Overview");
  }, [params]);
  return (
    <div className="container flex flex-col items-center max-w-[100vw] ">
      <NavBar pageState={[pageState, setPageState]} />
      {pageState === "Overview" && <OverviewGrid />}
      {pageState === "Graph" && <CalandarGraphWrapper />}
    </div>
  );
}
