import { randomUUID } from 'crypto';

// Function to generate UUID v5-like deterministic UUIDs for data migration
function generateDeterministicUUID(namespace: string, name: string): string {
  // Simple deterministic UUID generation for migration purposes
  // In production, you'd use proper UUID v5 implementation
  const hash = Buffer.from(namespace + name).toString('hex').slice(0, 32);
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32)
  ].join('-');
}

// Organization mappings
const orgMappings = {
  '1': generateDeterministicUUID('org', '1'),
  '2': generateDeterministicUUID('org', '2'),
  '3': generateDeterministicUUID('org', '3'),
  '4': generateDeterministicUUID('org', '4'),
  '5': generateDeterministicUUID('org', '5'),
};

// Product mappings
const productMappings: Record<string, string> = {};
for (let i = 1; i <= 13; i++) {
  productMappings[i.toString()] = generateDeterministicUUID('product', i.toString());
}

// Assessment template mappings (you'd add these based on your data)
const templateMappings: Record<string, string> = {};

// Assessment mappings (you'd add these based on your data)
const assessmentMappings: Record<string, string> = {};

console.log('Organization UUID mappings:');
console.log(JSON.stringify(orgMappings, null, 2));

console.log('\nProduct UUID mappings:');
console.log(JSON.stringify(productMappings, null, 2));

// Function to convert parent_id to children_ids array structure
function convertProductHierarchy(products: any[]) {
  const childrenMap: Record<string, string[]> = {};
  
  products.forEach(product => {
    if (product.parent_id) {
      const parentUUID = productMappings[product.parent_id];
      if (!childrenMap[parentUUID]) {
        childrenMap[parentUUID] = [];
      }
      childrenMap[parentUUID].push(productMappings[product.id]);
    }
  });
  
  return childrenMap;
}

// Example products data structure for testing
const sampleProducts = [
  { id: '1', parent_id: null, name: 'EcoSmart Laptop' },
  { id: '6', parent_id: '1', name: 'Laptop Screen Assembly' },
  { id: '7', parent_id: '1', name: 'Laptop Battery' },
  { id: '8', parent_id: '1', name: 'Aluminum Chassis' },
  { id: '2', parent_id: null, name: 'Organic Cotton T-Shirt' },
  { id: '9', parent_id: '2', name: 'Organic Cotton Fabric' },
  { id: '10', parent_id: '2', name: 'Natural Dye' },
];

const childrenMap = convertProductHierarchy(sampleProducts);
console.log('\nChildren mapping for products:');
console.log(JSON.stringify(childrenMap, null, 2));

export { orgMappings, productMappings, templateMappings, assessmentMappings, convertProductHierarchy };
