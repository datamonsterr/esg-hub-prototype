export interface Actor {
  id: number;
  title: string;
  description: string;
  color: string;
  dotColor: string;
}

export interface Action {
  id: number;
  title: string;
  code: string;
  type: string;
  color: string;
}

export interface Artifact {
  id: number;
  name: string;
  code: string;
  type: string;
  color: string;
}

export interface MaterialData {
  id: string;
  name: string;
  origin: string;
  supplier: string;
  certification: string;
  status: string;
}

export interface SupplierData {
  id: string;
  company: string;
  location: string;
  contact: string;
  compliance: number;
  status: string;
}

export interface CertificationData {
  id: string;
  type: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

export interface KeyHighlight {
  title: string;
  percentage: number;
  status: string;
  suggestion: string;
  detail: string;
}

export interface DataValidationData {
  actors: Actor[];
  actions: Action[];
  artifacts: Artifact[];
  materialsData: MaterialData[];
  suppliersData: SupplierData[];
  certificationsData: CertificationData[];
  keyHighlights: KeyHighlight[];
} 