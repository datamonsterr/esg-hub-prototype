"use client"

import { useGetActions } from "@/src/api/integration"
import { Action } from "@/src/types/data-integration"

interface ActionsProps {
  documentId: string | undefined
}

export function Actions({ documentId }: ActionsProps) {
  const { actions, isLoading, isError } = useGetActions(documentId)

  if (isLoading) return <div>Loading actions...</div>
  if (isError) return <div>Error loading actions.</div>
  if(!Array.isArray(actions)) return <div>Invalid actions data structure.</div>
  if (!actions) return <div>No actions data available.</div>
  if (actions.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <p>No actions found in this document.</p>
      <p className="text-sm mt-1">This document may not contain action information.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {actions.map((action: Action) => (
        <div key={action.id} className="p-4 border border-border-light rounded-brand bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">{action.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${action.color}`}>
              {action.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Code:</span>
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
              {action.code}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 