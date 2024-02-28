import { candidateDataFieldValue } from "./candidateDataFieldValue";

export interface candidate {
  _id: string,
  name: string,
  email: string,
  phoneNumber: string,
  candidateDataFields:candidateDataFieldValue[]
}

