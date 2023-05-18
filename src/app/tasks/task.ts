import { project } from "../Project/model/project";
export class Task {
    _id: string;
    taskName: string;
    title: string;
    estimate: string;
    startDate: string;
    endDate: string;
    description: string;
    comment: string;
    isSubTask: boolean;
    priority: string;
    TaskUser: User;
    status: string;
    project: project[];
    taskAttachments: TaskAttachment[];
}
export class User {
    firstName: string;
    lastName: string;
}

export interface TaskAttachment {
    _id: string;
    task: string;
    attachmentName: string;
    attachmentType: string;
    attachmentSize: number;
    filePath: string;
    createdOn: Date;
    updatedOn: Date;
    createdBy: string;
    comment: string;
    updatedBy: string;
    company: string;
    status: string;
  }
  export interface attachments{
    attachmentType: string;
    attachmentSize: number;
    attachmentName: string;
    extension: string;
    file: string
  }

export interface taskAttachments{
    taskId: string;
    comment : null;
    taskAttachments: attachments[]
}
export interface commentAttachment{
  taskId: string;
  comment: string,
  taskAttachments: attachments[]
}

