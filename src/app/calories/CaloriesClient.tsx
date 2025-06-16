'use client'

import React, { useState } from 'react'
import { Edit, CheckIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Meal {
  id: string;
  name: 'morning' | 'lunch' | 'afternoon' | 'dinner';
  calories: number;
  description?: string;
}

interface CaloriesClientProps {
  initialCalories: Meal[];
}

export function CaloriesClient({ initialCalories }: CaloriesClientProps) {
  const meals = ['morning', 'lunch', 'afternoon', 'dinner'] as const;

  // State for macros per meal
  const [macros, setMacros] = useState(
    Object.fromEntries(meals.map(meal => [meal, { carbos: 0, fat: 0, protein: 0 }]))
  );
  // Track which meal is in edit mode
  const [editingMeal, setEditingMeal] = useState<string | null>(null);

  const handleEditClick = (meal: typeof meals[number]) => {
    setEditingMeal(meal);
  };

  const handleSaveClick = () => {
    setEditingMeal(null);
  };

  const handleMacroChange = (meal: typeof meals[number], macro: 'carbos' | 'fat' | 'protein', value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setMacros((prev) => ({
        ...prev,
        [meal]: { ...prev[meal], [macro]: num }
      }));
    }
  };

  return (
    <div>
      <div className='flex flex-col gap-4 p-6'>
        {meals.map((meal) => {
          const mealData = initialCalories.find((m) => m.name === meal);

          return (
            <div
              key={meal}
              className='border border-xs border-gray-700 rounded-lg p-4'
              style={{
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                minWidth: 260,
              }}
            >
              <div className='flex text-center justify-center'>
                <h2 className='title text-1xl font-bold' style={{ textTransform: 'capitalize', marginTop: 0 }}>{meal}</h2>
              </div>
              {/* Macros goal line */}
              <div className='flex items-center gap-3 justify-center my-2 mb-10'>
                {(['carbos', 'fat', 'protein'] as const).map((macro) => (
                  <div key={macro} className={'flex flex-col items-center min-w-[80px] ' + (editingMeal === meal ? 'gap-1' : 'gap-0') }>
                    <span className='font-medium'>{macro.charAt(0).toUpperCase() + macro.slice(1)}:</span>
                    {editingMeal === meal ? (
                      <Input
                        type='number'
                        value={macros[meal][macro]}
                        autoFocus={macro === 'carbos'}
                        onChange={e => handleMacroChange(meal, macro, e.target.value)}
                        className='w-14 px-1 py-0.5 text-center mt-0.5'
                      />
                    ) : (
                      <span className='cursor-pointer border-b border-dashed border-gray-400 px-2'>
                        {macros[meal][macro]}
                      </span>
                    )}
                  </div>
                ))}
                <span className='ml-2 flex items-center'>
                  {editingMeal === meal ? (
                    <button onClick={handleSaveClick} aria-label='Save macros'>
                      <CheckIcon className='w-5 h-5 text-green-600' />
                    </button>
                  ) : (
                    <button onClick={() => handleEditClick(meal)} aria-label='Edit macros'>
                      <Edit className='w-5 h-5 text-gray-500' />
                    </button>
                  )}
                </span>
              </div>
              {mealData ? (
                <div>
                  <strong>Calories:</strong> {mealData.calories}
                  {mealData.description && (
                    <div><em>{mealData.description}</em></div>
                  )}
                </div>
              ) : (
                <div>No data</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}