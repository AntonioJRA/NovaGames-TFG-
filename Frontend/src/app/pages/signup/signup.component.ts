import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    LogoHeaderComponent,
    ButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    ChangeLanguageComponent,
  ],
  templateUrl: './signup.component.html',
  styles: ``,
})
export class SignupComponent {
  succesfullyRegister: boolean = false;
  signUpForm!: FormGroup;

  constructor(
    public langServ: LanguageService,
    public authServ: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.signUpValidate();
  }

  // --- SIGN UP ---
  signUpValidate() {
    this.signUpForm = this.fb.group({
      signupUsername: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^[a-zA-Z0-9 ]+$/),
        ],
      ],
      signupEmail: ['', [Validators.required, Validators.email]],
      signupPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
      signupPolicy: [false, Validators.requiredTrue],
    });
  }
  // Username
  get signupUsernameRequired() {
    return (
      this.signUpForm.get('signupUsername')?.errors?.['required'] &&
      this.signUpForm.get('signupUsername')?.touched
    );
  }
  get signupUsernameMinLength() {
    return (
      this.signUpForm.get('signupUsername')?.errors?.['minlength'] &&
      this.signUpForm.get('signupUsername')?.touched
    );
  }
  get signupUsernamePattern() {
    return (
      this.signUpForm.get('signupUsername')?.errors?.['pattern'] &&
      this.signUpForm.get('signupUsername')?.touched
    );
  }
  // Email
  get signupEmailRequired() {
    return (
      this.signUpForm.get('signupEmail')?.errors?.['required'] &&
      this.signUpForm.get('signupEmail')?.touched
    );
  }
  get signupEmailFormat() {
    return (
      this.signUpForm.get('signupEmail')?.errors?.['email'] &&
      this.signUpForm.get('signupEmail')?.touched
    );
  }

  // Password
  get signupPasswordRequired() {
    return (
      this.signUpForm.get('signupPassword')?.errors?.['required'] &&
      this.signUpForm.get('signupPassword')?.touched
    );
  }
  get signupPasswordMinLength() {
    return (
      this.signUpForm.get('signupPassword')?.errors?.['minlength'] &&
      this.signUpForm.get('signupPassword')?.touched
    );
  }
  get signupPasswordPattern() {
    return (
      this.signUpForm.get('signupPassword')?.errors?.['pattern'] &&
      this.signUpForm.get('signupPassword')?.touched
    );
  }

  signupOnSubmit() {
    if (this.signUpForm.valid) {
      const formValue = this.signUpForm.value;
      const data = {
        username: formValue.signupUsername,
        email: formValue.signupEmail,
        password: formValue.signupPassword,
      };

      const language = localStorage.getItem('lang') || 'es';

      this.authServ.register(data, language).subscribe({
        next: (data) => {
          this.translate
            .get(['auth.signUp.alert.title', 'auth.signUp.alert.text'])
            .subscribe((translations) => {
              Swal.fire({
                icon: 'success',
                title: translations['auth.signUp.alert.title'],
                text: translations['auth.signUp.alert.text'],
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
            });

          this.signUpForm.reset();
        },
        error: (err) => {
          this.translate
            .get(['auth.signUp.alert.emailAlreadyExists'])
            .subscribe((translations) => {
              Swal.fire({
                icon: 'error',
                title: translations['auth.signUp.alert.emailAlreadyExists'],
                showConfirmButton: true,
              });
            });
        },
      });
    }
  }
}
