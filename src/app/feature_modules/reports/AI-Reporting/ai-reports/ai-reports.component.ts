import { Component, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { AIReportService } from 'src/app/_services/aiReportService';
import { s } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-ai-reports',  // Change the selector to 'app-ai-reports'  
  templateUrl: './ai-reports.component.html',
  styleUrl: './ai-reports.component.css'
})
export class AiReportsComponent {
  recognizedText: string = '';
  reportText: string = '';
  recognition: any;
  startedEnabled: boolean = true;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private aiReport: AIReportService) {}

  ngOnInit() {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Initialize speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.onresult = (event: any) => {
          this.recognizedText = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };
      } else {
        console.error('Speech recognition is not supported in this browser.');
      }
    }
  }

  play() {
    if (this.recognition) {
      this.recognition.start();
      this.startedEnabled = false;
      console.log('Speech recognition started.');
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
      this.startedEnabled = true;
      console.log('Speech recognition stopped.');
    }
  } 

  generateQueryFromText() {
    // Call the generateQueryFromText method from the AIReportService
    // and pass the recognizedText as an argument.
    const query = {
      "model": "project",
      "prompt": "Find all projects where the status is 'active' and sort by createdOn date descending."
    }

    this.aiReport.generateQueryFromText(query).subscribe( (response) => {      
      this.reportText = response.data;
    });
  }
}
