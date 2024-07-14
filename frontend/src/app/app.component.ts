import { Component, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Prism from 'prismjs';

interface Message {
  text: string;
  isUser: boolean;
  isCode?: boolean;
  code?: SafeHtml;
  explanation?: SafeHtml;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewChecked {
  messages: Message[] = [];
  userMessage: string = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, isUser: true });

      this.http.post<any>('http://localhost:5243/api/Chatbotbackend', { message: this.userMessage })
        .subscribe(response => {
          const parsedMessage = this.parseResponse(response.text);
          this.messages.push(parsedMessage);
        });

      this.userMessage = '';
    }
  }

  parseResponse(response: string): Message {
    const codeRegex = /```(.*?)```/s;
    const codeMatch = response.match(codeRegex);
    const code = codeMatch ? this.sanitizeCode(codeMatch[1]) : '';
    const explanation = this.sanitizeExplanation(response.replace(codeRegex, '').trim());

    return {
      text: response,
      isUser: false,
      isCode: !!codeMatch,
      code: code,
      explanation: explanation
    };
  }

  sanitizeCode(code: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`);
  }

  sanitizeExplanation(explanation: string): SafeHtml {
    const formattedExplanation = explanation
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
    return this.sanitizer.bypassSecurityTrustHtml(formattedExplanation);
  }
}
