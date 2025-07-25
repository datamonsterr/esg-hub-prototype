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

  // Separate root products (no parentId) from child products/components
  const rootProducts = allProducts.filter((p: any) => !p.parentId);
  const childProducts = allProducts.filter((p: any) => p.parentId);

  // Create a map for building hierarchical structure
  const productMap = allProducts.reduce((acc: any, product: any) => {
    acc[product.id] = { ...product, children: [] };
    return acc;
  }, {});

  // Build hierarchical relationships
  for (const product of childProducts) {
    if (productMap[product.parentId]) {
      productMap[product.parentId].children.push(productMap[product.id]);
    }
  }

  // Return root products with their hierarchical children
  const productTree = rootProducts.map((product: any) => ({
    ...productMap[product.id],
    status: 'Verified'
  }));

  return productTree;
}

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
    const code = product.sku || product.id.toString();
    if (!seen.has(code)) {
      seen.add(code);
      codes.push({ id: product.id.toString(), code, name: product.name });
    }
  }
  return codes;
};

// --- Get unique suppliers from products/components for an organization ---
export const getSuppliers = async (organizationId?: string): Promise<{ id: string; name: string; category: string; location: string }[]> => {
  // Get all products for the org from unified products table
  const products = await getProducts({ organizationId });
  
  // Extract unique supplier org IDs from all products/components
  const allProducts = products.flatMap(p => [p, ...(p.children || [])]);
  const supplierOrgIds = Array.from(new Set(
    allProducts
      .map(p => p.supplierOrganizationId)
      .filter(Boolean)
  ));
  
  // Get all organizations
  const { data: orgs } = await axiosInstance.get(endpoints.organizations.base);
  
  // Map supplier org IDs to org info
  const suppliers = supplierOrgIds.map((id: number | null | undefined) => {
    if (!id) return null;
    const org = orgs.find((o: any) => o.id === id);
    return org
      ? { id: org.id.toString(), name: org.name, category: org.type || 'Supplier', location: org.address || '' }
      : { id: id.toString(), name: `Supplier ${id}`, category: 'Supplier', location: '' };
  }).filter(Boolean) as { id: string; name: string; category: string; location: string }[];
  
  return suppliers;
};


// #endregion

// #region SWR
export function useGetProducts(params?: {
  organizationId?: string;
  category?: string;
  search?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    ['/products', params],
    () => getProductsWithComponent(params),
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