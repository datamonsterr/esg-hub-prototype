'use client'
import React, { useState, useEffect } from "react"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import axiosInstance from "@/src/api/axios"
import type { Product, ComponentNode } from "@/src/types/product"

interface ExtractedProductTreeProps {
  tree: Product
  onChange?: (updated: Product) => void
}

// MOCK DATA FOR LOCAL DEVELOPMENT
const mockProductTree: Product = {
  id: "prod-mock-001",
  organizationId: "org-001",
  name: "Mock Eco-Friendly Running Shoe",
  type: "final_product",
  sku: "MOCK-ERS-001",
  description: "A mock high-performance running shoe made from sustainable materials",
  quantity: 1,
  unit: "piece",
  category: "footwear",
  componentTreeId: "comp-mock-001",
  metadata: {
    sustainabilityScore: 8.5,
    certifications: ["GOTS", "Carbon Neutral"],
    originCountry: "Vietnam",
    carbonFootprint: 12.5,
    weightKg: 0.285,
    dimensions: { length: 290, width: 110, height: 95 },
    brand: "MockBrand"
  },
  dataCompleteness: 85,
  missingDataFields: ["water_usage", "energy_consumption", "waste_generation"],
  status: "active",
  createdAt: "2024-02-15T00:00:00Z",
  updatedAt: "2024-03-20T00:00:00Z",
  children: [
    {
      id: "comp-mock-001",
      organizationId: "org-001",
      productId: "prod-mock-001",
      parentId: undefined,
      name: "Mock Shoe Assembly",
      type: "final_product",
      sku: "MOCK-ERS-001",
      description: "Complete running shoe assembly (mock)",
      quantity: 1,
      unit: "piece",
      metadata: {
        materialType: "composite",
        originCountry: "Vietnam",
        certifications: ["GOTS", "Carbon Neutral"],
        sustainabilityScore: 8.5,
        carbonFootprint: 12.5,
        supplier: "EcoSport Manufacturing" // Store supplier info in metadata
      },
      dataCompleteness: 85,
      missingDataFields: ["assembly_energy", "packaging_impact"],
      status: "active",
      createdAt: "2024-02-15T00:00:00Z",
      updatedAt: "2024-03-20T00:00:00Z",
      children: [
        {
          id: "comp-mock-002",
          organizationId: "org-001",
          productId: "prod-mock-001",
          parentId: "comp-mock-001",
          name: "Mock Upper Material",
          type: "component",
          description: "Shoe upper made from organic cotton and recycled polyester (mock)",
          quantity: 1,
          unit: "piece",
          metadata: {
            materialType: "leather",
            originCountry: "Brazil",
            certifications: ["LWG"],
            sustainabilityScore: 7.2,
            carbonFootprint: 8.7,
            supplier: "Global Leather Co" // Store supplier info in metadata
          },
          dataCompleteness: 88,
          missingDataFields: ["dyeing_process", "finishing_chemicals"],
          status: "active",
          createdAt: "2024-02-15T00:00:00Z",
          updatedAt: "2024-03-18T00:00:00Z",
          children: []
        },
        {
          id: "comp-mock-003",
          organizationId: "org-001",
          productId: "prod-mock-001",
          parentId: "comp-mock-001",
          name: "Mock Sole",
          type: "component",
          description: "Sole made from recycled rubber compounds (mock)",
          quantity: 1,
          unit: "piece",
          metadata: {
            materialType: "rubber",
            originCountry: "Thailand", 
            certifications: ["FSC"],
            sustainabilityScore: 8.9,
            carbonFootprint: 3.4,
            supplier: "Sustainable Rubber Inc" // Store supplier info in metadata
          },
          dataCompleteness: 72,
          missingDataFields: ["vulcanization_process", "chemical_composition", "durability_testing"],
          status: "active",
          createdAt: "2024-02-15T00:00:00Z",
          updatedAt: "2024-03-10T00:00:00Z",
          children: []
        }
      ]
    }
  ]
};

export function ExtractedProductTree({ tree = mockProductTree, onChange }: ExtractedProductTreeProps) {
  const [product, setProduct] = useState<Product>(tree)
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    setProduct(tree)
  }, [tree])

  useEffect(() => {
    async function fetchOrgs() {
      const { data } = await axiosInstance.get('/organizations')
      setOrgs(data.map((o: any) => ({ id: o.id, name: o.name })))
    }
    fetchOrgs()
  }, [])

  // Helper to update a node in the tree by path
  const updateNodeByPath = (node: ComponentNode, path: number[], field: keyof ComponentNode, value: any): ComponentNode => {
    if (path.length === 0) {
      return { ...node, [field]: value }
    }
    const [idx, ...rest] = path
    return {
      ...node,
      children: node.children.map((child, i) =>
        i === idx ? updateNodeByPath(child, rest, field, value) : child
      )
    }
  }

  // Helper to update supplier in the tree by path
  const updateSupplierByPath = (node: ComponentNode, path: number[], supplier: string): ComponentNode => {
    if (path.length === 0) {
      return { 
        ...node, 
        metadata: { 
          ...node.metadata, 
          supplier 
        } 
      }
    }
    const [idx, ...rest] = path
    return {
      ...node,
      children: node.children.map((child, i) =>
        i === idx ? updateSupplierByPath(child, rest, supplier) : child
      )
    }
  }

  // Save changes handler
  const handleSave = () => {
    if (onChange) onChange(product)
  }

  // Recursive tree node renderer
  const TreeNode = ({ node, path }: { node: ComponentNode, path: number[] }) => (
    <li className="ml-4 border-l-2 border-gray-200 pl-4 mb-4 list-none">
      <div className="p-4 border rounded-lg bg-white flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Name:</span>
          <Input
            value={node.name}
            onChange={e => setProduct({
              ...product,
              children: product.children?.map((child, idx) =>
                idx === path[0]
                  ? updateNodeByPath(child, path.slice(1), 'name', e.target.value)
                  : child
              ) || []
            })}
            className="w-64"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">Supplier:</span>
          <Select
            value={node.metadata?.supplier || ''}
            onValueChange={val => setProduct({
              ...product,
              children: product.children?.map((child, idx) =>
                idx === path[0]
                  ? updateSupplierByPath(child, path.slice(1), val)
                  : child
              ) || []
            })}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EcoSport Manufacturing">EcoSport Manufacturing</SelectItem>
              <SelectItem value="Global Leather Co">Global Leather Co</SelectItem>
              <SelectItem value="Sustainable Rubber Inc">Sustainable Rubber Inc</SelectItem>
              <SelectItem value="Premium Materials Ltd">Premium Materials Ltd</SelectItem>
              <SelectItem value="EcoSupply Chain Co">EcoSupply Chain Co</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">Type:</span>
          <span>{node.type}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">Description:</span>
          <Input
            value={node.description || ''}
            onChange={e => setProduct({
              ...product,
              children: product.children?.map((child, idx) =>
                idx === path[0]
                  ? updateNodeByPath(child, path.slice(1), 'description', e.target.value)
                  : child
              ) || []
            })}
            className="w-96"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">Quantity:</span>
          <span>{node.quantity}</span>
          <span className="ml-2 text-xs text-gray-500">{node.unit}</span>
        </div>
      </div>
      {/* Render children recursively as nested list */}
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 mt-2">
          {node.children.map((child, idx) => (
            <TreeNode key={child.id || idx} node={child} path={[...path, idx]} />
          ))}
        </ul>
      )}
    </li>
  )

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Product: {product.name}</h3>
        <div className="text-sm text-gray-600 mb-2">SKU: {product.sku}</div>
        <div className="text-sm text-gray-600 mb-2">Category: {product.category}</div>
        <div className="text-sm text-gray-600 mb-2">Description: {product.description}</div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Component Tree</h4>
        <ul className="space-y-4">
          {product.children && product.children.length > 0 ? (
            product.children.map((child, idx) => (
              <TreeNode key={child.id || idx} node={child} path={[idx]} />
            ))
          ) : (
            <li className="text-gray-500">No components found.</li>
          )}
        </ul>
      </div>
      <Button className="mt-4" onClick={handleSave}>Save Changes</Button>
    </div>
  )
} 