export interface EmailTemplateType {
  _id?: string;
  emailTemplateTypeId: number;
  name: string;
  company?: string;
  createdOn?: Date;
  updatedOn?: Date;
  createdBy?: string;
  updatedBy?: string;
  isDelete?: boolean;
}
