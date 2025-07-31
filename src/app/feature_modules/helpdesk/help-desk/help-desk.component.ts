import { Component } from '@angular/core';
import { HelpdeskService } from 'src/app/_services/helpdeskService';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

interface HelpRequest {
  id: string;
  createdOn: Date;
  description: string;
  status: string;
  statusColor: string;
  files?: string[];
  video?: string;
}

interface UploadedFile {
  name: string;
  type: string;
  data: string;
}

@Component({
  selector: 'app-help-desk',
  templateUrl: './help-desk.component.html',
  styleUrls: ['./help-desk.component.css'],
})
export class HelpDeskComponent {
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  recordedVideoUrl: string | null = null;
  description: string = '';
  uploadedFiles: UploadedFile[] = [];
  previousRequests: HelpRequest[] = [];
  isSubmitting: boolean = false;

  constructor(private helpdeskService: HelpdeskService,
     private router: Router,
     public dialogRef: MatDialogRef<HelpDeskComponent>,
     private translate: TranslateService
    ) {}

  ngOnInit() {
    this.loadHelpdeskTickets();
  }

  loadHelpdeskTickets() {
    this.helpdeskService.getAllHelpdeskByUser(1).subscribe({
      next: (res: any) => {
        const tickets = res.data;
        this.previousRequests = tickets.map((ticket: any) => ({
          createdOn: new Date(ticket.createdOn),
          description: ticket.description,
          status: ticket.status,
          statusColor: ticket.statusColor,
          files: ticket.files ? ticket.files.split(",") : [],
          video: ticket.video || null,
          id: ticket._id,
        }));
      },
      error: (err) => {
        console.error('Failed to load helpdesk tickets:', err);
      },
    });
  }

  async startRecording() {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      screenVideoTrack.onended = () => {
        this.stopRecording();
      };

      const combinedStream = new MediaStream([
        ...audioStream.getAudioTracks(),
        ...screenStream.getVideoTracks(),
      ]);

      this.isRecording = true;
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(combinedStream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedVideoUrl = URL.createObjectURL(blob);
        this.isRecording = false;

        audioStream.getTracks().forEach((track) => track.stop());
        screenStream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err) {
      console.error('Recording failed: ', err);
      this.isRecording = false;
    }
  }

  stopRecording() {
    console.log('Stopping recording...');
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedFiles.push({
            name: file.name,
            type: file.type || 'application/octet-stream',
            data: e.target.result,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeFile(file: UploadedFile) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => f !== file);
  }

  submitRequest() {
    const descControl = document.getElementById('description');
    if (descControl) {
      descControl.focus();
      descControl.blur();
    }
    if (!this.description || this.description.trim().length === 0) {
      return;
    }
    
    if(this.isSubmitting){
        return;
    }
    this.isSubmitting = true;

    const payload: any = {
      description: this.description,
      files: this.uploadedFiles.map((file) => file.data), // Send base64 strings
      video: null,
    };
  
    const handleResponse = (res: any) => {
      this.isSubmitting = false;
      const tickets = res.data;  
      this.previousRequests = tickets.map((ticket: any) => ({
        createdOn: new Date(ticket.createdOn),
        description: ticket.description,
        status: ticket.status,
        statusColor: ticket.statusColor,
        files: ticket.files ? ticket.files.split(",") : [],
        video: ticket.video || null,
        id: ticket._id,
      }));
  
      // Reset form
      this.description = '';
      this.uploadedFiles = [];
      this.recordedVideoUrl = null;
      this.recordedChunks = [];
      this.isSubmitting = false;

      this.dialogRef.close();
      // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      //   this.router.navigate(['/home/helpdesk']);
      // });
    };
  
    if (this.recordedChunks.length > 0) {
      const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        payload.video = reader.result as string;
  
        this.helpdeskService.createHelpdeskTicket(payload).subscribe({
          next: handleResponse,
          error: (err) => {
            this.isSubmitting = false;
            console.error('Failed to submit helpdesk ticket:', err);
          },
        });
      };
      reader.readAsDataURL(videoBlob);
    } else {
      this.helpdeskService.createHelpdeskTicket(payload).subscribe({
        next: handleResponse,
        error: (err) => {
          this.isSubmitting = false;
          console.error('Failed to submit helpdesk ticket:', err);
        },
      });
    }
  }

  dataURLToBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  deleteRequest(request: HelpRequest): void {
    if (confirm(this.translate.instant('helpdesk.delete_confirmation'))) {
      this.helpdeskService.deleteHelpdeskById(request.id).subscribe({
        next: () => {
          this.previousRequests = this.previousRequests.filter(r => r !== request);
          console.log('Deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete request:', err);
        }
      });
    }
  }

  removeRecordedVideo(): void {
    this.recordedVideoUrl = null;
    this.recordedChunks = [];
  }

  getStatusClass(color: string): string {
    switch (color?.toLowerCase()) {
      case 'green':
        return 'btn-success';
      case 'red':
        return 'btn-danger';
      case 'yellow':
        return 'btn-warning';
      case 'blue':
        return 'btn-primary';
      default:
        return 'btn-secondary';
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}