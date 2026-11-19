
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm: FormGroup;

  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder) {

    this.registerForm = this.fb.group({

      fullName: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],

      username: ['', [
        Validators.required,
        Validators.minLength(4)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      confirmPassword: ['', [
        Validators.required
      ]],

      agreeTerms: [false, [
        Validators.requiredTrue
      ]]

    }, {
      validators: this.passwordMatchValidator
    });

  }

  // Custom Validator: Password harus sama
  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get agreeTerms() {
    return this.registerForm.get('agreeTerms');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Jangan kirim confirmPassword dan agreeTerms ke API.
    const { confirmPassword, agreeTerms, ...userData } =
      this.registerForm.value;

    console.log('Registration Data:', userData);

    alert('Registrasi berhasil disimulasikan! API belum tersedia.');

  }

}
