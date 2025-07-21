'use client';

import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function AnswerComponent({ sectionIndex, questionIndex, answerIndex, register, removeAnswer }: any) {
    return (
        <div className="flex items-center mb-2">
            <input
                {...register(`sections.${sectionIndex}.questions.${questionIndex}.answers.${answerIndex}.text`)}
                placeholder="Answer text"
                className="text-sm text-gray-700 bg-transparent border-b flex-1 p-1"
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAnswer(answerIndex)}
                className="text-gray-400 hover:text-error ml-2"
            >
                <X size={16} />
            </Button>
        </div>
    );
} 