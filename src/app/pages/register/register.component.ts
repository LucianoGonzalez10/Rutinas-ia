import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isRegistering = false;
  passwordMismatch: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.isRegistering) {
      return; // Prevenir múltiples envíos
    }

    if (this.registerForm.valid) {
      this.isRegistering = true;
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.passwordMismatch = false;

      const { nombre, apellido, email, password, confirmarPassword } = this.registerForm.value;
  
      if (password !== confirmarPassword) {
        this.passwordMismatch = true;
        this.errorMessage = 'Las contraseñas no coinciden';
        this.isLoading = false;
        this.isRegistering = false;
        return;
      }
  
      try {
        const userCredential = await this.authService.register(email, password, nombre, apellido);
        const uid = userCredential.user.uid;

        // Redirigir solo después de que todas las operaciones hayan intentado completarse
        await this.router.navigate(['/home']);
      } catch (error: any) {
        console.error('Error en el registro:', error);
        this.errorMessage = error.message || 'Error al registrar usuario';
      } finally {
        this.isLoading = false;
        this.isRegistering = false;
      }
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
    }
  }

  // Aquí iría la función para subir el archivo a Storage (o en un servicio)
  // async uploadFile(file: File): Promise<string> { /* ... */ }
}
