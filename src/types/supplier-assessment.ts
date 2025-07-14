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
  sections: Section[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
  lastUsed?: string;
  details: {
    category?: string;
    sections: number;
    questions: number;
    time: string;
    completion: string;
    sample: string[];
  };
}

export interface SupplierAssessmentPageData {
  TABS: string[];
  FILTERS: {
    topics: string[];
    creators: string[];
  };
  templates: Template[];
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  sections: Section[];
}

export interface Section {
  id: string;
  title:string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'boolean' | 'multiple-choice';
  answers?: Answer[];
  allowMultipleAnswers?: boolean;
}

export interface Answer {
  id: string;
  text: string;
} 