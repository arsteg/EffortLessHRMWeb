import { attachments } from "src/app/tasks/task";

export interface taskComment {
  id: string,
  content: string,
  author: string,
  task: string,
  commentedAt: Date,
  status: string,
  authorfirstName: string,
  authorlastName: string,
  taskAttachments: attachments[]
  // parent: string,
  // commentType: string
}
export class TaskAttachment {
  attachmentType: string;
  attachmentName: string;
  attachmentSize: string;
  filePath: string;
}
