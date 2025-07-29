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
  pathFunc: "diagonal" as const,
  shouldCollapseNeighborNodes: false,
  depthFactor: 120,
  zoomable: true,
  draggable: true,
};

// Specific overrides for downstream view
export const DOWNSTREAM_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
  scaleExtent: { min: 0.8, max: 0.8 },
};

// Specific overrides for upstream view
export const UPSTREAM_TREE_CONFIG = {
  ...DEFAULT_TREE_CONFIG,
};
