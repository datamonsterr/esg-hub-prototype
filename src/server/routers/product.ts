import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { supabaseAdmin } from '@/src/lib/supabase';
import { transformFromDb, transformToDb } from '@/src/types/server-transforms';
import { addCreateTimestamps, sanitizeData } from '@/src/lib/supabase-utils';

export const productRouter = createTRPCRouter({
  // Get products
  getProducts: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      
      let query = supabaseAdmin
        .from('products')
        .select('*')
        .eq('organization_id', userContext.organizationId);

      if (input?.category) {
        query = query.eq('category', input.category);
      }

      if (input?.search) {
        query = query.ilike('name', `%${input.search}%`);
      }

      const { data: products, error } = await query;

      if (error) {
        throw new Error('Failed to fetch products');
      }

      return products?.map((product: any) => transformFromDb(product)) || [];
    }),

  // Get product by ID
  getProductById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }

      return transformFromDb(product);
    }),

  // Create product
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        sku: z.string().optional(),
        quantity: z.number().optional(),
        unit: z.string().optional(),
        type: z.enum(['product', 'component', 'raw_material', 'sub_assembly', 'final_product']).optional(),
        parentIds: z.array(z.string()).optional().nullable(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;

      const productData = {
        ...input,
        organizationId: userContext.organizationId,
        status: 'active' as const,
        dataCompleteness: 50,
        missingDataFields: [],
        childrenIds: [],
      };

      const sanitizedData = sanitizeData(productData);
      const dbData = transformToDb(sanitizedData) as Record<string, any>;
      const finalData = addCreateTimestamps(dbData);

      const { data: product, error } = await supabaseAdmin
        .from('products')
        .insert(finalData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create product');
      }

      return transformFromDb(product);
    }),

  // Update product
  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id, data } = input;

      // Transform camelCase to snake_case for database
      const sanitizedData = sanitizeData(data);
      const dbData = transformToDb(sanitizedData) as Record<string, any>;

      const { data: updatedProduct, error } = await supabaseAdmin
        .from('products')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Product not found');
        }
        throw new Error('Failed to update product');
      }

      return transformFromDb(updatedProduct);
    }),

  // Delete product
  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)
        .eq('organization_id', userContext.organizationId);

      if (error) {
        throw new Error('Failed to delete product');
      }

      return { success: true };
    }),

  // Get product tree
  getProductTree: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      // This is a simplified version - in reality you'd need to recursively fetch the tree
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('organization_id', userContext.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product tree');
      }

      // Fetch children
      let children = [];
      if (product.children_ids && product.children_ids.length > 0) {
        const { data: childrenData, error: childrenError } = await supabaseAdmin
          .from('products')
          .select('*')
          .in('id', product.children_ids);

        if (!childrenError && childrenData) {
          children = childrenData.map((p: any) => transformFromDb(p));
        }
      }

      return {
        ...transformFromDb(product),
        children,
      };
    }),

  // Get supplier tree with recursive fetching - returns react-d3-tree compatible format
  getSupplierTree: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      // Recursive function to fetch complete tree in react-d3-tree format
      const fetchProductTreeNode = async (productId: string, visited = new Set<string>()): Promise<any> => {
        // Prevent infinite loops
        if (visited.has(productId)) {
          return null;
        }
        visited.add(productId);

        // Fetch the product
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('organization_id', userContext.organizationId)
          .single();

        if (error) {
          console.warn(`Failed to fetch product ${productId}:`, error.message);
          return null;
        }

        // Transform product data
        const transformedProduct = transformFromDb(product) as any;

        // Build react-d3-tree node structure
        const treeNode: any = {
          name: transformedProduct.name,
          attributes: {
            productId: transformedProduct.id,
            sku: transformedProduct.sku,
            type: transformedProduct.type,
            category: transformedProduct.category,
            description: transformedProduct.description,
            quantity: transformedProduct.quantity,
            unit: transformedProduct.unit,
            status: transformedProduct.status
          },
          children: [] as any[]
        };
        // Recursively fetch children if they exist
        if (product.children_ids && product.children_ids.length > 0) {
          for (const childId of product.children_ids) {
            const childNode = await fetchProductTreeNode(childId, visited);
            if (childNode) {
              treeNode.children.push(childNode);
            }
          }
        }

        return treeNode;
      };

      const result = await fetchProductTreeNode(id);
      if (!result) {
        throw new Error('Product not found');
      }

      return result;
    }),

  // Get brand tree with recursive fetching - returns react-d3-tree compatible format
  // Shows upward flow: component -> its parent products -> their parent products
  getBrandTree: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userContext = ctx.userContext!;
      const { id } = input;

      // Recursive function to fetch complete brand tree in react-d3-tree format
      const fetchBrandTreeNode = async (productId: string, visited = new Set<string>()): Promise<any> => {
        // Prevent infinite loops
        if (visited.has(productId)) {
          return null;
        }
        visited.add(productId);

        // Fetch the product
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('organization_id', userContext.organizationId)
          .single();

        if (error) {
          console.warn(`Failed to fetch product ${productId}:`, error.message);
          return null;
        }

        // Transform product data
        const transformedProduct = transformFromDb(product) as any;

        // Build react-d3-tree node structure
        const treeNode: any = {
          name: transformedProduct.name,
          attributes: {
            productId: transformedProduct.id,
            sku: transformedProduct.sku,
            type: transformedProduct.type,
            category: transformedProduct.category,
            description: transformedProduct.description,
            quantity: transformedProduct.quantity,
            unit: transformedProduct.unit,
            status: transformedProduct.status
          },
          children: [] as any[]
        };

        // For brand tree, follow parent_ids upward to show what this component goes into
        if (product.parent_ids && product.parent_ids.length > 0) {
          for (const parentId of product.parent_ids) {
            const parentNode = await fetchBrandTreeNode(parentId, visited);
            if (parentNode) {
              treeNode.children.push(parentNode);
            }
          }
        }

        return treeNode;
      };

      const result = await fetchBrandTreeNode(id);
      if (!result) {
        throw new Error('Product not found');
      }

      return result;
    }),

  // Get material codes (mock data for now)
  getMaterialCodes: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock data - in real implementation, this would come from a materials table
      return [
        { id: 'MAT-001', name: 'Organic Cotton' },
        { id: 'MAT-002', name: 'Recycled Polyester' },
        { id: 'MAT-003', name: 'Sustainable Wool' },
      ];
    }),

  // Get suppliers (mock data for now)
  getSuppliers: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock data - in real implementation, this would come from organizations table
      return [
        { id: 'SUP-001', name: 'GreenTech Materials Ltd' },
        { id: 'SUP-002', name: 'EcoFiber Corp' },
        { id: 'SUP-003', name: 'Sustainable Textiles Inc' },
      ];
    }),
});
