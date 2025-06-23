"use client";

import React, { useState } from "react";
import { Edit, CheckIcon, Trash2, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MacroGoal } from "@/app/actions/macros";
import { FoodIdea } from "../actions/ideas";

interface Idea {
  id: string;
  text: string;
}

interface MacrosClientProps {
  initialMacros: MacroGoal[];
  initialIdeas: FoodIdea[];
}

export function MacrosClient({
  initialMacros,
  initialIdeas,
}: MacrosClientProps) {
  const meals = ["morning", "lunch", "afternoon", "dinner"] as const;

  // State for macros per meal
  const [macros, setMacros] = useState(
    Object.fromEntries(
      meals.map((meal) => {
        const found = initialMacros.find((m) => m.meal === meal);
        return [meal, {
          carbos: found?.carbos ?? 0,
          fat: found?.fat ?? 0,
          protein: found?.protein ?? 0,
        }];
      })
    )
  );
  // Track which meal is in edit mode
  const [editingMeal, setEditingMeal] = useState<(typeof meals)[number] | null>(
    null
  );

  // State for ideas per meal
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

  // State for new idea input per meal
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

  const handleEditClick = (meal: (typeof meals)[number]) => {
    setEditingMeal(meal);
  };

  const handleSaveClick = async () => {
    if (editingMeal) {
      setSaving(true);
      setSaveError(null);
      const macro = macros[editingMeal];
      try {
        // Dynamically import the server action
        const { upsertMacroGoal } = await import("@/app/actions/macros");
        await upsertMacroGoal(
          editingMeal,
          macro.carbos,
          macro.fat,
          macro.protein
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

  const handleAddIdea = async (meal: (typeof meals)[number]) => {
    const text = newIdea[meal].trim();
    if (text) {
      // Dynamically import the server action
      const { addFoodIdea } = await import("@/app/actions/ideas");
      const newIdeaItem = await addFoodIdea(meal, text);
      setIdeas((prev) => ({
        ...prev,
        [meal]: [...prev[meal], newIdeaItem],
      }));
      setNewIdea((prev) => ({ ...prev, [meal]: "" }));
    }
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

  return (
    <div>
      <div className="flex flex-col gap-4 p-6">
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
                  className="title text-2xl font-bold text-primary"
                  style={{ textTransform: "capitalize" }}
                >
                  {meal}
                </h2>
              </div>

              {/* Macros goal line */}
              <div className="flex items-center gap-1 justify-around mb-4">
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
                        type="number"
                        value={macros[meal][macro]}
                        autoFocus={macro === "carbos"}
                        onChange={(e) =>
                          handleMacroChange(meal, macro, e.target.value)
                        }
                        className="w-14 px-1 py-0.5 text-center mt-0.5"
                      />
                    ) : (
                      <span className="px-2 text-muted-foreground">
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
                        onClick={() => setEditingMeal(null)}
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
