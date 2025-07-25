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
  const { data: products } = await axiosInstance.get(endpoints.products.base, { params });
  const { data: components } = await axiosInstance.get(endpoints.components.base, { params });

  const componentMap = components.reduce((acc: any, component: any) => {
    acc[component.id] = { ...component, children: [] };
    return acc;
  }, {});

  for (const componentId in componentMap) {
    const component = componentMap[componentId];
    if (component.parentId && componentMap[component.parentId]) {
      componentMap[component.parentId].children.push(component);
    }
  }

  const productTree = products.map((product: any) => {
    const rootComponent = componentMap[product.componentTreeId];
    return {
      ...product,
      children: rootComponent ? rootComponent.children : [],
      status: 'Verified'
    };
  });

  return productTree;
}

export const attachDocumentToProduct = async (
  productId: string,
  documentId: string
): Promise<Product> => {
  const res = await axiosInstance.post(`${endpoints.products.id(productId)}/documents`, { documentId });
  return res.data;
};

// --- NEW: Get unique material codes from components ---
export const getMaterialCodes = async (): Promise<{ id: string; code: string; name: string }[]> => {
  const { data: components } = await axiosInstance.get(endpoints.components.base);
  // Extract unique material codes from components
  const seen = new Set();
  const codes: { id: string; code: string; name: string }[] = [];
  for (const comp of components) {
    const code = comp.sku || comp.id;
    if (!seen.has(code)) {
      seen.add(code);
      codes.push({ id: comp.id, code, name: comp.name });
    }
  }
  return codes;
};

// --- NEW: Get unique suppliers from products/components for an organization ---
export const getSuppliers = async (organizationId?: string): Promise<{ id: string; name: string; category: string; location: string }[]> => {
  // Get all products for the org
  const products = await getProducts({ organizationId });
  // Get all components for these products
  const allComponentIds = products.map(p => p.componentTreeId).filter(Boolean);
  let allComponents: any[] = [];
  for (const compId of allComponentIds) {
    const { data: components } = await axiosInstance.get(`${endpoints.components.base}?parentId=${compId}`);
    allComponents = allComponents.concat(components);
  }
  // Extract unique supplier org IDs from components
  const supplierOrgIds = Array.from(new Set(allComponents.map(c => c.supplierOrganizationId).filter(Boolean)));
  // Get all organizations (mocked from /organizations)
  const { data: orgs } = await axiosInstance.get(endpoints.organizations.base);
  // Map supplier org IDs to org info
  const suppliers = supplierOrgIds.map((id: string) => {
    const org = orgs.find((o: any) => o.id === id);
    return org
      ? { id: org.id, name: org.name, category: org.type || 'Supplier', location: org.address || '' }
      : { id, name: id, category: 'Supplier', location: '' };
  });
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