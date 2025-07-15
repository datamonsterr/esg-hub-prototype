"use client"

import * as React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { WidgetCard } from "./widget-card"
import { Edit, Trash, Plus, Save, X, Columns } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

interface DynamicTableProps<T> {
  title: string
  data: T[]
  columns: (keyof T)[]
}

export function DynamicTable<T extends { id: string }>({ title, data: initialData, columns }: DynamicTableProps<T>) {
  const [tableData, setTableData] = useState(initialData)
  const [editRowId, setEditRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Partial<T>>({})
  const [visibleColumns, setVisibleColumns] = useState<(keyof T)[]>(columns)

  const handleEdit = (row: T) => {
    setEditRowId(row.id)
    setEditedData(row)
  }

  const handleCancel = () => {
    setEditRowId(null)
    setEditedData({})
  }

  const handleSave = () => {
    if (!editRowId) return
    setTableData(tableData.map((row) => (row.id === editRowId ? { ...row, ...editedData } : row)))
    setEditRowId(null)
    setEditedData({})
  }

  const handleDelete = (id: string) => {
    setTableData(tableData.filter((row) => row.id !== id))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof T) => {
    setEditedData({ ...editedData, [key]: e.target.value })
  }

  const handleAddNew = () => {
    // This is a placeholder for a more robust add new functionality
    const newId = (tableData.length + 1).toString();
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: "" }), { id: newId }) as T;
    setTableData([...tableData, newRow]);
    handleEdit(newRow);
  };

  const toggleColumnVisibility = (column: keyof T) => {
    setVisibleColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const orderedVisibleColumns = columns.filter(c => visibleColumns.includes(c));

  return (
    <WidgetCard title={title}>
      <div className="flex justify-end mb-4 space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-brand">
              <Columns className="h-4 w-4 mr-2" />
              Edit Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((column: keyof T) => (
              <DropdownMenuCheckboxItem
                key={column as string}
                checked={visibleColumns.includes(column)}
                onCheckedChange={() => toggleColumnVisibility(column)}
              >
                {column as string}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleAddNew} size="sm" className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {orderedVisibleColumns.map((col) => (
              <TableHead key={col as string}>{col as string}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              {orderedVisibleColumns.map((col) => (
                <TableCell key={col as string}>
                  {editRowId === row.id ? (
                    <Input
                      value={(editedData[col] as string) ?? (row[col] as string)}
                      onChange={(e) => handleInputChange(e, col)}
                    />
                  ) : (
                    row[col] as string
                  )}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex space-x-2">
                  {editRowId === row.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WidgetCard>
  )
} 