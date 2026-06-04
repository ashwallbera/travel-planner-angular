import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly auth = inject(MockAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = 'alex@example.com';
  password = '';
  readonly error = signal('');

  submit(): void {
    if (!this.auth.login(this.email, this.password)) {
      this.error.set('Invalid email. Try alex@example.com, jamie@example.com, or sam@example.com');
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(returnUrl || '/trips');
  }
}
