import { Component, OnInit } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service'; // Adjust the path if necessary

@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.css']
})
export class OvertimeComponent implements OnInit {
  overtimeData: any[] = [];  // Define and initialize overtimeData as an empty array

  constructor(private overtimeService: AttendanceService) {}

  ngOnInit(): void {
    this.getOverTimeData();
  }

  getOverTimeData() {
    this.overtimeService.getOverTime('0', '10').subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.overtimeData = response.data; // Assign data to overtimeData
        } else {
          console.error('Failed to fetch overtime data');
        }
      },
      error => {
        console.error('Error fetching overtime data:', error);
      }
    );
  }
  
}
