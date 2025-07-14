'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Tag } from './Tag';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = useCallback((tag: string) => {
        const newTag = tag.trim();
        if (newTag && !value.includes(newTag)) {
            onChange([...value, newTag]);
        }
        setInputValue('');
    }, [value, onChange]);

    const removeTag = useCallback((tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    }, [value, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            e.preventDefault();
            removeTag(value[value.length - 1]);
        }
    };

    return (
        <div
            className="w-full flex flex-wrap items-center gap-2 p-2 border border-transparent rounded-md bg-gray-100 transition-colors hover:border-gray-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            onClick={() => inputRef.current?.focus()}
        >
            {value.map(tag => (
                <Tag
                    key={tag}
                    label={tag}
                    onRemove={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                    }}
                />
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={value.length > 0 ? '' : placeholder || 'Add a tag...'}
                className="flex-grow bg-transparent outline-none text-sm min-w-[80px]"
            />
        </div>
    );
} 