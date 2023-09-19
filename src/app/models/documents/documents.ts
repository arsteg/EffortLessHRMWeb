export interface template {
  _id?: string;
  name: string;
  content?: string;
  active?: boolean;
}
export interface DocumentCategory{
  name: string;
  company: string
}

export interface Document{
  category: string;
  description: string;
}

export interface CompanyPolicyDocument{
  name: string;
  description: string;
  url: string;
}

export interface UserDocument{
  document: string;
  user: string;
}