"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card } from "@/src/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { CreateProductRequest, Product } from "@/src/types"
import { Textarea } from "../ui/textarea"
import { useGetProducts } from "@/src/api/product"
import axiosInstance from "@/src/api/axios"

const formSchema = z.object({
  organizationId: z.number(),
  name: z.string().min(2, "Product name must be at least 2 characters."),
  sku: z.string().min(2, "SKU must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  type: z.enum(["final_product", "component", "raw_material", "sub_assembly"]).default("final_product"),
  parentId: z.number().optional().nullable(),
  quantity: z.number().min(0).default(1),
  unit: z.string().default("pcs"),
  supplierOrganizationId: z.number().optional().nullable(),
  metadata: z.object({
    brand: z.string().optional(),
    originCountry: z.string().optional(),
  }).optional(),
})

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (values: CreateProductRequest) => void;
  onCancel: () => void;
  initialData?: Product;
}

export function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Get products for parent selection (exclude components and materials)
  const { products: parentProducts = [] } = useGetProducts();
  const availableParents = parentProducts.filter(p => 
    p.type === 'final_product' && p.id !== initialData?.id
  );

  useEffect(() => {
    async function fetchOrgs() {
      setIsLoadingOrgs(true);
      try {
        const { data } = await axiosInstance.get('/organizations');
        setOrganizations(data.map((org: any) => ({ id: org.id.toString(), name: org.name })));
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setIsLoadingOrgs(false);
      }
    }
    fetchOrgs();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: Number(initialData?.organizationId) || 0,
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      type: initialData?.type || 'final_product',
      parentId: initialData?.parentId || null,
      quantity: initialData?.quantity || 1,
      unit: initialData?.unit || 'pcs',
      supplierOrganizationId: initialData?.supplierOrganizationId || null,
      metadata: {
        brand: initialData?.metadata?.brand || '',
        originCountry: initialData?.metadata?.originCountry || '',
      },
    }
  });

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        description: values.description || '',
      } as CreateProductRequest);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch('type');

  return (
      <Card className="w-full max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isLoadingOrgs}
                    >
                      <option value="">{isLoadingOrgs ? 'Loading organizations...' : 'Select organization...'}</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="final_product">Final Product</option>
                        <option value="component">Component</option>
                        <option value="raw_material">Raw Material</option>
                        <option value="sub_assembly">Sub Assembly</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType !== 'final_product' && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Product</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          value={field.value || ''}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select parent product...</option>
                          {availableParents.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Running Shoe Model X" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., RS-X-001" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select category...</option>
                        <option value="footwear">Footwear</option>
                        <option value="apparel">Apparel</option>
                        <option value="accessories">Accessories</option>
                        <option value="electronics">Electronics</option>
                        <option value="textile">Textile</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="1" 
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="m">Meters</option>
                        <option value="m2">Square Meters</option>
                        <option value="m3">Cubic Meters</option>
                        <option value="liters">Liters</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metadata.brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Brand name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata.originCountry"
                  render={({ field }) => (
                    <FormItem>
                     <FormLabel>Origin Country</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Country of origin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (initialData ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
  )
}
