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
  selector: 'app-login',
  imports: [
    CommonModule,
    LogoHeaderComponent,
    ButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    ChangeLanguageComponent,
  ],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  // Forms
  logInForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  recoverPasswordForm!: FormGroup;
  newPasswordForm!: FormGroup;
  // Login
  loginError: boolean = false;
  loginVerifError: boolean = false;
  bannedAccountError: boolean = false;
  // Forgot Password
  isOpenForgotPasswordForm: boolean = false;
  // Recover password
  isOpenRecoverPasswordForm: boolean = false;
  recoverCode!: number;
  recoverPasswordError: boolean = false;
  // New password
  isOpenNewPasswordForm: boolean = false;
  newPasswordPatternError: boolean = false;
  newPasswordRepeatPasswordError: boolean = false;
  // User data
  userEmail!: string;

  constructor(
    public langServ: LanguageService,
    public authServ: AuthService,
    private router: Router,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.logInValidate();
    this.forgotPasswordValidate();
    this.recoverPasswordValidate();
    this.newPasswordFormValidate();
  }

  // FORM VALIDATORS
  logInValidate() {
    this.logInForm = this.fb.group({
      loginEmail: ['', [Validators.required, Validators.email]],
      loginPassword: ['', [Validators.required]],
    });
  }

  forgotPasswordValidate() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  recoverPasswordValidate() {
    this.recoverPasswordForm = this.fb.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  newPasswordFormValidate() {
    this.newPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
      repeatPassword: ['', [Validators.required]],
    });
  }

  get newPasswordRequired() {
    return (
      this.newPasswordForm.get('password')?.errors?.['required'] &&
      this.newPasswordForm.get('password')?.touched
    );
  }
  get newPasswordMinLength() {
    return (
      this.newPasswordForm.get('password')?.errors?.['minlength'] &&
      this.newPasswordForm.get('password')?.touched
    );
  }
  get newPasswordPattern() {
    return (
      this.newPasswordForm.get('password')?.errors?.['pattern'] &&
      this.newPasswordForm.get('password')?.touched
    );
  }

  // --- LOG IN ---
  loginOnSubmit() {
    if (this.logInForm.valid) {
      const formValue = this.logInForm.value;
      const data = {
        email: formValue.loginEmail,
        password: formValue.loginPassword,
      };

      this.authServ.login(data).subscribe({
        next: (data) => {
          localStorage.setItem('user_session', data.token);
          this.loginError = false;
          this.loginVerifError = false;
          this.bannedAccountError = false;
          this.router.navigateByUrl('');
        },
        error: (err) => {
          const backendMessage = err?.error?.message || err.message || '';
          if (backendMessage === 'wrong credentials') {
            this.loginError = true;
            this.loginVerifError = false;
            this.bannedAccountError = false;
          } else if (backendMessage === 'account no verif') {
            this.loginError = false;
            this.loginVerifError = true;
            this.bannedAccountError = false;
          } else if (backendMessage === 'account banned') {
            this.loginError = false;
            this.loginVerifError = false;
            this.bannedAccountError = true;
          }
        },
      });
    }
  }

  // FORGOT YOUR PASSWORD
  forgotPasswordOnSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formValue = this.forgotPasswordForm.value;
      const data = {
        email: formValue.email,
      };

      this.userEmail = data.email;

      this.authServ.forgotPassword(data).subscribe({
        next: (data) => {
          this.recoverCode = data;
          this.isOpenForgotPasswordForm = false;
          this.isOpenRecoverPasswordForm = true;
          // console.log(this.recoverCode);
        },
        error: (err) => {
          const backendMessage = err?.error?.message || err.message || '';
          console.log(backendMessage);
        },
      });
    }
  }

  // NEW PASSWORD
  recoverPasswordFormOnSubmit() {
    if (this.recoverPasswordForm.valid) {
      const formValue = this.recoverPasswordForm.value;
      const data = {
        code: formValue.code,
      };

      if (this.recoverCode === data.code) {
        this.recoverPasswordError = false;
        this.isOpenRecoverPasswordForm = false;
        this.isOpenNewPasswordForm = true;
      } else {
        this.recoverPasswordError = true;
      }
    }
  }

  // RECOVER CODE
  newPasswordFormOnSubmit() {
    if (this.newPasswordForm.valid) {
      const formValue = this.newPasswordForm.value;
      const data = {
        email: this.userEmail,
        password: formValue.password,
        repeatPassword: formValue.repeatPassword,
      };

      if (data.password === data.repeatPassword) {
        this.newPasswordRepeatPasswordError = false;

        this.authServ.changePassword(data).subscribe({
          next: (data) => {
            this.translate
              .get(['auth.login.forgotPassword.recoverCode.newPassword.alert'])
              .subscribe((translations) => {
                Swal.fire({
                  icon: 'success',
                  title:
                    translations[
                      'auth.login.forgotPassword.recoverCode.newPassword.alert'
                    ],
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                }).then(() => {
                  window.location.reload();
                });
              });
          },
          error: (err) => {
            const backendMessage = err?.error?.message || err.message || '';
            console.log(backendMessage);
          },
        });
      } else {
        this.newPasswordRepeatPasswordError = true;
      }
    }
  }
}
