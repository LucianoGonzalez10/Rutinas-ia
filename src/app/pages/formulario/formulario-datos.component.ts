import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-formulario-datos',
  templateUrl: './formulario-datos.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      background-color: #121212;
      color: #ffffff;
      font-family: 'Inter', 'Roboto', sans-serif;
      box-sizing: border-box;
    }

    form {
      max-width: 500px;
      margin: 40px auto;
      padding: 30px;
      background-color: #1E1E1E;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #00FF00;
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 12px;
      margin-bottom: 20px;
      background-color: #2A2A2A;
      border: 1px solid rgba(0, 255, 0, 0.2);
      border-radius: 8px;
      color: #ffffff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #00FF00;
      box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.2);
    }

    button {
      width: 100%;
      padding: 14px;
      background-color: #00FF00;
      color: #000000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      background-color: #00CC00;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 255, 0, 0.2);
    }

    p {
      text-align: center;
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      font-weight: 500;
    }

    p:empty {
      display: none;
    }
  `]
})
export class Formulario implements OnInit, OnDestroy {
  datosForm: FormGroup;
  userId: string | null = null;
  mensaje: string = '';
  private userSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router
  ) {
    this.datosForm = this.fb.group({
      edad: [null, [Validators.required, Validators.min(1)]],
      sexo: ['', Validators.required],
      altura: [null, [Validators.required, Validators.min(1)]],
      peso: [null, [Validators.required, Validators.min(1)]],
      nivel: ['', Validators.required],
      enfermedades: [''],
      frecuencia: [3, [Validators.required, Validators.min(1), Validators.max(7)]],
      objetivo: ['', Validators.required],
      restricciones: [''],
      equipamiento: this.fb.group({
        mancuernas: [false],
        barra: [false],
        bandas: [false],
        pesoCorporal: [false]
      })
    });
  }

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async guardarDatos() {
    if (!this.userId) {
      this.mensaje = 'Usuario no autenticado';
      return;
    }

    if (this.datosForm.invalid) {
      this.mensaje = 'Por favor, completa todos los campos correctamente';
      Object.keys(this.datosForm.controls).forEach(key => {
        const control = this.datosForm.get(key);
        if (control?.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
      return;
    }

    try {
      const formData = this.datosForm.value;
      formData.equipamiento = Object.keys(formData.equipamiento).filter(eq => formData.equipamiento[eq]);
      console.log('Guardando datos del formulario:', formData);
      
      const docRef = doc(this.firestore, `usuarios/${this.userId}`);
      await setDoc(docRef, formData, { merge: true });
      
      this.mensaje = '✅ Datos guardados correctamente';
      console.log('Datos guardados exitosamente');
      
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      this.mensaje = '❌ Error al guardar los datos';
    }
  }
}
