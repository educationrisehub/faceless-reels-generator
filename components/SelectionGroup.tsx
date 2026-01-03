
import React from 'react';

interface SelectionGroupProps<T> {
  label: string;
  options: T[];
  selected: T | T[];
  onChange: (value: T) => void;
  isMulti?: boolean;
}

export function SelectionGroup<T extends string>({ label, options, selected, onChange, isMulti = false }: SelectionGroupProps<T>) {
  const isSelected = (option: T) => {
    if (isMulti && Array.isArray(selected)) {
      return selected.includes(option);
    }
    return selected === option;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              isSelected(option)
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
