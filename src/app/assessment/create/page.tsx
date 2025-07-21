// A comment to trigger a re-check
'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form';
import { useGetTemplate, useCreateAssessment } from '@/src/api/assessment';
import type { AssessmentTemplate } from '@/src/types/assessment';
import { ArrowLeft, Bot, Plus, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { LoadingProgress } from '@/src/components/ui/loading-progress';
import SectionComponent from './Section';
import { TagInput } from '@/src/components/ui/TagInput';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';

export default function CreateAssessmentPage() {
  return (
    <Suspense fallback={<div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader isCreating={false} />
        <div className="flex flex-col items-center justify-center h-[600px] gap-4">
          <p className="text-gray-500">Loading template...</p>
          <LoadingProgress />
        </div>
      </main>
    </div>}>
      <CreateAssessmentForm />
    </Suspense>
  );
}

function CreateAssessmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('templateId');
  const { showSuccessToast, showErrorToast } = useToast();

  const { template, isLoading: isTemplateLoading } = useGetTemplate(templateId || 'blank');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<AssessmentTemplate>({
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      sections: [],
    },
  });

  useEffect(() => {
    if (template) {
      reset(template);
    }
  }, [template, reset]);

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections",
  });

  // FIX: useCreateAssessment usage
  const { createAssessment, isCreating } = useCreateAssessment();

  const onSubmit: SubmitHandler<AssessmentTemplate> = async (data) => {
    try {
      await createAssessment({
        ...data,
        tags: data.tags || [],
        sections: data.sections || [],
      });
      showSuccessToast('Assessment created successfully!');
      router.push('/assessment');
    } catch (error) {
      showErrorToast('Failed to create assessment.');
      console.error(error);
    }
  };

  if (isTemplateLoading) {
    return <div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader isCreating={false} />
        <div className="flex flex-col items-center justify-center h-[600px] gap-4">
          <p className="text-gray-500">Loading template...</p>
          <LoadingProgress />
        </div>
      </main>
    </div>;
  }

  return (
    <div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader isCreating={isCreating} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
          <div
            id="assessment-canvas"
            className="flex-1 bg-white rounded-lg border border-border p-6 overflow-y-auto max-h-[80vh]"
          >
            <AssessmentTitleAndDescription control={control} register={register} errors={errors} />

            {sectionFields.map((field, index) => (
              <SectionComponent
                key={field.id}
                sectionIndex={index}
                control={control}
                register={register}
                removeSection={removeSection}
                errors={errors}
              />
            ))}

            <Button
              type="button"
              variant="link"
              onClick={() => appendSection({ id: uuidv4(), title: '', questions: [] })}
              className="mt-6"
            >
              <Plus size={20} />
              <span>Add Section</span>
            </Button>
          </div>
          <RightSidebar isSubmitting={isSubmitting || isCreating} />
        </form>
      </main>
    </div>
  );
}

function PageHeader({ isCreating }: { isCreating: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-8" id="page-header">
      <div>
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Create ESG Assessment
        </h1>
        <p className="text-gray-600">
          Build a comprehensive sustainability assessment.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isCreating} className="w-fit">
          <Save size={20} />
          <span>{isCreating ? 'Saving...' : 'Save Assessment'}</span>
        </Button>
        <Button onClick={() => router.back()} variant="ghost">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Button>
      </div>
    </div>
  );
}

function AssessmentTitleAndDescription({ control, register, errors }: any) {
  return (
    <div id="assessment-title" className="mb-8">
      <input
        {...register('title', { required: 'Title is required' })}
        placeholder="Assessment Title"
        className="text-2xl font-medium text-gray-900 bg-transparent border-b-2 w-full p-2 rounded-t text-left"
      />
      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}

      <textarea
        {...register('description')}
        placeholder="Add a description for your assessment..."
        className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        rows={3}
      />

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput
              {...field}
              placeholder="Add tags to categorize your assessment"
            />
          )}
        />
      </div>
    </div>
  );
}

function RightSidebar({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="w-80 flex flex-col">
      <Actions />
      <AiChat />
    </div>
  );
}

function Actions() {
  return (
    <div id="action-buttons" className="bg-white rounded-lg border border-border p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
    </div>
  );
}

function AiChat() {
  return (
    <div id="ai-chat" className="bg-white rounded-lg border border-border p-4 flex-1">
      <div className="flex items-center space-x-2 mb-4">
        <Bot size={20} className="text-primary" />
        <span className="font-medium text-gray-900">AI Assistant</span>
      </div>
      <div className="text-sm text-gray-500 text-center py-8">
        AI Assistant is not available in this view.
      </div>
    </div>
  );
} 