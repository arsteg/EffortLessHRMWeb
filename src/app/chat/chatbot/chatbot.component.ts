import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AIReportService } from 'src/app/_services/aiReportService';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  messages: { sender: string; text?: string; imageUrl?: string }[] = [
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ];
  
  isLoading = false;
  isRecording = false;
  recognition: any;
  private wasAtBottom = true; // Track if the user was at the bottom before a new message

  constructor(private http: HttpClient, private aiReportService: AIReportService) {}

  ngAfterViewInit() {
    // Initial scroll to bottom
    this.scrollToBottom();
  }

  sendMessage(userMessage: string): void {
    if (!userMessage.trim()) return;

    // Check if the user is at the bottom before adding a new message
    this.checkIfAtBottom();

    // Add user message to the chat
    this.messages.push({ sender: 'user', text: userMessage });

    // Clear the input field
    const inputField = document.querySelector('input') as HTMLInputElement;
    inputField.value = '';

    // Show "Typing..."
    this.isLoading = true;

    this.aiReportService.chatBot(userMessage).subscribe({
      next: (response) => {
      // Create temporary array to hold all new messages
      const newMessages = response.data.map((item: { type: string, content: string }) => {
        if (item.type === 'text') {
        return { sender: 'bot', text: item.content };
        } else if (item.type === 'image') {
        return { sender: 'bot', imageUrl: item.content };
        }
        return null;
      }).filter(Boolean);

      // Add all messages at once
      this.messages.push(...newMessages);

      // Scroll to bottom only if the user was at the bottom
      if (this.wasAtBottom) {
        setTimeout(() => this.scrollToBottom(), 0);
      }

      this.isLoading = false;
      },
      error: (error) => {
      this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' });
      if (this.wasAtBottom) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
      this.isLoading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent, userMessage: string): void {
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
        inputField.value = transcript;
      };

      this.recognition.onerror = () => {
        alert('Voice recognition failed. Please try again.');
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    } else {
      this.recognition.start();
      this.isRecording = true;
    }
  }

  private checkIfAtBottom(): void {
    const chatContainer = this.chatMessages.nativeElement;
    // Consider "at bottom" if the user is within 50 pixels of the bottom
    this.wasAtBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 50;
  }

  private scrollToBottom(): void {
    const chatContainer = this.chatMessages.nativeElement;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}




// this.aiReportService.chatBot(userMessage).subscribe({
//   next: (response) => {
//     const botResponse = response.data.answer || 'Sorry, I couldn’t find an answer to that question.';
//     const [textPart, imagePath] = botResponse.split('Path:');


//     // Add image message if imagePath exists
//     //Will change this and store in single variable
//     const trimmedImagePath = imagePath?.trim();
//     if (trimmedImagePath) {
//       this.messages.push({ sender: 'bot', text: textPart.trim(), imageUrl: trimmedImagePath });
//     }
//     else{
//       // Add text response
//       this.messages.push({ sender: 'bot', text: textPart.trim() });
//     }

//     // Scroll to bottom only if the user was at the bottom
//     if (this.wasAtBottom) {
//       setTimeout(() => this.scrollToBottom(), 0); // Ensure DOM updates before scrolling
//     }

//     this.isLoading = false;
//   },
//   error: (error) => {
//     this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' });
//     if (this.wasAtBottom) {
//       setTimeout(() => this.scrollToBottom(), 0);
//     }
//     this.isLoading = false;
//   }
// });