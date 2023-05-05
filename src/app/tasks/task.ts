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
    taskAttachments: taskAttachments[];
}
export class User {
    firstName: string;
    lastName: string;
}

export class taskAttachment{
    taskId: Task['_id'];
    comment: string;
    taskAttachments: taskAttachments[]
}

export class taskAttachments{
    attachmentType: string;
    attachmentName: string;
    attachmentSize: string;
    file: string
}

