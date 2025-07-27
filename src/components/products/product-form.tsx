"use client"

import axiosInstance from "@/src/api/axios"
import { Button } from "@/src/components/ui/button"
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
import { CreateProductRequest, Product } from "@/src/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  organizationId: z.string().min(1, "Organization is required."),
  name: z.string().min(2, "Product name must be at least 2 characters."),
  sku: z.string().min(2, "SKU must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  metadata: z.object({
    brand: z.string().optional(),
    originCountry: z.string().optional(),
  }).optional(),
})

interface ProductFormProps {
  onSubmit: (values: CreateProductRequest) => void;
  onCancel: () => void;
  initialData?: Product;
}

export function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      setIsLoadingOrgs(true);
      try {
        const { data } = await axiosInstance.get('/organizations');
        setOrganizations(data.map((org: any) => ({ id: org.id, name: org.name })));
      } catch (e) {
        setOrganizations([]);
      } finally {
        setIsLoadingOrgs(false);
      }
    }
    fetchOrgs();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: initialData?.organizationId || '',
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      metadata: {
        brand: initialData?.metadata?.brand || '',
        originCountry: initialData?.metadata?.originCountry || '',
      }
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        description: values.description || '',
      });
    } catch (error) {
      console.error('Failed to submit product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Card className="p-6 border-0 shadow-none">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
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