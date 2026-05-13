export interface Author {
  name: string;
  affiliation: string;
}

export interface SubmissionFormData {
  title: string;
  abstract: string;
  keywords: string[];
  authors: Author[];
  highlights: string[];
  pdf: File | null;
}

export interface AIReviewResult {
  morality_score: number;
  humor_score: number;
  scientific_score: number;
  has_illegal_content: boolean;
  rejection_reason?: string;
  question: {
    question_text: string;
    options: string[];
    correct_answer: number;
  };
}
