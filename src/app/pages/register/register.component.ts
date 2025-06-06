import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
  passwordMismatch: boolean = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.containsUppercase]],
      confirmarPassword: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  private containsUppercase(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/[A-Z]/.test(value)) {
      return { noUppercase: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.isSubmitting) {
      return; // Prevenir múltiples envíos
    }

    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.isLoading = true;
      this.errorMessage = null;
      this.passwordMismatch = false;

      const { nombre, apellido, email, password, confirmarPassword } = this.registerForm.value;
  
      if (password !== confirmarPassword) {
        this.passwordMismatch = true;
        this.errorMessage = 'Las contraseñas no coinciden';
        this.isLoading = false;
        this.isSubmitting = false;
        return;
      }
  
      try {
        await this.authService.register(email, password, nombre, apellido);
        // La redirección se maneja en el servicio de autenticación
      } catch (error: any) {
        console.error('Error en el registro:', error);
        this.errorMessage = error.message || 'Error al registrar usuario';
      } finally {
        this.isLoading = false;
        this.isSubmitting = false;
      }
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
    }
  }

  // Método para navegar a la página de Términos y Políticas
  navigateToTerms(event: Event): void {
    event.preventDefault(); // Evitar la acción por defecto del enlace
    // Abre la página de términos en una nueva pestaña
    window.open('/terminos-politicas', '_blank');
  }
}
