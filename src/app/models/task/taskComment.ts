export interface taskComment {
  id: string,
  content: string,
  author: string,
  task: string,
  commentedAt: Date,
  status: string,
  authorfirstName: string,
  authorlastName: string,
  // parent: string,
  // commentType: string
}
export class TaskAttachment {
  attachmentType: string;
  attachmentName: string;
  attachmentSize: string;
  filePath: string;
}

// export class TaskAttachments {
//   task: string;
//   attachments: TaskAttachment[];
//   comment: string;
//   status: string;
//   createdOn: Date;
//   updatedOn: Date;
//   createdBy: string;
//   updatedBy: string;
// }
