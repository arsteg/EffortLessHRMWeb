export interface FeedbackField {
    _id?: string;
    name: string;
    company: string;
    description: string;
    dataType: 'String' | 'Number' | 'Rating' | 'Date' | 'Boolean';
    isRequired: boolean;
  }