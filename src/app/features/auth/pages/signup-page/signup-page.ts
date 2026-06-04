import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {
  private readonly auth = inject(MockAuthService);
  private readonly router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  readonly error = signal('');

  submit(): void {
    if (!this.auth.signup(this.email, this.displayName, this.password)) {
      this.error.set('Email already registered.');
      return;
    }
    void this.router.navigate(['/trips']);
  }
}
