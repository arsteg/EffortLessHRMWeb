export interface Feedback {
    _id?: string;
    company: string;
    storeId: string;
    tableId?: string;
    provider?: {
      email?: string;
      phoneNumber?: string;
    };
    feedbackValues: { field: string; value: any }[];
    submittedAt?: string;
  }