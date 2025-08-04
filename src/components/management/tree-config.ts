// Default Tree configuration for product tree views
export const DEFAULT_TREE_CONFIG = {
  orientation: "horizontal" as const,
  translate: { x: 60, y: 350 },
  nodeSize: { x: 350, y: 300 }, // Increased width to accommodate edit buttons
  separation: { siblings: 0.5, nonSiblings: 1 },
  initialDepth: undefined, // Show all levels by default
  scaleExtent: { min: 0.5, max: 2 }, // Allow more zoom for better edit mode experience
  enableLegacyTransitions: false,
  transitionDuration: 300, // Smooth transitions for better UX
  pathFunc: "step" as const,
  shouldCollapseNeighborNodes: false,
  depthFactor: 150, // Increased spacing for edit mode
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