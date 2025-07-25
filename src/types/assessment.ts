export type AssessmentStatus = "complete" | "draft" | "in_progress"; // Updated to match schema values

export interface Assessment {
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  templateId: number; // Changed to number and made required to match schema
  organizationId: number; // Changed to number and made required to match schema
  requestingOrganizationId?: number | null; // Changed to number to match schema
  title: string;
  description?: string | null; // Made nullable to match schema
  topic?: string | null; // Made nullable to match schema
  createdBy: string; // Required Clerk user ID to match schema
  createdAt: string;
  updatedAt: string;
  status: "draft" | "in_progress" | "complete"; // Updated to match schema values
  priority: "low" | "medium" | "high" | "urgent"; // Added to match schema
  productIds?: number[] | null; // Changed to number array to match schema
  dueDate?: string | null; // Made nullable to match schema
  completedAt?: string | null;
  dataCompleteness: number;
  
  // Additional fields for UI compatibility (not in schema)
  tags?: string[];
  icon?: string;
  topicColor?: string;
  sections?: AssessmentSection[]; // Made optional since we're using templateId
  componentIds?: string[];
  assignedTo?: string;
  responses?: AssessmentResponse[];
  attachments?: AssessmentAttachment[];
}

export interface AssessmentTemplate {
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  createdByOrganizationId: number; // Added to match schema
  title: string;
  description?: string | null; // Made nullable to match schema
  icon?: string | null; // Made nullable to match schema
  recommended: boolean; // Made required to match schema
  lastUsed?: string | null; // Made nullable to match schema
  tags?: string[] | null; // Made nullable to match schema
  schema: any; // Required JSONB field to match schema
  createdAt: string;
  updatedAt: string;
  
  // Additional fields for UI compatibility (not in schema)
  details?: {
    category?: string;
    sections: number;
    questions: number;
    time: string;
    completion: string;
    sample: string[];
  };
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
  description?: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "text" | "boolean" | "multiple-choice" | "file-upload" | "number";
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

export interface AssessmentResponse {
  questionId: string;
  questionText: string;
  answer: any;
  answerText?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface AssessmentAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  description?: string;
}
