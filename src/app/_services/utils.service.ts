import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  convertToUTC(date: Date): string {
    const utcDate =new Date(date).toUTCString();
    return utcDate;
  }

  convertToLocal(date:Date){
    // fetch the UTC date from the server
  const utcDate = new Date(date);
  // convert to local date and time
  const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000);

  return localDate.toLocaleString();
  }
}
