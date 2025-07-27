'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAssessment, useGetTemplate } from '@/src/api/assessment';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { GlobalLoading } from '@/src/components/global-loading';
import { ErrorComponent } from '@/src/components/ui/error';

export default function PreviewAssessmentPage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <PreviewAssessment />
        </Suspense>
    );
}

function PreviewAssessment() {
    const { id } = useParams();
    const router = useRouter();
    const { assessment, isLoading: assessmentLoading, isError: assessmentError } = useGetAssessment(id as string);
    const { template, isLoading: templateLoading, isError: templateError } = useGetTemplate(assessment?.templateId || '');

    const isLoading = assessmentLoading || templateLoading;
    const isError = assessmentError || templateError;

    if (isLoading) {
        return <GlobalLoading />;
    }

    if (isError || !assessment) {
        return (
            <ErrorComponent
                title="Failed to Load Assessment"
                description="Could not retrieve the assessment details. It might have been deleted, or the link is incorrect."
            />
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-arial">
            <main className="px-5 py-8">
                <PageHeader title={assessment.title} />
                <div className="bg-white rounded-lg border border-border p-8">
                    <AssessmentDetails description={assessment.description || ""} />
                    {template?.sections?.map((section) => (
                        <Section
                            key={section.id}
                            title={section.title}
                            description={section.description}
                            questions={section.questions}
                            assessmentResponses={assessment.responses || []}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

function PageHeader({ title }: { title: string }) {
    const router = useRouter();
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-medium text-gray-900">{title}</h1>
                <p className="text-gray-600">Assessment Preview</p>
            </div>
            <div className="flex items-center space-x-4">
                <Button onClick={() => router.back()} variant="ghost">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Button>
                <Button>
                    <Download size={20} />
                    <span>Export</span>
                </Button>
            </div>
        </div>
    );
}

function AssessmentDetails({ description }: { description: string }) {
    return (
        <div className="mb-8 pb-6 border-b border-gray-200">
            <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
    );
}

function Section({
    title,
    description,
    questions,
    assessmentResponses
}: {
    title: string;
    description?: string;
    questions: any[];
    assessmentResponses: any[];
}) {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 pb-2 border-b-2 border-primary">{title}</h2>
            {description && (
                <p className="text-gray-600 mb-4">{description}</p>
            )}
            <div className="space-y-6">
                {questions.map((question) => (
                    <Question
                        key={question.id}
                        question={question}
                        response={assessmentResponses.find(r => r.questionId === question.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function Question({ question, response }: { question: any; response?: any }) {
    return (
        <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-800 mb-3">{question.text}</p>

            {/* Show the actual response if available */}
            {response && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800 mb-1">Response:</p>
                    <p className="text-green-700">{response.answerText || response.answer}</p>
                    {response.metadata && (
                        <div className="mt-2 text-xs text-green-600">
                            {Object.entries(response.metadata).map(([key, value]) => (
                                <span key={key} className="mr-3">
                                    <strong>{key}:</strong> {String(value)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Show question input fields for reference */}
            {question.type === 'multiple-choice' && (
                <div className="space-y-2">
                    {question.options?.map((option: any) => (
                        <div key={option.id} className="flex items-center">
                            <input
                                type={question.allowMultipleAnswers ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                checked={response?.answer === option.value}
                                disabled
                                className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <label className="text-gray-700">{option.text}</label>
                        </div>
                    ))}
                </div>
            )}
            {question.type === 'boolean' && (
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={response?.answer === true}
                            disabled
                            className="mr-2"
                        /> Yes
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={response?.answer === false}
                            disabled
                            className="mr-2"
                        /> No
                    </label>
                </div>
            )}
            {question.type === 'text' && (
                <textarea
                    rows={3}
                    value={response?.answer || ''}
                    placeholder="Your answer..."
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100"
                />
            )}
            {question.type === 'number' && (
                <input
                    type="number"
                    value={response?.answer || ''}
                    placeholder="Enter number..."
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100"
                />
            )}
            {question.type === 'file-upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    {response?.answer ? (
                        <p className="text-gray-700">File uploaded: {response.answer}</p>
                    ) : (
                        <p className="text-gray-500">No file uploaded</p>
                    )}
                </div>
            )}
        </div>
    );
}