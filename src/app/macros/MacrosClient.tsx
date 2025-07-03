"use client";

import React, { useState, useEffect } from "react";
import { Edit, CheckIcon, Trash2, X, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MacroGoal } from "@/app/actions/macros";
import { FoodIdea } from "../actions/ideas";
import { getMacrosForWeek, upsertMacroGoal } from "@/app/actions/macros";
import { getIdeasForWeek, addFoodIdea } from "@/app/actions/ideas";
import { getFortnightsForCycle, createFortnight } from "@/app/actions/fortnights";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface Idea {
  id: string;
  text: string;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
}

interface MacrosClientProps {
  cycleId: string;
  cycleType?: string;
  initialWeeks: Week[];
  initialMacros: MacroGoal[];
  initialIdeas: FoodIdea[];
}

export function MacrosClient({
  cycleId,
  cycleType,
  initialWeeks: initialFortnights,
  initialMacros,
  initialIdeas,
}: MacrosClientProps) {
  const meals = ["morning", "lunch", "afternoon", "dinner"] as const;

  // Weeks state
  const [fortnights, setFortnights] = useState<Week[]>(initialFortnights);
  const [selectedFortnight, setSelectedFortnight] = useState<number>(
    initialFortnights.length > 0 ? initialFortnights[initialFortnights.length - 1].week_number : 1
  );
  const [creatingFortnight, setCreatingFortnight] = useState(false);
  const [fortnightError, setFortnightError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Tooltip message for disabled button
  const fortnightTooltipMsg =
    "You can only create a new fortnight after 13 days (2 weeks) from the last one.";

  // Macros and ideas state
  const [macros, setMacros] = useState(
    Object.fromEntries(
      meals.map((meal) => {
        const found = initialMacros.find((m) => m.meal === meal);
        return [meal, {
          carbos: found?.carbos ?? null,
          fat: found?.fat ?? null,
          protein: found?.protein ?? null,
        }];
      })
    )
  );
  const [ideas, setIdeas] = useState(
    Object.fromEntries(
      meals.map((meal) => [
        meal,
        initialIdeas
          .filter((idea) => idea.meal === meal)
          .map(({ id, text }) => ({ id, text })),
      ])
    ) as Record<(typeof meals)[number], Idea[]>
  );

  // New idea input per meal
  const [newIdea, setNewIdea] = useState(
    Object.fromEntries(
      meals.map((meal) => [meal, ""])
    ) as Record<(typeof meals)[number], string>
  );

  // Add loading and error state for saving macros
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // State for which idea is being edited per meal (by id)
  const [editingIdea, setEditingIdea] = useState<{
    [meal in (typeof meals)[number]]?: string | null;
  }>({});
  // State for the edited text per meal/idea
  const [editedIdeaText, setEditedIdeaText] = useState<{
    [meal in (typeof meals)[number]]?: string;
  }>({});
  // Add loading and error state for editing ideas
  const [editingIdeaSaving, setEditingIdeaSaving] = useState<string | null>(null);
  const [editingIdeaError, setEditingIdeaError] = useState<string | null>(null);

  // Store the last fetched macros for reset on cancel
  const [lastFetchedMacros, setLastFetchedMacros] = useState(macros);

  // Update lastFetchedMacros whenever macros are fetched from the server
  useEffect(() => {
    setLastFetchedMacros(
      Object.fromEntries(
        meals.map((meal) => [
          meal,
          macros[meal]
        ])
      )
    );
  }, [initialMacros, selectedFortnight]);

  // Fetch macros and ideas when selectedFortnight changes
  useEffect(() => {
    async function fetchData() {
      const macrosData = await getMacrosForWeek(cycleId, selectedFortnight);
      const newMacros = Object.fromEntries(
        meals.map((meal) => {
          const found = macrosData.find((m: MacroGoal) => m.meal === meal);
          return [meal, {
            carbos: found?.carbos ?? 0,
            fat: found?.fat ?? 0,
            protein: found?.protein ?? 0,
          }];
        })
      );
      setMacros(newMacros);
      setLastFetchedMacros(newMacros);
      const ideasData = await getIdeasForWeek(cycleId, selectedFortnight);
      setIdeas(
        Object.fromEntries(
          meals.map((meal) => [
            meal,
            ideasData
              .filter((idea: FoodIdea) => idea.meal === meal)
              .map(({ id, text }) => ({ id, text })),
          ])
        ) as Record<(typeof meals)[number], Idea[]>
      );
    }
    fetchData();
  }, [cycleId, selectedFortnight]);

  // Handler to create a new week
  async function handleCreateFortnight() {
    setCreatingFortnight(true);
    setFortnightError(null);
    const res = await createFortnight(cycleId);
    if (res.success) {
      const newFortnights = await getFortnightsForCycle(cycleId);
      setFortnights(newFortnights);
      setSelectedFortnight(newFortnights[newFortnights.length - 1].week_number);
    } else {
      setFortnightError(res.error || "Failed to create fortnight");
    }
    setCreatingFortnight(false);
  }

  // Can create new week if 13 days have passed since last week's start_date
  const canCreateNewFortnight = (() => {
    if (fortnights.length === 0) return true;
    const lastFortnight = fortnights[fortnights.length - 1];
    const lastStart = new Date(lastFortnight.start_date);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 13;
  })();

  // Track which meal is in edit mode
  const [editingMeal, setEditingMeal] = useState<(typeof meals)[number] | null>(
    null
  );

  const handleEditClick = (meal: (typeof meals)[number]) => {
    setEditingMeal(meal);
  };

  const handleSaveClick = async () => {
    if (editingMeal) {
      setSaving(true);
      setSaveError(null);
      const macro = macros[editingMeal];
      try {
        await upsertMacroGoal(
          cycleId,
          selectedFortnight,
          editingMeal,
          macro.carbos ?? 0,
          macro.fat ?? 0,
          macro.protein ?? 0
        );
        setEditingMeal(null);
      } catch (err: unknown) {
        setSaveError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleMacroChange = (
    meal: (typeof meals)[number],
    macro: "carbos" | "fat" | "protein",
    value: string
  ) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setMacros((prev) => ({
        ...prev,
        [meal]: { ...prev[meal], [macro]: num },
      }));
    }
  };

  const handleNewIdeaChange = (
    meal: (typeof meals)[number],
    value: string
  ) => {
    setNewIdea((prev) => ({
      ...prev,
      [meal]: value,
    }));
  };

  const [addIdeaError, setAddIdeaError] = useState<Record<(typeof meals)[number], string | null>>({
    morning: null,
    lunch: null,
    afternoon: null,
    dinner: null,
  });
  const [addIdeaLoading, setAddIdeaLoading] = useState<Record<(typeof meals)[number], boolean>>({
    morning: false,
    lunch: false,
    afternoon: false,
    dinner: false,
  });

  const handleAddIdea = async (meal: (typeof meals)[number]) => {
    setAddIdeaError((prev: Record<(typeof meals)[number], string | null>) => ({ ...prev, [meal]: null }));
    setAddIdeaLoading((prev: Record<(typeof meals)[number], boolean>) => ({ ...prev, [meal]: true }));
    const text = newIdea[meal].trim();
    if (text) {
      try {
        const newIdeaItem = await addFoodIdea(cycleId, selectedFortnight, meal, text);
        console.log('addFoodIdea result:', newIdeaItem);
        if (!newIdeaItem || !newIdeaItem.id || !newIdeaItem.text) {
          setAddIdeaError((prev: Record<(typeof meals)[number], string | null>) => ({ ...prev, [meal]: 'Failed to add idea: invalid response from server.' }));
        } else {
          setIdeas((prev) => ({
            ...prev,
            [meal]: [...prev[meal], newIdeaItem],
          }));
          setNewIdea((prev) => ({ ...prev, [meal]: "" }));
        }
      } catch (error: unknown) {
        let message = 'Failed to add idea.';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        }
        setAddIdeaError((prev: Record<(typeof meals)[number], string | null>) => ({ ...prev, [meal]: message }));
        console.error('Error adding idea:', error);
      }
    }
    setAddIdeaLoading((prev: Record<(typeof meals)[number], boolean>) => ({ ...prev, [meal]: false }));
  };

  const handleDeleteIdea = async (
    meal: (typeof meals)[number],
    ideaId: string
  ) => {
    // Optimistically remove the idea from the UI
    setIdeas((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((idea) => idea.id !== ideaId),
    }));
    try {
      // Dynamically import the server action
      const { deleteFoodIdea } = await import("@/app/actions/ideas");
      await deleteFoodIdea(ideaId);
    } catch (error) {
      // Revert if the deletion fails
      // You might want to show an error message to the user
      console.error("Failed to delete idea:", error);
    }
  };

  const handleEditIdeaClick = (meal: (typeof meals)[number], ideaId: string, text: string) => {
    setEditingIdea((prev) => ({ ...prev, [meal]: ideaId }));
    setEditedIdeaText((prev) => ({ ...prev, [meal]: text }));
    setEditingIdeaError(null);
  };

  const handleEditIdeaChange = (meal: (typeof meals)[number], value: string) => {
    setEditedIdeaText((prev) => ({ ...prev, [meal]: value }));
  };

  const handleEditIdeaCancel = (meal: (typeof meals)[number]) => {
    setEditingIdea((prev) => ({ ...prev, [meal]: null }));
    setEditingIdeaError(null);
  };

  const handleEditIdeaSave = async (meal: (typeof meals)[number], ideaId: string) => {
    setEditingIdeaSaving(ideaId);
    setEditingIdeaError(null);
    try {
      const newText = editedIdeaText[meal]?.trim();
      if (!newText) throw new Error("Text cannot be empty");
      const { updateFoodIdea } = await import("@/app/actions/ideas");
      await updateFoodIdea(ideaId, newText);
      setIdeas((prev) => ({
        ...prev,
        [meal]: prev[meal].map((idea) =>
          idea.id === ideaId ? { ...idea, text: newText } : idea
        ),
      }));
      setEditingIdea((prev) => ({ ...prev, [meal]: null }));
    } catch (err: unknown) {
      setEditingIdeaError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEditingIdeaSaving(null);
    }
  };

  // Add a handler to cancel macro edit and restore original values
  const handleCancelEdit = () => {
    if (editingMeal) {
      setMacros((prev) => ({
        ...prev,
        [editingMeal]: { ...lastFetchedMacros[editingMeal] }
      }));
      setEditingMeal(null);
      setSaveError(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 p-6 md:container md:mx-auto">
        {/* Show current cycle type at the top */}
        {cycleType && (
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/30`}>
              Current Cycle: {cycleType.charAt(0).toUpperCase() + cycleType.slice(1)}
            </span>
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {fortnights.map((fortnight) => (
              <button
                key={fortnight.id}
                className={`px-4 py-2 rounded-t-lg whitespace-nowrap border-b-2 transition-colors ${
                  selectedFortnight === fortnight.week_number
                    ? "border-primary bg-card text-primary font-bold"
                    : "border-transparent bg-muted text-muted-foreground"
                }`}
                onClick={() => setSelectedFortnight(fortnight.week_number)}
              >
                Fortnight {fortnight.week_number}
                <span className="ml-2 text-xs text-muted-foreground">
                  {fortnight.start_date}
                </span>
              </button>
            ))}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <span>
                  <Button
                    onClick={
                      canCreateNewFortnight
                        ? handleCreateFortnight
                        : (e) => {
                            e.preventDefault();
                            setPopoverOpen(true);
                          }
                    }
                    disabled={creatingFortnight || !canCreateNewFortnight}
                    className="ml-2 flex-shrink-0"
                    variant="outline"
                    size="icon"
                    aria-label="Start Next Fortnight"
                  >
                    {creatingFortnight ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </span>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="center" alignOffset={10} sideOffset={5} className="w-auto p-2 text-xs text-muted-foreground">
                {fortnightTooltipMsg}
              </PopoverContent>
            </Popover>
          </div>
          {fortnightError && <div className="text-destructive text-xs mt-1">{fortnightError}</div>}
        </div>
        {meals.map((meal) => {
          return (
            <div
              key={meal}
              className="border border-xs border-gray-700 rounded-lg p-4"
              style={{
                background: "var(--card)",
                color: "var(--card-foreground)",
                minWidth: 260,
              }}
            >
              <div className="flex text-center justify-center mb-4">
                <h2
                  className="title text-2xl font-bold"
                  style={{ textTransform: "capitalize" }}
                >
                  {meal}
                </h2>
              </div>

              {/* Macros goal line */}
              <div className="flex items-center md:justify-start gap-1 md:gap-6 justify-around mb-4">
                {(["carbos", "fat", "protein"] as const).map((macro) => (
                  <div
                    key={macro}
                    className={
                      "flex flex-col items-center min-w-[60px] " +
                      (editingMeal === meal ? "gap-1" : "gap-0")
                    }
                  >
                    <span className="font-medium">
                      {macro.charAt(0).toUpperCase() + macro.slice(1)}:
                    </span>
                    {editingMeal === meal ? (
                      <Input
                        value={macros[meal][macro] ?? 0}
                        autoFocus={macro === "carbos"}
                        onChange={(e) =>
                          handleMacroChange(meal, macro, e.target.value)
                        }
                        className="w-14 px-1 py-0.5 text-center"
                      />
                    ) : (
                      <span className="px-2 mt-2 text-muted-foreground">
                        {macros[meal][macro]}
                      </span>
                    )}
                  </div>
                ))}
                <span className="flex items-center self-end">
                  {editingMeal === meal ? (
                    <>
                      <Button
                        onClick={handleSaveClick}
                        aria-label="Save macros"
                        variant="ghost"
                        className="p-2"
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        aria-label="Cancel edit"
                        className="p-2"
                        variant="ghost"
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleEditClick(meal)}
                      aria-label="Edit macros"
                      variant="ghost"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </span>
              </div>

              {saveError && editingMeal === meal && (
                <p className="text-destructive text-sm text-center mb-4">
                  Error: {saveError}
                </p>
              )}

              <div className="flex flex-col w-full flex-1 text-center mb-4">
                <span className="text-muted-foreground">---</span>
              </div>

              {/* Ideas section */}
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-center text-muted-foreground">
                  Ideas
                </h3>
                <div className="flex flex-col gap-2 mb-4">
                  {ideas[meal].map((idea) => (
                    <div
                      key={idea.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      {editingIdea[meal] === idea.id ? (
                        <>
                          <Input
                            type="text"
                            value={editedIdeaText[meal] ?? idea.text}
                            onChange={(e) => handleEditIdeaChange(meal, e.target.value)}
                            className="mr-2 flex-1"
                            autoFocus
                            disabled={editingIdeaSaving === idea.id}
                            style={editingIdeaSaving === idea.id ? { opacity: 0.7 } : {}}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditIdeaSave(meal, idea.id)}
                            disabled={editingIdeaSaving === idea.id}
                            aria-label="Save idea"
                          >
                            {editingIdeaSaving === idea.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditIdeaCancel(meal)}
                            aria-label="Cancel edit"
                            disabled={editingIdeaSaving === idea.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span>{idea.text}</span>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditIdeaClick(meal, idea.id, idea.text)}
                              aria-label="Edit idea"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteIdea(meal, idea.id)}
                              aria-label="Delete idea"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {editingIdeaError && (
                  <p className="text-destructive text-xs text-center mt-1">Error: {editingIdeaError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., 2 bananas"
                    value={newIdea[meal]}
                    onChange={(e) => handleNewIdeaChange(meal, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !addIdeaLoading[meal]) {
                        e.preventDefault();
                        handleAddIdea(meal);
                      }
                    }}
                    className="bg-transparent border-muted"
                  />
                  <Button onClick={() => handleAddIdea(meal)}>Add Idea</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
