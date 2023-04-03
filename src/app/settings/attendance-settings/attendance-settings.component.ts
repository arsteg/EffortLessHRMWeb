import { Component, OnInit } from '@angular/core';
import { Options, LabelType } from 'ng5-slider';

@Component({
  selector: 'app-attendance-settings',
  templateUrl: './attendance-settings.component.html',
  styleUrls: ['./attendance-settings.component.css']
})
export class AttendanceSettingsComponent implements OnInit {

  //value: number = 0;
  //range: number = 0;
  // tooltip: number;
  // formatLabel(): number {
  //   return this.range;
  // }

  constructor() { }

  ngOnInit(): void {
  }

  options: Options = {
    floor: 0,
    ceil: 24,
    step: 1,
    //showTicks: true,
    //tickStep: 1,
    translate: (value: number, label: LabelType) => {
      switch (label) {
        case LabelType.Low:
          return `${value}hours`;
        case LabelType.High:
          return `${value}hours`;
        default:
          return `${value}hours`;
      }
    },
  };
}
