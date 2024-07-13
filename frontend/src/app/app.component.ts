import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import * as Prism from 'prismjs';

interface Message {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked 
{
  messages: Message[] = [];
  userMessage: string = '';

  constructor(private http: HttpClient) {}

  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, isUser: true });

      this.http.post<any>('http://localhost:5243/api/Chatbotbackend', { message: this.userMessage })
        .subscribe(response => {
          this.messages.push({ text: response.text, isUser: false });
        });

      this.userMessage = '';
    }
  }

  isCodeMessage(message: string): boolean {
    return message.includes('```');
  }

  formatMessage(message: string): string {
    return message.replace(/```[a-z]*\n?/g, '').trim();
  }

  getLanguageClass(message: string): string {
    const langMatch = message.match(/```([a-z]*)/);
    return langMatch ? `language-${langMatch[1]}` : 'language-none';
  }
}
