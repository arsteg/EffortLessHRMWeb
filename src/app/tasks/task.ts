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
  user: string;
  status: string;
  project: project[];
  taskAttachments: attachments[];
}
export class SubTask {
  _id: string;
  parentTask: string;
  taskName: string;
  title: string;
  estimate: string;
  startDate: string;
  endDate: string;
  description: string;
  comment: string;
  isSubTask: boolean;
  priority: string;
  taskUsers: string[];
  status: string;
  project: string;
  taskAttachments: taskAttachments[];
}
export class updateTask{
  taskName: string;
  description: string;
  priority: string;
  project: string;
  title: string;
  status: string;
  comment: string
}
export class updateSubTask{
  taskName: string;
  description: string;
  priority: string;
  project: string;
  title: string;
  parentTask: string;
  status: string
}
  export class TaskBoard {
  taskName: string;
  title: string;
  description: string;
  comment: string;
  priority: string;
  taskUsers: string[];
  status: string;
  project: project[];
}
export class User {
  firstName: string;
  lastName: string;
  id: string
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
export interface attachments {
  attachmentType: string;
  attachmentSize: number;
  attachmentName: string;
  extension: string;
  file: string
}

export interface taskAttachments {
  taskId: string;
  taskAttachments: attachments[]
}
export interface commentAttachment {
  taskId: string;
  comment: string,
  taskAttachments: attachments[]
}

