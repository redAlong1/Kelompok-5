import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // SESUAIKAN path

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {

    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],

      rememberMe: [false]
    });

  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password, rememberMe } = this.loginForm.value;

    this.authService.login({ username, password }, rememberMe).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl || '/');
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 0) {
          this.errorMessage = 'Tidak dapat terhubung ke server.';
        } else if (err.status === 400 || err.status === 401) {
          this.errorMessage = 'Username/email atau password salah.';
        } else {
          this.errorMessage = 'Terjadi kesalahan, silakan coba lagi.';
        }
      }
    });

  }

}