export interface  user {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface interviewer {
  _id: string;
  interviewer: user;
}

