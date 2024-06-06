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



