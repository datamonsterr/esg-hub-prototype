'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { AssessmentTemplate } from '@/src/types';
import Link from 'next/link';
import Icon from '@/src/components/ui/icon';

function CreateAssessmentModal({
  isOpen,
  onClose,
  templates,
  selectedTemplate,
  onSelectTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: AssessmentTemplate[];
  selectedTemplate: AssessmentTemplate | null;
  onSelectTemplate: (template: AssessmentTemplate) => void;
}) {
  if (!templates) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
        </DialogHeader>
        <div className="flex h-[600px]">
          <div className="w-1/2 p-6 border-r border-border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Template
            </h3>
            <div
              className="space-y-3 overflow-y-auto max-h-[500px] pr-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#E3E6EA transparent',
              }}
            >
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <Icon icon={template.icon || ''} className="text-primary text-lg" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  {template.recommended && (
                    <div className="mt-2 text-xs text-primary font-medium">
                      <Icon icon="fa-star" className="mr-1" />
                      Recommended
                    </div>
                  )}
                  {template.lastUsed && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last used: {template.lastUsed}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="w-1/2 p-6 bg-gray-50">
            <TemplatePreview template={selectedTemplate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Link href="/assessment/create">
            <Button>Create Assessment</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
  
function TemplatePreview({ template }: { template: AssessmentTemplate | null }) {
  if (!template) return null;

  if (template.id === 'blank') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon={template.icon || ''} className="text-primary text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {template.title}
        </h3>
        <p className="text-gray-600 mb-6">{template.description}</p>
        <div className="bg-white rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">What you&apos;ll get:</h4>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-center">
              <Icon icon="fa-check" className="text-primary mr-2" />
              Empty assessment template
            </li>
            <li className="flex items-center">
              <Icon icon="fa-check" className="text-primary mr-2" />
              Full customization options
            </li>
            <li className="flex items-center">
              <Icon icon="fa-check" className="text-primary mr-2" />
              All question types available
            </li>
            <li className="flex items-center">
              <Icon icon="fa-check" className="text-primary mr-2" />
              Custom scoring system
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {template.title}
      </h3>
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            {template.details?.category}
          </span>
          <span className="text-sm text-gray-500">
            {template.details?.questions} Questions
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Comprehensive verification of product origin documentation including
          country of origin, manufacturing location, and certification
          compliance.
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sections:</span>
            <span className="text-gray-900">{template.details?.sections}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated time:</span>
            <span className="text-gray-900">{template.details?.time}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Completion rate:</span>
            <span className="text-gray-900">{template.details?.completion}</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Sample Questions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {template.details?.sample.map((q: string, i: number) => (
            <li key={i}>• {q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CreateAssessmentModal; 