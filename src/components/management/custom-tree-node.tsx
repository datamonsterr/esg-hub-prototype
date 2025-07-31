import { Product, ProductNode } from "@/src/types";
import { Box, Package } from "lucide-react";
import { CustomNodeElementProps } from "react-d3-tree";


interface CustomTreeNodeProps {
    nodeDatum: CustomNodeElementProps['nodeDatum'];
    hierarchyPointNode: CustomNodeElementProps['hierarchyPointNode'];
    hierarchicalProducts: ProductNode[],
    allProducts: Map<string, Product>,
    selectedProduct: Product | null,
    currentOrganizationId: string | undefined,
    setSelectedProduct: (product: Product) => void,
}

function CustomTreeNode({ nodeDatum, hierarchyPointNode, hierarchicalProducts, allProducts, selectedProduct, currentOrganizationId, setSelectedProduct }: CustomTreeNodeProps) {
    const productId = nodeDatum.attributes?.productId;
    const product = hierarchicalProducts.find(p => p.id === productId) || 
                   Array.from(allProducts.values()).find(p => p.id === productId);
    
    if (!product) return <div />;

    const isSelected = selectedProduct?.id === product.id;
    const isExternalProduct = currentOrganizationId ? 
      product.organizationId !== currentOrganizationId : 
      false;

    // Check if this is the root node (no parent)
    const isRootNode = !hierarchyPointNode.parent;
    const radius = 20;
    const triangleSize = 5;

    return (
      <g>
        {/* Draw arrow head to the left (pointing right) for horizontal orientation, but not for root node */}
        {!isRootNode && (
          <g>
            {/* Arrow head only - positioned to the left of the node */}
            <polygon
              points={`${-1.5*triangleSize},${triangleSize} ${-1.5*triangleSize},${-triangleSize} 0,0`}
              transform={`translate(${-radius}, 0)`}
              fill="#6b7280"
            />
          </g>
        )}
        
        <circle
          r={radius}
          fill={isExternalProduct ? "#fef3c7" : "#e5e7eb"}
          stroke={isSelected ? "#22c55e" : isExternalProduct ? "#f59e0b" : product.type === 'final_product' ? "#059669" : "#6b7280"}
          strokeWidth={isSelected ? 4 : isExternalProduct ? 3 : 2}
          onClick={() => setSelectedProduct(product)}
          style={{ cursor: 'pointer' }}
        />
        {product.type === 'final_product' ? (
          <Package size={16} x={-8} y={-8} className={isExternalProduct ? "text-amber-700" : "text-gray-700"} />
        ) : (
          <Box size={14} x={-7} y={-7} className={isExternalProduct ? "text-amber-700" : "text-gray-600"} />
        )}
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
      </g>
    );

}

export default CustomTreeNode;