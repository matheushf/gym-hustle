"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Define a type for a season entry
interface Season {
  start: Date;
  end: Date;
}

export default function CyclesPage() {
  const [bulkingSeasons, setBulkingSeasons] = useState<Season[]>([]);
  const [cuttingSeasons, setCuttingSeasons] = useState<Season[]>([]);
  const [activeCycle, setActiveCycle] = useState<"bulking" | "cutting" | null>(
    null
  );
  const [currentStart, setCurrentStart] = useState<Date | null>(null);

  const handleStartBulking = () => {
    setActiveCycle("bulking");
    setCurrentStart(new Date());
  };

  const handleStartCutting = () => {
    setActiveCycle("cutting");
    setCurrentStart(new Date());
  };

  const handleStopCycle = () => {
    const end = new Date();
    if (activeCycle === "bulking" && currentStart) {
      setBulkingSeasons((prev) => [
        { start: currentStart, end },
        ...prev,
      ]);
    } else if (activeCycle === "cutting" && currentStart) {
      setCuttingSeasons((prev) => [
        { start: currentStart, end },
        ...prev,
      ]);
    }
    setActiveCycle(null);
    setCurrentStart(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
      <h1 className="text-2xl font-bold mb-4">Cycles</h1>
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Bulking Section */}
        <section className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Bulking</h2>
          {activeCycle === "bulking" ? (
            <div className="mb-4 flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Started: {currentStart?.toLocaleString()}
              </span>
              <Button variant="default" onClick={handleStopCycle}>
                Stop Bulking
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="mb-4"
                onClick={handleStartBulking}
                disabled={activeCycle === "cutting"}
              >
                Start Bulking
              </Button>
            </div>
          )}
          <h3 className="font-medium mb-1">Previous Bulking Seasons:</h3>
          {bulkingSeasons.length === 0 ? (
            <p className="text-muted-foreground">
              No bulking seasons started yet.
            </p>
          ) : (
            <ul className="list-disc pl-5">
              {bulkingSeasons.map((season, idx) => (
                <li key={idx} className="mb-2">
                  <div>
                    <div className="flex flex-row gap-1">
                      <span className="font-medium">Start:</span> <span className="text-muted-foreground">{season.start.toLocaleDateString()}</span>
                      <span className="font-medium">End:</span> <span className="text-muted-foreground">{season.end.toLocaleDateString()}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-medium">Duration:</span> <span className="text-muted-foreground">{season.end.getTime() - season.start.getTime()} days</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cutting Section */}
        <section className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Cutting</h2>
          {activeCycle === "cutting" ? (
            <div className="mb-4 flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Started: {currentStart?.toLocaleString()}
              </span>
              <Button variant="default" onClick={handleStopCycle}>
                Stop Cutting
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="mb-4"
                onClick={handleStartCutting}
                disabled={activeCycle === "bulking"}
              >
                Start Cutting
              </Button>
            </div>
          )}
          <h3 className="font-medium mb-1">Previous Cutting Seasons:</h3>
          {cuttingSeasons.length === 0 ? (
            <p className="text-muted-foreground">
              No cutting seasons started yet.
            </p>
          ) : (
            <ul className="list-disc pl-5">
              {cuttingSeasons.map((season, idx) => (
                <li key={idx}>
                  <span className="font-medium">Start:</span> {season.start.toLocaleDateString()}<br />
                  <span className="font-medium">End:</span> {season.end.toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
