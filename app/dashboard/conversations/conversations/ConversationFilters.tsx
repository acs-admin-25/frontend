'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Slider from '@mui/material/Slider';

interface ConversationFiltersProps {
  filters: {
    status: ('hot' | 'warm' | 'cold')[];
    aiScoreRange: [number, number];
    searchQuery: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export function ConversationFilters({ filters, setFilters }: ConversationFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleStatusChange = (status: 'hot' | 'warm' | 'cold') => {
    setFilters((prev: any) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s: string) => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatus };
    });
  };

  const handleScoreChange = (_: Event, value: number | number[]) => {
    if (Array.isArray(value)) {
      setFilters((prev: any) => ({ ...prev, aiScoreRange: value as [number, number] }));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations by ID, content..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <div className="absolute right-0 mt-2 w-full md:w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Status</h3>
                  <div className="space-y-2">
                    {(['hot', 'warm', 'cold'] as const).map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => handleStatusChange(status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">AI Score Range</h3>
                  <Slider
                    value={filters.aiScoreRange}
                    onChange={handleScoreChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    sx={{ color: '#2563eb' }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.aiScoreRange[0]}</span>
                    <span>{filters.aiScoreRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 