import { candidateDataFieldValue } from "./candidateDataFieldValue";

export interface candidate {
  _id: string,
  name: string,
  email: string,
  phoneNumber: string,
  candidateDataFields:candidateDataFieldValue[]
}

export interface candidateFeedback {
  _id: string,
  name: string,
  email: string,
  phoneNumber: string,
  feedbackFields:feedbackField[]
}

export interface feedbackField{
  _id: string,
  feedbackFieldValue: string,
  fieldName: string,
  fieldValue: string,
  fieldType: string,
  isRequired: boolean
}

