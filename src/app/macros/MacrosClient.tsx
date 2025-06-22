"use client";

import React, { useState } from "react";
import { Edit, CheckIcon, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MacroGoal } from "@/app/actions/macros";

interface FoodItem {
  name: string;
  unit: string;
  grams: string;
}

interface MacrosClientProps {
  initialMacros: MacroGoal[];
}

export function MacrosClient({ initialMacros }: MacrosClientProps) {
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
  const [editingMeal, setEditingMeal] = useState<string | null>(null);

  // State for food items per meal
  const [foodItems, setFoodItems] = useState(
    Object.fromEntries(meals.map((meal) => [meal, [] as FoodItem[]])) as Record<
      (typeof meals)[number],
      FoodItem[]
    >
  );
  // State for new food item input per meal
  const [newFoodItem, setNewFoodItem] = useState(
    Object.fromEntries(
      meals.map((meal) => [meal, { name: "", unit: "", grams: "" }])
    ) as Record<(typeof meals)[number], FoodItem>
  );

  // State for which food item is being edited per meal (index or null)
  const [editingFoodItem, setEditingFoodItem] = useState(
    Object.fromEntries(meals.map((meal) => [meal, null])) as Record<
      (typeof meals)[number],
      number | null
    >
  );

  // State to control visibility of add food input per meal
  const [showAddFoodInput, setShowAddFoodInput] = useState(
    Object.fromEntries(meals.map((meal) => [meal, false])) as Record<
      (typeof meals)[number],
      boolean
    >
  );

  // Add loading and error state for saving macros
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        await upsertMacroGoal(editingMeal, macro.carbos, macro.fat, macro.protein);
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

  // Handle changes to existing food items
  const handleFoodItemChange = (
    meal: (typeof meals)[number],
    idx: number,
    field: keyof FoodItem,
    value: string
  ) => {
    setFoodItems((prev) => {
      const updated = [...prev[meal]];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [meal]: updated };
    });
  };

  // Handle changes to the new food item input
  const handleNewFoodItemChange = (
    meal: (typeof meals)[number],
    field: keyof FoodItem,
    value: string
  ) => {
    setNewFoodItem((prev) => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value },
    }));
  };

  // Add new food item to the meal
  const handleAddFoodItem = (meal: (typeof meals)[number]) => {
    const item = newFoodItem[meal];
    if (item.name.trim() && item.unit.trim() && item.grams.trim()) {
      setFoodItems((prev) => ({
        ...prev,
        [meal]: [...prev[meal], { ...item }],
      }));
      setNewFoodItem((prev) => ({
        ...prev,
        [meal]: { name: "", unit: "", grams: "" },
      }));
      setShowAddFoodInput((prev) => ({ ...prev, [meal]: false })); // Hide input after adding
    }
  };

  // Cancel adding new food item
  const handleCancelAddFoodItem = (meal: (typeof meals)[number]) => {
    setShowAddFoodInput((prev) => ({ ...prev, [meal]: false }));
    setNewFoodItem((prev) => ({
      ...prev,
      [meal]: { name: "", unit: "", grams: "" },
    }));
  };

  // Handle clicking Edit for a food item
  const handleEditFoodItem = (meal: (typeof meals)[number], idx: number) => {
    setEditingFoodItem((prev) => ({ ...prev, [meal]: idx }));
  };

  // Handle Save for a food item
  const handleSaveFoodItem = (meal: (typeof meals)[number]) => {
    setEditingFoodItem((prev) => ({ ...prev, [meal]: null }));
  };

  // Add delete handler for food items
  const handleDeleteFoodItem = (meal: (typeof meals)[number], idx: number) => {
    setFoodItems((prev) => {
      const updated = [...prev[meal]];
      updated.splice(idx, 1);
      return { ...prev, [meal]: updated };
    });
    // If the deleted item was being edited, reset edit state
    setEditingFoodItem((prev) =>
      prev[meal] === idx ? { ...prev, [meal]: null } : prev
    );
  };

  // Add cancel edit handler
  const handleCancelEditFoodItem = (meal: (typeof meals)[number]) => {
    setEditingFoodItem((prev) => ({ ...prev, [meal]: null }));
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
              <div className="flex items-center gap-3 justify-center mb-4">
                {(["carbos", "fat", "protein"] as const).map((macro) => (
                  <div
                    key={macro}
                    className={
                      "flex flex-col items-center min-w-[80px] " +
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
                <span className="ml-2 flex items-center self-end">
                  {editingMeal === meal ? (
                    <Button
                      onClick={handleSaveClick}
                      aria-label="Save macros"
                      variant="ghost"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
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

              <div className="flex flex-col w-full flex-1 text-center mb-4">
                <span className="text-muted-foreground">---</span>
              </div>

              {/* Food items list */}
              <div className="flex flex-col gap-2 mb-4">
                {foodItems[meal].map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    {editingFoodItem[meal] === idx ? (
                      <div className="flex flex-col w-full gap-1">
                        <Input
                          type="text"
                          placeholder="Food name"
                          value={item.name}
                          onChange={(e) =>
                            handleFoodItemChange(
                              meal,
                              idx,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent border-muted"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="unit"
                            value={item.unit}
                            onChange={(e) =>
                              handleFoodItemChange(
                                meal,
                                idx,
                                "unit",
                                e.target.value
                              )
                            }
                            className="flex-1 bg-transparent border-muted"
                          />
                          <Input
                            type="number"
                            placeholder="grams"
                            value={item.grams}
                            onChange={(e) =>
                              handleFoodItemChange(
                                meal,
                                idx,
                                "grams",
                                e.target.value
                              )
                            }
                            className="flex-1 bg-transparent border-muted"
                          />
                          <div className="flex gap-1 items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveFoodItem(meal)}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelEditFoodItem(meal)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-row gap-1 items-center justify-between ml-2">
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.unit && (
                          <span className="w-10 truncate text-muted-foreground">
                            {item.unit}unt,
                          </span>
                        )}
                        <span className="w-10 truncate text-muted-foreground">
                          {item.grams}g
                        </span>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditFoodItem(meal, idx)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFoodItem(meal, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4">
                  {/* New food item row */}
                  {showAddFoodInput[meal] ? (
                    <div className="flex flex-col w-full gap-1">
                      <Input
                        type="text"
                        placeholder="Food name"
                        value={newFoodItem[meal].name}
                        onChange={(e) =>
                          handleNewFoodItemChange(meal, "name", e.target.value)
                        }
                        className="w-full bg-transparent border-muted"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="unit"
                          value={newFoodItem[meal].unit}
                          onChange={(e) =>
                            handleNewFoodItemChange(
                              meal,
                              "unit",
                              e.target.value
                            )
                          }
                          className="flex-1 bg-transparent border-muted"
                        />
                        <Input
                          type="number"
                          placeholder="grams"
                          value={newFoodItem[meal].grams}
                          onChange={(e) =>
                            handleNewFoodItemChange(
                              meal,
                              "grams",
                              e.target.value
                            )
                          }
                          className="flex-1 bg-transparent border-muted"
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddFoodItem(meal)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          style={{ minWidth: 40 }}
                          aria-label="Add food item"
                        >
                          +
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleCancelAddFoodItem(meal)}
                          variant="ghost"
                          aria-label="Cancel add food item"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex items-center gap-2 text-muted-foreground"
                      onClick={() =>
                        setShowAddFoodInput((prev) => ({
                          ...prev,
                          [meal]: true,
                        }))
                      }
                    >
                      <span className="text-xl">+</span> Add new food
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
