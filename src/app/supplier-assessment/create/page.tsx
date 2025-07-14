// A comment to trigger a re-check
'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form';
import { useGetTemplate, useCreateAssessment } from '@/src/api/supplier-assessment';
import type { AssessmentTemplate } from '@/src/types/supplier-assessment';
import { ArrowLeft, Bot, Plus, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { LoadingProgress } from '@/src/components/ui/loading-progress';
import SectionComponent from './Section';
import { TagInput } from '@/src/components/ui/TagInput';

export default function CreateAssessmentPage() {
  return (
    <Suspense fallback={<div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader />
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

  const onSubmit: SubmitHandler<AssessmentTemplate> = async (data) => {
    try {
      await useCreateAssessment(data);
      alert('Assessment created successfully!');
      router.push('/supplier-assessment');
    } catch (error) {
      alert('Failed to create assessment.');
      console.error(error);
    }
  };

  if (isTemplateLoading) {
    return <div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader />
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
        <PageHeader />
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

            <button
              type="button"
              onClick={() => appendSection({ id: uuidv4(), title: '', questions: [] })}
              className="text-primary hover:underline flex items-center space-x-2 mt-6"
            >
              <Plus size={20} />
              <span>Add Section</span>
            </button>
          </div>
          <RightSidebar isSubmitting={isSubmitting} />
        </form>
      </main>
    </div>
  );
}

function PageHeader() {
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
      <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
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
      <ActionButtons isSubmitting={isSubmitting} />
      <AiChat />
    </div>
  );
}

function ActionButtons({ isSubmitting }: { isSubmitting: boolean }) {
    return (
      <div id="action-buttons" className="bg-white rounded-lg border border-border p-4 mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 disabled:bg-primary/50">
            <Save size={20} />
            <span>{isSubmitting ? 'Saving...' : 'Save Assessment'}</span>
          </button>
        </div>
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