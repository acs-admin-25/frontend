'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatting';
import type { Conversation } from '@/types/conversation';

interface ConversationListProps {
  conversations: Conversation[];
  sortField: 'aiScore' | 'date' | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'aiScore' | 'date' | null) => void;
}

function getStatus(score: number | null): 'hot' | 'warm' | 'cold' {
    if (score === null || isNaN(score)) return "cold";
    if (score >= 80) return "hot";
    if (score >= 60) return "warm";
    return "cold";
}

const SortableHeader: React.FC<{
    field: 'aiScore' | 'date';
    label: string;
    sortField: 'aiScore' | 'date' | null;
    sortDirection: 'asc' | 'desc';
    onSort: (field: 'aiScore' | 'date' | null) => void;
}> = ({ field, label, sortField, sortDirection, onSort }) => (
    <th className="text-left p-4 font-medium text-gray-600">
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
            {label}
            {sortField === field && (
                sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
        </button>
    </th>
);

export function ConversationList({ conversations, sortField, sortDirection, onSort }: ConversationListProps) {
  const router = useRouter();

  const handleRowClick = (conversationId: string) => {
    router.push(`/dashboard/conversations/${conversationId}`);
  };

  if (conversations.length === 0) {
    return <div className="text-center py-16 text-gray-500">No conversations found.</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Client</th>
                        <SortableHeader field="aiScore" label="AI Score" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                        <th className="text-left p-4 font-medium text-gray-600">Summary</th>
                        <SortableHeader field="date" label="Last Message" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                        <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {conversations.map(({ thread, messages }) => (
                        <tr
                            key={thread.id}
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleRowClick(thread.conversation_id)}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                        {(thread.source_name || thread.lead_name || 'U')[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{thread.source_name || thread.lead_name || "Unknown Client"}</div>
                                        {thread.busy && <span className="text-xs text-green-600">Email in progress...</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {thread.aiScore?.toFixed(0) ?? 'N/A'}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{thread.ai_summary || 'No summary available.'}</td>
                            <td className="p-4 text-sm text-gray-600">{formatRelativeTime(thread.updatedAt)}</td>
                            <td className="p-4">
                                {(() => {
                                    const status = getStatus(thread.aiScore);
                                    const statusClasses = {
                                        hot: 'bg-red-100 text-red-800',
                                        warm: 'bg-yellow-100 text-yellow-800',
                                        cold: 'bg-gray-100 text-gray-800',
                                    };
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                                            {status.toUpperCase()}
                                        </span>
                                    );
                                })()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
            {conversations.map(({ thread, messages }) => (
                <div
                    key={thread.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg"
                    onClick={() => handleRowClick(thread.conversation_id)}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                {(thread.source_name || thread.lead_name || 'U')[0]}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{thread.source_name || thread.lead_name || "Unknown Client"}</h3>
                                <p className="text-xs text-gray-500">{formatRelativeTime(thread.updatedAt)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                AI: {thread.aiScore?.toFixed(0) ?? 'N/A'}
                            </span>
                             {(() => {
                                const status = getStatus(thread.aiScore);
                                const statusClasses = {
                                    hot: 'bg-red-100 text-red-800',
                                    warm: 'bg-yellow-100 text-yellow-800',
                                    cold: 'bg-gray-100 text-gray-800',
                                };
                                return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                                        {status.toUpperCase()}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{thread.ai_summary || "No summary available"}</p>
                    {thread.busy && <p className="text-xs text-green-600 mt-2">Email in progress...</p>}
                </div>
            ))}
        </div>
    </div>
  );
} 