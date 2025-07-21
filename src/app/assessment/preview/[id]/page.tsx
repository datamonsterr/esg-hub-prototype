'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAssessment } from '@/src/api/assessment';
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
    const { assessment, isLoading, isError } = useGetAssessment(id as string);

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
                    <AssessmentDetails description={assessment.description} />
                    {assessment.sections?.map((section) => (
                        <Section key={section.id} title={section.title} questions={section.questions} />
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