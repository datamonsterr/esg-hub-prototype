"use client"

import { useGetActors } from "@/src/api/integration"
import { Actor } from "@/src/types/data-integration"

interface ActorsProps {
  documentId: string | undefined
}

export function Actors({ documentId }: ActorsProps) {
  const { actors, isLoading, isError } = useGetActors(documentId)

  if (isLoading) return <div>Loading actors...</div>
  if (isError) return <div>Error loading actors.</div>
  if(!Array.isArray(actors)) return <div>Invalid actors data structure.</div>
  if (!actors) return <div>No actors data available.</div>
  if (actors.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <p>No actors found in this document.</p>
      <p className="text-sm mt-1">This document may not contain actor information.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {actors.map((actor: Actor) => (
        <div key={actor.id} className="flex items-start space-x-3 p-4 border border-border-light rounded-brand bg-gray-50">
          <div className={`w-3 h-3 rounded-full mt-1 ${actor.dotColor}`}></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{actor.title}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${actor.color}`}>
                {actor.title}
              </span>
            </div>
            <p className="text-sm text-gray-600">{actor.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 