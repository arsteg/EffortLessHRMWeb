export interface FeedbackField {
    _id?: string;
    name: string;
    company: string;
    description: string;
    dataType: 'string' | 'number' | 'rating' | 'date' | 'boolean';
    isRequired: boolean;
  }

  // src/app/models/feedback/feedback.model.ts
export interface Field {
  id?: string;
  name: string;
  dataType: 'rating' | 'text' | 'number' | 'boolean'; // Define possible data types
}
export interface Provider {
  email: string;
  // Add other provider properties as needed
}
