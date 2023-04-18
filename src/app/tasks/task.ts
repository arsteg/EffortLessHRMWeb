import { project } from "../Project/model/project";
export class Task {
    _id: string;
    taskName: string;
    startDate: string;
    endDate: string;
    description: string;
    comment: string;
    isSubTask: boolean;
    priority: string;
    TaskUser: User;
    status: string;
    project: project[];
}
export class User {
    firstName: string;
    lastName: string;
}
