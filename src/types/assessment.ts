export type AssessmentStatus = 'Complete' | 'Draft' | 'In Progress';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  topic: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: AssessmentStatus;
  tags: string[];
  icon: string;
  topicColor: string;
  sections: AssessmentSection[];
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  icon?: string;
  recommended?: boolean;
  lastUsed?: string;
  details?: {
    category?: string;
    sections: number;
    questions: number;
    time: string;
    completion: string;
    sample: string[];
  };
  tags?: string[];
  sections?: AssessmentSection[];
}

export interface SupplierAssessmentPageData {
  TABS: string[];
  FILTERS: {
    topics: string[];
    creators: string[];
  };
  templates: AssessmentTemplate[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'text' | 'boolean' | 'multiple-choice' | 'file-upload' | 'number';
  answers?: AssessmentAnswer[];
  allowMultipleAnswers?: boolean;
  isRequired?: boolean;
  productDataField?: string; // Maps to product/component data field
  validationRules?: ValidationRule[];
  options?: QuestionOption[];
}

export interface AssessmentAnswer {
  id: string;
  text: string;
}

export interface CreateAssessmentTemplate {
  title: string;
  description: string;
  sections: AssessmentSection[];
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
}

export interface ValidationRule {
  type: "min" | "max" | "pattern" | "required";
  value: any;
  message: string;
}
