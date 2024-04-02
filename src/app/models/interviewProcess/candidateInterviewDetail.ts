// Interface for Interview Scheduled By details (excluding unwanted fields)
export interface ScheduledBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Interface for Interviewer details (excluding unwanted fields)
export interface Interviewer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string; // Optional property for jobTitle
}

// Interface for Candidate details (excluding unwanted fields)
export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

// Interface for a single Interview details record
export interface InterviewDetail {
  _id: string;
  candidate: Candidate;
  interviewDateTime: string;
  scheduledBy: ScheduledBy;
  zoomLink: string;
  interviewer: Interviewer;
}
