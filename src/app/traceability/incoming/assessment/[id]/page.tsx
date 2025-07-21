'use client';

import { useGetTemplate } from '@/src/api/assessment';
import {
  AssessmentQuestion
} from '@/src/types/assessment';
import {
  ArrowLeft,
  Clock,
  CloudUpload,
  Save,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TraceabilityAssessmentProps {
  params: {
    id: string;
  };
  searchParams: {
    traceabilityRequestId?: string;
  };
}

export default function TraceabilityAssessmentPage({
  params,
  searchParams
}: TraceabilityAssessmentProps) {
  const router = useRouter();
  const { template, isLoading, isError } = useGetTemplate(params.id);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (template && template.sections && template.sections.length > 0) {
      setActiveSection(template.sections[0].id);
      // Initialize form data
      const initialData: Record<string, any> = {};
      template.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialData[question.id] = question.answers?.[0] || '';
        });
      });
      setFormData(initialData);
    }
  }, [template]);

  const handleInputChange = (questionId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting assessment:', formData);
    // In a real app, this would submit to the API
    alert(
      'Assessment submitted successfully! Your suppliers will receive the assessment shortly.'
    );
    if (searchParams.traceabilityRequestId) {
      router.push(
        `/traceability/incoming/${searchParams.traceabilityRequestId}`
      );
    } else {
      router.push('/traceability/incoming');
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    alert('Assessment saved as draft');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-error">
            Failed to load assessment template. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-8">
      {/* Header Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-gray-900 mb-2">
              {template.title}
            </h1>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-primary flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </section>

      {/* Assessment Info Card */}
      <section className="mb-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                {template.title}
              </h2>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                <Clock className="h-4 w-4 mr-1" />
                Due:{' '}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">
                Assessment Type
              </h4>
              <p className="text-sm text-gray-600">Material Sustainability</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">Assessment ID</h4>
              <p className="text-sm text-gray-600">{params.id}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">Progress</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/3"></div>
                </div>
                <span className="text-sm text-gray-600">33%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="mb-8">
        <div className="bg-white rounded-lg border border-border">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 border-r border-border p-6">
              <h3 className="font-medium text-gray-900 mb-4">Sections</h3>
              <ul className="space-y-2">
                {template.sections?.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form Content */}
            <div className="w-3/4 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {template.sections?.map((section) =>
                  activeSection === section.id ? (
                    <div key={section.id}>
                      <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                        {section.title}
                      </h3>
                      <div className="space-y-6">
                        {section.questions.map((question) => (
                          <Question
                            key={question.id}
                            question={question}
                            value={formData[question.id]}
                            onChange={handleInputChange}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}

                <div className="flex items-center justify-end space-x-4 pt-8 border-t border-border">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Assessment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Question component to render different question types
const Question = ({
  question,
  value,
  onChange
}: {
  question: AssessmentQuestion;
  value: any;
  onChange: (questionId: string, value: any) => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(question.id, e.target.value);
  };

  const handleCheckboxChange = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(question.id, question.allowMultipleAnswers ? newValues : newValues[0] || '');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {question.text}
        {question.isRequired && <span className="text-error ml-1">*</span>}
      </label>
      {question.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          required={question.isRequired}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      )}
      {question.type === 'number' && (
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          required={question.isRequired}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      )}
      {question.type === 'boolean' && (
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={question.id}
              checked={value === true}
              onChange={() => onChange(question.id, true)}
              required={question.isRequired}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={question.id}
              checked={value === false}
              onChange={() => onChange(question.id, false)}
              required={question.isRequired}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span>No</span>
          </label>
        </div>
      )}
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label key={option.id} className="flex items-center space-x-3">
              <input
                type={question.allowMultipleAnswers ? 'checkbox' : 'radio'}
                name={question.id}
                value={option.value}
                checked={
                  question.allowMultipleAnswers
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value
                }
                onChange={() => handleCheckboxChange(option.value)}
                required={question.isRequired && !question.allowMultipleAnswers}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">{option.text}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === 'file-upload' && (
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <CloudUpload className="text-gray-400 h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {value ? 'File uploaded' : 'Drag and drop or'}
          </p>
          <button
            type="button"
            className="mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
          >
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
}; 