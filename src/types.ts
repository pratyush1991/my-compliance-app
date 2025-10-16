
export enum Geography {
  US = 'United States',
  LATAM = 'Latin America',
  EMEA = 'EMEA (Europe, Middle East, and Africa)',
  JAPAC = 'JAPAC (Japan and Asia-Pacific)',
}

export interface Standard {
  id: string;
  name: string;
  description: string;
}

export interface ComplianceIssue {
  nonCompliantText: string;
  reason: string;
  suggestion: string;
}

export interface ComplianceReport {
  score: number;
  summary: string;
  issues: ComplianceIssue[];
  recommendations: string[];
}
