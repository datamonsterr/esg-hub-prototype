"use client"

import { Product, ProductNode } from "@/src/types";
import { Box, Package, Plus } from "lucide-react";
import { CustomNodeElementProps } from "react-d3-tree";
import { useState } from "react";
import { useTreeEdit } from "./tree-edit-context";

export enum ArrowOrientationType {
  LEFT_TO_RIGHT = 'RIGHT',
  RIGHT_TO_LEFT = 'LEFT',
}

interface EditableCustomTreeNodeProps {
  nodeDatum: CustomNodeElementProps['nodeDatum'];
  hierarchyPointNode: CustomNodeElementProps['hierarchyPointNode'];
  hierarchicalProducts: ProductNode[],
  allProducts: Map<string, Product>,
  selectedProduct: Product | null,
  currentOrganizationId: string | undefined,
  setSelectedProduct: (product: Product) => void,
  arrow: ArrowOrientationType;
}

function EditableCustomTreeNode({ 
  nodeDatum, 
  hierarchyPointNode, 
  hierarchicalProducts, 
  allProducts, 
  selectedProduct, 
  currentOrganizationId, 
  setSelectedProduct, 
  arrow 
}: EditableCustomTreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    isEditMode,
    setSelectedNodeForEdit,
    setShowEditPanel,
    setEditAction,
    setPendingParentId
  } = useTreeEdit();

  const productId = nodeDatum.attributes?.productId;
  
  if (!productId || typeof productId !== 'string') {
    return <div />;
  }

  const product = hierarchicalProducts.find(p => p.id === productId) ||
    allProducts.get(productId);

  if (!product) {
    return <div />;
  }

  const isSelected = selectedProduct?.id === product.id;
  const isExternalProduct = currentOrganizationId ?
    product.organizationId !== currentOrganizationId :
    false;

  const isRootNode = !hierarchyPointNode.parent;
  const isLeafNode = !hierarchyPointNode.children || hierarchyPointNode.children.length === 0;
  const radius = 20;
  const triangleSize = 5;

  const handleNodeClick = () => {
    if (isEditMode) {
      // In edit mode, clicking a node shows the add menu or edit panel
      setSelectedNodeForEdit(product);
      setEditAction('add');
      setPendingParentId(product.id);
      setShowEditPanel(true);
    } else {
      // Normal mode, just select the product
      setSelectedProduct(product);
    }
  };

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeForEdit(null); // Clear selection for new product
    setEditAction('add');
    setPendingParentId(product.id);
    setShowEditPanel(true);
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Draw arrow head to the left (pointing right) for horizontal orientation, but not for root node */}
      {!isRootNode && arrow === ArrowOrientationType.RIGHT_TO_LEFT && (
        <g>
          <polygon
            points={`${-1.5 * triangleSize},${triangleSize} ${-1.5 * triangleSize},${-triangleSize} 0,0`}
            transform={`translate(${-radius}, 0)`}
            fill="#6b7280"
          />
        </g>
      )}

      {!isLeafNode && arrow === ArrowOrientationType.LEFT_TO_RIGHT && (
        <g>
          <polygon
            points={`${-1.5 * triangleSize},${triangleSize} ${-1.5 * triangleSize},${-triangleSize} 0,0`}
            transform={`translate(${radius}, 0) rotate(180)`}
            fill="#6b7280"
          />
        </g>
      )}

      {/* Main node circle */}
      <circle
        r={radius}
        fill={isExternalProduct ? "#fef3c7" : "#e5e7eb"}
        stroke={isSelected ? "#22c55e" : isExternalProduct ? "#f59e0b" : product.type === 'final_product' ? "#059669" : "#6b7280"}
        strokeWidth={isSelected ? 4 : isExternalProduct ? 3 : 2}
        onClick={handleNodeClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Product icon */}
      {product.type === 'final_product' ? (
        <Package size={16} x={-8} y={-8} className={isExternalProduct ? "text-amber-700" : "text-gray-700"} />
      ) : (
        <Box size={14} x={-7} y={-7} className={isExternalProduct ? "text-amber-700" : "text-gray-600"} />
      )}

      {/* Add child button (only visible in edit mode and on hover, and not for external products) */}
      {isEditMode && isHovered && !isExternalProduct && (
        <g>
          <circle
            r={12}
            cx={arrow === ArrowOrientationType.LEFT_TO_RIGHT ? 35 : -35}
            cy={0}
            fill="#22c55e"
            stroke="#16a34a"
            strokeWidth={2}
            onClick={handleAddChildClick}
            style={{ cursor: 'pointer' }}
          />
          <Plus 
            size={16} 
            x={arrow === ArrowOrientationType.LEFT_TO_RIGHT ? 27 : -43} 
            y={-8} 
            className="text-white pointer-events-none" 
          />
        </g>
      )}

      {/* Product name */}
      <text
        fill={isSelected ? "black" : isExternalProduct ? "#92400e" : "black"}
        strokeWidth="0"
        x={0}
        y={40}
        textAnchor="middle"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {product.name}
      </text>

      {/* Product SKU */}
      <text
        fill={isExternalProduct ? "#92400e" : "#6b7280"}
        strokeWidth="0"
        x={0}
        y={55}
        textAnchor="middle"
        style={{ fontSize: '10px' }}
      >
        {product.sku || "No SKU"}
      </text>

      {/* Edit mode indicator */}
      {isEditMode && isHovered && !isExternalProduct && (
        <text
          fill="#22c55e"
          strokeWidth="0"
          x={0}
          y={-30}
          textAnchor="middle"
          style={{ fontSize: '10px', fontWeight: 'bold' }}
        >
          Click to add child
        </text>
      )}
    </g>
  );
}

export default EditableCustomTreeNode;
