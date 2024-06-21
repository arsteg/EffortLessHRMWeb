export interface eventNotificationType {
  _id: string,
  name: string
}

export interface eventNotification {
  _id: string,
  name: string,
description: string,
eventNotificationType:string,
date:Date,
isRecurring:boolean
recurringFrequency:string,
leadTime:number
}

export interface UserNotification {
  user: string;
  notification: string;
  status: string;
}

export class notificationUser{
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isSelected:boolean;
}
export class updateUserNotification{
  user: string;
  notification: string;
  action: string;
}


