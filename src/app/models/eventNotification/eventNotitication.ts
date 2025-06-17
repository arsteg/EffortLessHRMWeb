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
leadTime:number,
status: string,
updatedBy: string
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

export enum WebSocketContentType {
  Text = 'text',
  JSON = 'json',
  Image = 'image',
  Audio = 'audio',
  Video = 'video',
  File = 'file'
}

export interface WebSocketNotification {
  type: string;          // 'notification'
  contentType: WebSocketContentType;  // Content type enum
  userId: string;         // User ID
  message: string;        // Notification message
  timestamp: Date;        // Timestamp of the notification
} 
