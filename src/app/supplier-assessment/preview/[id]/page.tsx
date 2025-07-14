'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAssessment } from '@/src/api/supplier-assessment';
import { ArrowLeft, Edit, Send } from 'lucide-react';
import { LoadingProgress } from '@/src/components/ui/loading-progress';

export default function PreviewAssessmentPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <PreviewAssessment />
        </Suspense>
    );
}

function LoadingState() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-4xl mx-auto px-5 py-8">
                <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                    <p className="text-gray-500">Loading assessment preview...</p>
                    <LoadingProgress />
                </div>
            </main>
        </div>
    );
}

function PreviewAssessment() {
    const { id } = useParams();
    const router = useRouter();
    const { assessment, isLoading, isError } = useGetAssessment(id as string);

    if (isLoading) {
        return <LoadingState />;
    }

    if (isError || !assessment) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <main className="max-w-4xl mx-auto px-5 py-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Failed to load assessment</h1>
                    <p className="text-gray-600 mt-2">Could not retrieve the assessment details. It might have been deleted or the link is incorrect.</p>
                    <button onClick={() => router.back()} className="mt-4 flex items-center mx-auto space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                        <ArrowLeft size={20} />
                        <span>Go Back</span>
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-arial">
            <main className="max-w-4xl mx-auto px-5 py-8">
                <PageHeader title={assessment.title} />
                <div className="bg-white rounded-lg border border-border p-8">
                    <AssessmentDetails description={assessment.description} />
                    {assessment.sections?.map((section) => (
                        <Section key={section.id} title={section.title} questions={section.questions} />
                    ))}
                </div>
                <ActionButtons />
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
            <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>
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

function Section({ title, questions }: { title: string; questions: any[] }) {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-primary">{title}</h2>
            <div className="space-y-6">
                {questions.map((question) => (
                    <Question key={question.id} question={question} />
                ))}
            </div>
        </div>
    );
}

function Question({ question }: { question: any }) {
    return (
        <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-800 mb-3">{question.text}</p>
            {question.type === 'multiple-choice' && (
                <div className="space-y-2">
                    {question.answers.map((answer: any) => (
                        <div key={answer.id} className="flex items-center">
                            <input
                                type={question.allowMultipleAnswers ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <label className="text-gray-700">{answer.text}</label>
                        </div>
                    ))}
                </div>
            )}
             {question.type === 'boolean' && (
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name={`question-${question.id}`} className="mr-2"/> Yes
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name={`question-${question.id}`} className="mr-2"/> No
                    </label>
                </div>
            )}
            {question.type === 'text' && (
                <textarea
                    rows={3}
                    placeholder="Your answer..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                ></textarea>
            )}
        </div>
    );
}

function ActionButtons() {
    return (
        <div className="mt-8 flex justify-end space-x-4">
            <button className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
                <Edit size={20} />
                <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                <Send size={20} />
                <span>Submit Assessment</span>
            </button>
        </div>
    );
} 