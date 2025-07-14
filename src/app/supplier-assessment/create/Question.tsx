'use client';

import { useFieldArray, useWatch } from 'react-hook-form';
import { Trash, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AnswerComponent from './Answer';

export default function QuestionComponent({ sectionIndex, questionIndex, control, register, removeQuestion, errors }: any) {
    const { fields: answerFields, append: appendAnswer, remove: removeAnswer } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.questions.${questionIndex}.answers`
    });

    const questionType = useWatch({
        control,
        name: `sections.${sectionIndex}.questions.${questionIndex}.type`
    });

    return (
        <div className="border-l-4 border-gray-300 pl-4 mb-4 py-2">
            <div className="flex items-start justify-between mb-2">
                <textarea
                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.text`, { required: 'Question text is required' })}
                    placeholder="Question Text"
                    className="text-gray-900 bg-transparent border-b-2 flex-1 p-1"
                    rows={2}
                />
                <button type="button" onClick={() => removeQuestion(questionIndex)} className="text-gray-400 hover:text-error ml-4">
                    <Trash size={20} />
                </button>
            </div>
            {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.text && <p className="text-red-500 text-sm mt-1">{errors.sections[sectionIndex].questions[questionIndex].text.message}</p>}

            <select {...register(`sections.${sectionIndex}.questions.${questionIndex}.type`)} className="text-sm text-gray-600 border border-border rounded p-2 mt-2">
                <option value="text">Text</option>
                <option value="boolean">Boolean (Yes/No)</option>
                <option value="multiple-choice">Multiple Choice</option>
            </select>

            {questionType === 'multiple-choice' && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.allowMultipleAnswers`)}
                            className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Allow multiple answers</label>
                    </div>
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Answers</h4>
                    {answerFields.map((answer, answerIndex) => (
                        <AnswerComponent
                            key={answer.id}
                            sectionIndex={sectionIndex}
                            questionIndex={questionIndex}
                            answerIndex={answerIndex}
                            register={register}
                            removeAnswer={removeAnswer}
                        />
                    ))}
                    <button type="button" onClick={() => appendAnswer({ id: uuidv4(), text: '' })} className="text-primary hover:underline flex items-center space-x-2 mt-2 text-sm">
                        <Plus size={16} />
                        <span>Add Answer</span>
                    </button>
                </div>
            )}
        </div>
    );
} 