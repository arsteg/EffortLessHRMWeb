import { FeedbackField } from "./feedback-field.model";

export interface Feedback {
    _id?: string;
    company: string;
    storeId: string;
    tableId?: string;
    provider?: {
      email?: string;
      phoneNumber?: string;
      name?: string;
    };
    feedbackValues: { field: any; value: any }[];
    submittedAt?: string;
  }