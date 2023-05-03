import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'milliSecondsToTime'
})
export class MilliSecondsToTimePipe implements PipeTransform {
  transform(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const hoursString = hours.toString().padStart(2, '0');
    const minutesString = minutes.toString().padStart(2, '0');
    return `${hoursString}:${minutesString}`;
  }
}
