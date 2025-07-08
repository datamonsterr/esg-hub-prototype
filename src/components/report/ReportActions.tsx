'use client';

import { H1, P, Button } from '../ui';
import { ArrowLeft, Save, FileDown } from 'lucide-react';

interface Props {
    /**
     * Optional callbacks if you need to wire the buttons to actions.
     * If omitted the buttons will just render without an onClick handler.
     */
    onBack?: () => void;
    onSaveDraft?: () => void;
    onExport?: () => void;
}

export const ReportActions = ({ onBack, onSaveDraft, onExport }: Props) => (
    <div className="space-y-4 rounded-lg p-4">
        {/* Action buttons */}
        <div className="flex items-center space-x-3 justify-between">
            <div className="flex items-center space-x-6">
                <Button variant="outline" className="text-lg px-3 py-1 border-primary bg-white text-primary hover:bg-primary hover:text-white" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                </Button>
            </div>
            <div className="flex items-center space-x-6">
                <Button variant="primary" className="text-lg px-3 py-1" onClick={onSaveDraft}>
                    <Save className="w-4 h-4 mr-1" />
                    <span>Save</span>
                </Button>
                <Button variant="accent" className="text-lg px-3 py-1" onClick={onExport}>
                    <FileDown className="w-4 h-4 mr-1" />
                    <span>Export</span>
                </Button>
            </div>
        </div>
    </div>
); 