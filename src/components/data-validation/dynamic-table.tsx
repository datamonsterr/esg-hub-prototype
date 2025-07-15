"use client"

import { useGetDynamicTable } from "@/src/api/integration"
import { DynamicTable as DynamicTableType, DynamicTableData } from "@/src/types/data-integration"
import { useToast } from "@/src/hooks/use-toast"
import { useEffect } from "react"

interface DynamicTableProps {
  documentId: string | undefined
}

export function DynamicTable({ documentId }: DynamicTableProps) {
  const { dynamicTable, isLoading, isError } = useGetDynamicTable(documentId)
  const { showErrorToast } = useToast()

  useEffect(() => {
    if (dynamicTable && (!dynamicTable.columns || !dynamicTable.data)) {
      showErrorToast("Table data structure is invalid or corrupted. Please check the source data format.")
    }
  }, [dynamicTable, showErrorToast])

  if (isLoading) return <div>Loading table data...</div>
  if (isError) return <div>Error loading table data.</div>
  if (!dynamicTable) return <div>No table data available.</div>
  if (!dynamicTable.columns || !dynamicTable.data || !Array.isArray(dynamicTable.data)) {
    return <div>Invalid table structure.</div>
  }

  // Handle special cases for error/no data scenarios
  if (dynamicTable.title === 'No Data Available' || dynamicTable.title === 'Error Loading Table') {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">{dynamicTable.data[0]?.Status || dynamicTable.data[0]?.Error || 'No data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-border-light rounded-brand">
          <thead className="bg-gray-50">
            <tr>
              {dynamicTable.columns.map((column: string, index: number) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-border-light">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dynamicTable.data.map((row: DynamicTableData, rowIndex: number) => (
              <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {dynamicTable.columns.map((column: string, colIndex: number) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 border-b border-border-light">
                    {row[column] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {dynamicTable.data.length} entries
        </span>
        <div className="flex items-center space-x-2">
          <span>Table: {dynamicTable.title}</span>
        </div>
      </div>
    </div>
  )
} 