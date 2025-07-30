// Default Tree configuration for product tree views
export const DEFAULT_TREE_CONFIG = {
  orientation: "vertical" as const,
  translate: { x: 400, y: 200 },
  nodeSize: { x: 200, y: 150 },
  separation: { siblings: 1.5, nonSiblings: 2 },
  collapsible: true,
  initialDepth: 2,
  zoom: 0.8,
  scaleExtent: { min: 1, max: 1 },
  enableLegacyTransitions: false,
  transitionDuration: 0,
  pathFunc: "step" as const,
  shouldCollapseNeighborNodes: false,
  depthFactor: 120,
  zoomable: true,
  draggable: true,
  // Arrow configuration
  pathClassFunc: () => "tree-link-with-arrow",
};

// Specific overrides for downstream view
export const DOWNSTREAM_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
};

// Specific overrides for upstream view
export const UPSTREAM_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
  orientation: "horizontal" as const,
};

// Function to calculate dynamic tree configuration
export const calculateDynamicTreeConfig = (
  containerWidth: number,
  containerHeight: number,
  treeDepth: number,
  nodeCount: number
) => {
  // Calculate optimal node spacing based on container size
  const horizontalSpacing = Math.max(150, Math.min(250, containerWidth / Math.max(3, Math.sqrt(nodeCount))));
  const verticalSpacing = Math.max(100, Math.min(180, containerHeight / Math.max(2, treeDepth)));
  
  // Calculate zoom to fit the tree
  const baseZoom = Math.min(
    containerWidth / (horizontalSpacing * Math.sqrt(nodeCount)),
    containerHeight / (verticalSpacing * treeDepth)
  );
  const zoom = Math.max(0.3, Math.min(1.2, baseZoom));
  
  // Position root at bottom for reversed tree (flip the Y positioning)
  const translateX = containerWidth / 2;
  const translateY = containerHeight / 2; 
  
  return {
    translate: { x: translateX, y: translateY },
    nodeSize: { x: horizontalSpacing, y: -verticalSpacing }, // Negative Y to reverse direction
    zoom,
    scaleExtent: { min: 0.2, max: 2 },
  };
};
