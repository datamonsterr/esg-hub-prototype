'use client';

import { api } from '@/src/utils/api';
import { CreateProductRequest, Product } from '@/src/types/product';

export const getProductParents = async (productId: string): Promise<Product[]> => {
  // This would typically require cross-organization querying
  // For now, we'll return an empty array as it needs special API design
  // to handle products from different organizations
  return [];
};

export const getProductHierarchy = async (products: Product[]): Promise<any[]> => {
  const productMap = new Map<string, Product>();
  const rootProducts: any[] = [];

  // Build a map for quick lookups
  products.forEach(product => {
    productMap.set(product.id, product);
  });

  // Build the hierarchy
  products.forEach(product => {
    if (!product.parentIds || product.parentIds.length === 0) {
      // Root product
      rootProducts.push({
        ...product,
        children: []
      });
    }
  });

  // Function to recursively build children
  const buildChildren = (parentProduct: any): any => {
    const children = products
      .filter(p => p.parentIds?.includes(parentProduct.id))
      .map(child => buildChildren({ ...child, children: [] }));
    
    return {
      ...parentProduct,
      children
    };
  };

  return rootProducts.map(buildChildren);
};

// #endregion

// #region tRPC Hooks
export function useGetProducts(params?: {
  organizationId?: string;
  category?: string;
  search?: string;
}) {
  const {
    data: products,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getProducts.useQuery(params);

  return {
    products,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetProductById(id: string) {
  const {
    data: product,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getProductById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    product,
    isLoading,
    isError,
    mutate,
  };
}

export function useCreateProduct() {
  const createProductMutation = api.product.createProduct.useMutation();

  return {
    createProduct: createProductMutation.mutateAsync,
    isLoading: createProductMutation.isPending,
    isError: createProductMutation.error,
  };
}

export function useUpdateProduct() {
  const updateProductMutation = api.product.updateProduct.useMutation();

  const updateProduct = async (id: string, data: Partial<Product>) => {
    return await updateProductMutation.mutateAsync({ id, data });
  };

  return {
    updateProduct,
    isLoading: updateProductMutation.isPending,
    isError: updateProductMutation.error,
  };
}

export function useDeleteProduct() {
  const deleteProductMutation = api.product.deleteProduct.useMutation();

  return {
    deleteProduct: deleteProductMutation.mutateAsync,
    isLoading: deleteProductMutation.isPending,
    isError: deleteProductMutation.error,
  };
}

export function useGetProductTree(id: string) {
  const {
    data: productTree,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getProductTree.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    productTree,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetSupplierTree(id: string) {
  const {
    data: supplierTree,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getSupplierTree.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    supplierTree,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetBrandTree(id: string) {
  const {
    data: brandTree,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getBrandTree.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    brandTree,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetMaterialCodes() {
  const {
    data: materialCodes,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getMaterialCodes.useQuery();

  return {
    materialCodes,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetSuppliers() {
  const {
    data: suppliers,
    isLoading,
    error: isError,
    refetch: mutate,
  } = api.product.getSuppliers.useQuery();

  return {
    suppliers,
    isLoading,
    isError,
    mutate,
  };
}

export function useGetProduct(id: string) {
  return useGetProductById(id);
}

// #endregion
