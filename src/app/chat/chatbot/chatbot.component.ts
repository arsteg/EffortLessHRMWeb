import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AIReportService } from 'src/app/_services/aiReportService';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatMessages') chatMessages!: ElementRef; // Reference to the chat messages container

  messages: { sender: string, text: string }[] = [
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ];
  isLoading = false;
  isRecording = false;
  recognition: any;

  constructor(private http: HttpClient, private aiReportService: AIReportService) {}

  ngAfterViewChecked() {
    // Scroll to the bottom whenever the view updates (e.g., new message added)
    this.scrollToBottom();
  }

  sendMessage(userMessage: string): void {
    if (!userMessage.trim()) return;

    // Add user message to the chat
    this.messages.push({ sender: 'user', text: userMessage });

    // Clear the input field
    const inputField = document.querySelector('input') as HTMLInputElement;
    inputField.value = '';

    // Show "Typing..." by setting isLoading to true
    this.isLoading = true;

    this.aiReportService.chatBot(userMessage).subscribe({
      next: (response) => {
        const botResponse = response.data.answer || 'Sorry, I couldn’t find an answer to that question.';
        this.messages.push({ sender: 'bot', text: botResponse });
        this.isLoading = false; // Hide "Typing..." once response is received
      },
      error: (error) => {
        this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' });
        this.isLoading = false; // Hide "Typing..." on error
      }
    });
  }

  onKeyDown(event: KeyboardEvent, userMessage: string): void {
    // Trigger sendMessage when Enter key is pressed
    if (event.key === 'Enter' && !this.isLoading) {
      this.sendMessage(userMessage);
    }
  }

  toggleVoiceInput(inputField: HTMLInputElement): void {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (!this.recognition) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript; // Display the transcribed text in the input field
      };

      this.recognition.onerror = () => {
        alert('Voice recognition failed. Please try again.');
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }

    if (this.isRecording) {
      this.recognition.stop(); // Stop voice recognition
      this.isRecording = false;
    } else {
      this.recognition.start(); // Start voice recognition
      this.isRecording = true;
    }
  }

  private scrollToBottom(): void {
    const chatContainer = this.chatMessages.nativeElement;
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
  }
}

// import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { AIReportService } from 'src/app/_services/aiReportService';

// @Component({
//   selector: 'app-chatbot',
//   templateUrl: './chatbot.component.html',
//   styleUrls: ['./chatbot.component.css']
// })
// export class ChatbotComponent {
//   messages: { sender: string, text: string }[] = [
//     { sender: 'bot', text: 'Hello! How can I help you today?' }
//   ];
//   isLoading = false;
//   isRecording = false;
//   recognition: any;

//   constructor(private http: HttpClient, private aiReportService: AIReportService) {}

//   sendMessage(userMessage: string): void {
//     if (!userMessage.trim()) return;

//     // Add user message to the chat
//     this.messages.push({ sender: 'user', text: userMessage });

//     // Clear the input field
//     const inputField = document.querySelector('input') as HTMLInputElement;
//     inputField.value = '';

//     this.isLoading = true;

//     this.aiReportService.chatBot(userMessage ).subscribe({
//       next: (response) => {
//         this.messages.push({ sender: 'bot', text: response.data.answer });
//             this.isLoading = false;
//       },
//       error: (error) => {
//         this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' });
//             this.isLoading = false;
//       }
//     });
//   }

//   toggleVoiceInput(inputField: HTMLInputElement): void {
//     if (!('webkitSpeechRecognition' in window)) {
//       alert('Voice recognition is not supported in this browser.');
//       return;
//     }

//     if (!this.recognition) {
//       this.recognition = new (window as any).webkitSpeechRecognition();
//       this.recognition.lang = 'en-US';
//       this.recognition.interimResults = false;
//       this.recognition.maxAlternatives = 1;

//       this.recognition.onresult = (event: any) => {
//         const transcript = event.results[0][0].transcript;
//         inputField.value = transcript; // Display the transcribed text in the input field
//       };

//       this.recognition.onerror = () => {
//         alert('Voice recognition failed. Please try again.');
//       };

//       this.recognition.onend = () => {
//         this.isRecording = false;
//       };
//     }

//     if (this.isRecording) {
//       this.recognition.stop(); // Stop voice recognition
//       this.isRecording = false;
//     } else {
//       this.recognition.start(); // Start voice recognition
//       this.isRecording = true;
//     }
//   }
// }