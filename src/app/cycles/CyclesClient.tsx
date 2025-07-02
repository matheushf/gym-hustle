"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addCycle, updateCycle } from "@/app/actions/cycles";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Cycle = {
  id: string;
  type: "bulking" | "cutting";
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  created_at: string;
};

export function CyclesClient({ initialCycles }: { initialCycles: Cycle[] }) {
  const [cycles, setCycles] = useState<Cycle[]>(initialCycles);
  const [error, setError] = useState<string | null>(null);
  const [activeCycle, setActiveCycle] = useState<{
    id: string;
    type: "bulking" | "cutting";
    start: Date;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkingStartDate, setBulkingStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [cuttingStartDate, setCuttingStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [showAllBulking, setShowAllBulking] = useState(true);
  const [showAllCutting, setShowAllCutting] = useState(true);

  console.log(initialCycles);

  // Detect active cycle on mount and when cycles change
  useEffect(() => {
    const currentActive = cycles.find((cycle) => !cycle.end_date);
    if (currentActive) {
      setActiveCycle({
        id: currentActive.id,
        type: currentActive.type,
        start: new Date(currentActive.start_date),
      });
    } else {
      setActiveCycle(null);
    }
  }, [cycles]);

  const handleStart = async (type: "bulking" | "cutting", startDate: Date) => {
    setSaving(true);
    try {
      const newCycle = await addCycle({
        type,
        start: startDate,
      });
      setCycles((prev) => [newCycle, ...prev]);
      setActiveCycle({
        id: newCycle.id,
        type: newCycle.type,
        start: new Date(newCycle.start_date),
      });
    } catch {
      setError("Failed to start cycle");
    } finally {
      setSaving(false);
    }
  };

  const handleStop = async () => {
    if (!activeCycle) return;
    setSaving(true);
    try {
      const updatedCycle = await updateCycle({
        id: activeCycle.id,
        end: new Date(),
      });
      setCycles((prev) =>
        prev.map((cycle) =>
          cycle.id === updatedCycle.id ? updatedCycle : cycle
        )
      );
      setActiveCycle(null);
    } catch {
      setError("Failed to stop cycle");
    } finally {
      setSaving(false);
    }
  };

  const bulkingSeasons = cycles.filter((c) => c.type === "bulking");
  const cuttingSeasons = cycles.filter((c) => c.type === "cutting");

  function getDurationDays(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(
      1,
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-4 mt-10">
      <div className="w-full max-w-md flex flex-col gap-10">
        <Tabs defaultValue="bulking" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="bulking" className="flex-1">Bulking</TabsTrigger>
            <TabsTrigger value="cutting" className="flex-1">Cutting</TabsTrigger>
          </TabsList>
          <TabsContent value="bulking">
            {/* Bulking Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Bulking</h2>
              {activeCycle && activeCycle.type === "bulking" ? (
                <div className="mb-4 flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Started:{" "}
                    {activeCycle.start.toLocaleDateString("en-GB", {
                      timeZone: "UTC",
                    })}
                  </span>
                  <Button variant="default" onClick={handleStop} disabled={saving}>
                    {saving ? "Saving..." : "Stop Bulking"}
                  </Button>
                </div>
              ) : (
                <div className="mb-4 flex flex-row items-center justify-between gap-2">
                  <DatePicker
                    date={bulkingStartDate}
                    setDate={setBulkingStartDate}
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      handleStart("bulking", bulkingStartDate || new Date())
                    }
                    disabled={!!activeCycle || saving || !bulkingStartDate}
                  >
                    Start Bulking
                  </Button>
                </div>
              )}
              <h3 className="font-medium mb-1">Previous Bulking Seasons:</h3>
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : bulkingSeasons.length === 0 ? (
                <p className="text-muted-foreground">
                  No bulking seasons started yet.
                </p>
              ) : (
                <>
                  <ul className="list-disc pl-5">
                    {(showAllBulking
                      ? bulkingSeasons
                      : bulkingSeasons.slice(0, 1)
                    ).map((season) => (
                      <li key={season.id} className="mb-2">
                        <div>
                          <div className="flex flex-row gap-1">
                            <span className="font-medium">Start:</span>{" "}
                            <span className="text-muted-foreground">
                              {new Date(season.start_date).toLocaleDateString(
                                "en-GB",
                                {
                                  timeZone: "UTC",
                                }
                              )}
                            </span>
                            {season.end_date && (
                              <>
                                <span className="font-medium">End:</span>{" "}
                                <span className="text-muted-foreground">
                                  {new Date(season.end_date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {season.end_date && (
                            <div className="text-left">
                              <span className="font-medium">Duration:</span>{" "}
                              <span className="text-muted-foreground">
                                {getDurationDays(
                                  season.start_date,
                                  season.end_date
                                )}{" "}
                                days
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {bulkingSeasons.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAllBulking((prev) => !prev)}
                    >
                      {showAllBulking
                        ? "Show less"
                        : `Show more (${bulkingSeasons.length - 1} more)`}
                    </Button>
                  )}
                </>
              )}
            </section>
          </TabsContent>
          <TabsContent value="cutting">
            {/* Cutting Section */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Cutting</h2>
              {activeCycle && activeCycle.type === "cutting" ? (
                <div className="mb-4 flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Started:{" "}
                    {activeCycle.start.toLocaleDateString("en-GB", {
                      timeZone: "UTC",
                    })}
                  </span>
                  <Button variant="default" onClick={handleStop} disabled={saving}>
                    {saving ? "Saving..." : "Stop Cutting"}
                  </Button>
                </div>
              ) : (
                <div className="mb-4 flex flex-row items-center gap-2">
                  <DatePicker
                    date={cuttingStartDate}
                    setDate={setCuttingStartDate}
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      handleStart("cutting", cuttingStartDate || new Date())
                    }
                    disabled={!!activeCycle || saving || !cuttingStartDate}
                  >
                    Start Cutting
                  </Button>
                </div>
              )}
              <h3 className="font-medium mb-1">Previous Cutting Seasons:</h3>
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : cuttingSeasons.length === 0 ? (
                <p className="text-muted-foreground">
                  No cutting seasons started yet.
                </p>
              ) : (
                <>
                  <ul className="list-disc pl-5">
                    {(showAllCutting
                      ? cuttingSeasons
                      : cuttingSeasons.slice(0, 1)
                    ).map((season) => (
                      <li key={season.id} className="mb-2">
                        <div>
                          <div className="flex flex-row gap-1">
                            <span className="font-medium">Start:</span>{" "}
                            <span className="text-muted-foreground">
                              {new Date(season.start_date).toLocaleDateString(
                                "en-GB",
                                {
                                  timeZone: "UTC",
                                }
                              )}
                            </span>
                            {season.end_date && (
                              <>
                                <span className="font-medium">End:</span>{" "}
                                <span className="text-muted-foreground">
                                  {new Date(season.end_date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      timeZone: "UTC",
                                    }
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {season.end_date && (
                            <div className="text-left">
                              <span className="font-medium">Duration:</span>{" "}
                              <span className="text-muted-foreground">
                                {getDurationDays(
                                  season.start_date,
                                  season.end_date
                                )}{" "}
                                days
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {cuttingSeasons.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAllCutting((prev) => !prev)}
                    >
                      {showAllCutting
                        ? "Show less"
                        : `Show more (${cuttingSeasons.length - 1} more)`}
                    </Button>
                  )}
                </>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
