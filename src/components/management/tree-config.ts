// Default Tree configuration for product tree views
export const DEFAULT_TREE_CONFIG = {
  orientation: "horizontal" as const,
  translate: { x: 60, y: 350 },
  nodeSize: { x: 300, y: 300 },
  separation: { siblings: 0.5, nonSiblings: 1 },
  initialDepth: 1,
  scaleExtent: { min: 1, max: 1 },
  enableLegacyTransitions: false,
  transitionDuration: 0,
  pathFunc: "step" as const,
  shouldCollapseNeighborNodes: false,
  depthFactor: 120,
  zoomable: true,
  draggable: true
};

// Specific overrides for supplier view
export const SUPPLIER_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
};

// Specific overrides for brand view
export const BRAND_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
};