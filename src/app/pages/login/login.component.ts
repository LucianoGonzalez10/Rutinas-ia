import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password)
      .then(() => {
        alert('Inicio de sesión exitoso');
        this.router.navigate(['/home']);
      })
      .catch(err => alert(err.message));
  }

  loginConGoogle() {
    this.authService.loginWithGoogle()
      .then(() => {
        alert('Inicio de sesión con Google exitoso');
        this.router.navigate(['/home']);
      })
      .catch(err => alert(err.message));
  }
}
