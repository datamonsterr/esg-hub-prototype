'use client';

import useSWR from 'swr';
import { CreateProductRequest, Product } from '@/src/types/product';
import axiosInstance, { endpoints } from './axios';

// #region RAW API
export const getProducts = async (params?: {
  organizationId?: string;
  category?: string;
  search?: string;
}): Promise<Product[]> => {
  const res = await axiosInstance.get(endpoints.products.base, { params });
  return res.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await axiosInstance.get(endpoints.products.id(id));
  return res.data;
};

export const createProduct = async (data: CreateProductRequest): Promise<Product> => {
  if (!data.organizationId) {
    throw new Error('organizationId is required to create a product');
  }
  const res = await axiosInstance.post(endpoints.products.base, data);
  return res.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  const res = await axiosInstance.put(endpoints.products.id(id), data);
  return res.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoints.products.id(id));
};

export const getProductsWithComponent = async (params?: {
  organizationId?: string;
  category?: string;
  search?: string;
}): Promise<Product[]> => {
  // Get all products from the unified products table
  const { data: allProducts } = await axiosInstance.get(endpoints.products.base, { params });

  // Build hierarchical structure based on children_ids
  const productMap = new Map<string, Product>();
  allProducts.forEach((product: Product) => {
    productMap.set(product.id, { ...product, children: [] });
  });

  // Build the tree structure
  const rootProducts: Product[] = [];
  
  allProducts.forEach((product: Product) => {
    const productWithChildren = productMap.get(product.id)!;
    
    // If this product has children, populate them
    if (product.childrenIds && product.childrenIds.length > 0) {
      product.childrenIds.forEach(childId => {
        const child = productMap.get(childId);
        if (child && productWithChildren.children) {
          productWithChildren.children.push(child as any);
        }
      });
    }
    
    // If this product is not a child of any other product, it's a root product
    const isChildOfAnotherProduct = allProducts.some((p: Product) => 
      p.childrenIds && p.childrenIds.includes(product.id)
    );
    
    if (!isChildOfAnotherProduct) {
      rootProducts.push(productWithChildren);
    }
  });

  return rootProducts;
};

export const attachDocumentToProduct = async (
  productId: string,
  documentId: string
): Promise<Product> => {
  const res = await axiosInstance.post(`${endpoints.products.id(productId)}/documents`, { documentId });
  return res.data;
};

// --- Get unique material codes from products/components ---
export const getMaterialCodes = async (): Promise<{ id: string; code: string; name: string }[]> => {
  // Get all products from unified table, filter for materials/components
  const { data: allProducts } = await axiosInstance.get(endpoints.products.base);
  const materialProducts = allProducts.filter((p: any) => 
    p.type === 'raw_material' || p.type === 'component'
  );
  
  // Extract unique material codes
  const seen = new Set();
  const codes: { id: string; code: string; name: string }[] = [];
  for (const product of materialProducts) {
    const code = product.sku || product.id;
    if (!seen.has(code)) {
      seen.add(code);
      codes.push({ id: product.id, code, name: product.name });
    }
  }
  return codes;
};

// --- Get products with traceability status ---
export const getProductsWithTraceabilityStatus = async (params?: {
  organizationId?: string;
  category?: string;
  search?: string;
}): Promise<Product[]> => {
  // Get all products from the unified products table
  const { data: allProducts } = await axiosInstance.get(endpoints.products.base, { params });

  // Get traceability requests for these products
  const productIds = allProducts.map((p: any) => p.id);
  const { data: traceRequests } = await axiosInstance.get(endpoints.traceability.requests.outgoing, {
    params: { productIds }
  });

  // Build hierarchical structure based on children_ids
  const productMap = new Map<string, Product>();
  allProducts.forEach((product: Product) => {
    // Find traceability status for this product
    const traceRequest = traceRequests?.find((req: any) => 
      req.productIds?.includes(product.id)
    );
    
    const traceabilityStatus = traceRequest ? traceRequest.status : 'none';
    const hasDetailedInfo = traceRequest?.status === 'completed';

    productMap.set(product.id, { 
      ...product, 
      children: [],
      traceabilityStatus,
      hasDetailedInfo
    });
  });

  // Build the tree structure
  const rootProducts: Product[] = [];
  
  allProducts.forEach((product: Product) => {
    const productWithChildren = productMap.get(product.id)!;
    
    // If this product has children, populate them
    if (product.childrenIds && product.childrenIds.length > 0) {
      product.childrenIds.forEach(childId => {
        const child = productMap.get(childId);
        if (child && productWithChildren.children) {
          productWithChildren.children.push(child as any);
        }
      });
    }
    
    // If this product is not a child of any other product, it's a root product
    const isChildOfAnotherProduct = allProducts.some((p: Product) => 
      p.childrenIds && p.childrenIds.includes(product.id)
    );
    
    if (!isChildOfAnotherProduct) {
      rootProducts.push(productWithChildren);
    }
  });

  return rootProducts;
};

// --- Get suppliers from traceability requests for an organization ---
export const getSuppliers = async (organizationId?: string): Promise<{ id: string; name: string; category: string; location: string }[]> => {
  if (!organizationId) return [];
  
  // Get traceability requests made by this organization
  const { data: outgoingRequests } = await axiosInstance.get(endpoints.traceability.requests.outgoing);
  
  // Extract unique target organization IDs
  const supplierOrgIds = Array.from(new Set(
    outgoingRequests
      .map((req: any) => req.targetOrganizationId)
      .filter(Boolean)
  ));
  
  // Get all organizations
  const { data: orgs } = await axiosInstance.get(endpoints.organizations.base);
  
  // Map supplier org IDs to org info
  const suppliers = supplierOrgIds.map((id: unknown) => {
    const orgId = id as string;
    const org = orgs.find((o: any) => o.id === orgId);
    return org
      ? { id: org.id, name: org.name, category: org.type || 'Supplier', location: org.address || '' }
      : { id: orgId, name: `Organization ${orgId}`, category: 'Supplier', location: '' };
  });
  
  return suppliers;
};


// #endregion

// #region SWR
export function useGetProducts(params?: {
  organizationId?: string;
  category?: string;
  search?: string;
  flatView?: boolean; // Add option for flat view instead of tree structure
  includeTraceability?: boolean; // Add option to include traceability status
}) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    ['/products', params],
    () => {
      if (params?.includeTraceability) {
        return getProductsWithTraceabilityStatus(params);
      }
      return params?.flatView ? getProducts(params) : getProductsWithComponent(params);
    },
  );

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Product>(
    id ? `/products/${id}` : null,
    () => getProductById(id),
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateProduct() {
  const createProd = async (data: CreateProductRequest) => {
    if (!data.organizationId) {
      throw new Error('organizationId is required to create a product');
    }
    return await createProduct(data);
  };
  return { createProduct: createProd };
}

export function useUpdateProduct() {
  const updateProd = async (id: string, data: Partial<Product>) => {
    return await updateProduct(id, data);
  };

  return { updateProduct: updateProd };
}

export function useDeleteProduct() {
  const deleteProd = async (id: string) => {
    return await deleteProduct(id);
  };

  return { deleteProduct: deleteProd };
}

export function useAttachDocumentToProduct() {
  const attachDocument = async (productId: string, documentId: string) => {
    return await attachDocumentToProduct(productId, documentId);
  };

  return { attachDocument };
}

export function useGetMaterialCodes() {
  const { data, error, isLoading, mutate } = useSWR<{ id: string; code: string; name: string }[]>(
    '/components/material-codes',
    getMaterialCodes
  );
  return {
    materialCodes: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useGetSuppliers(organizationId?: string) {
  const { data, error, isLoading, mutate } = useSWR<{ id: string; name: string; category: string; location: string }[]>(
    organizationId ? `/suppliers/${organizationId}` : null,
    () => getSuppliers(organizationId)
  );
  return {
    suppliers: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// #endregion 