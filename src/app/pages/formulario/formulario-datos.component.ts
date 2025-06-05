import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-formulario-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-datos.component.html',
  styleUrls: ['./formulario-datos.component.css']
})
export class FormularioDatosComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  genero: string = '';
  edad: number | null = null;
  altura: number | null = null;
  peso: number | null = null;
  nivelActividad: string = '';
  objetivo: string = '';
  diasEntrenamiento: number | null = null;
  tipoRutina: string = '';
  enfoque: string = '';
  equipamiento: string = '';
  ubicacion: string = '';
  fechaNacimiento: string = '';
  lesiones: string = '';
  enfermedades: string = '';

  constructor(
    private router: Router,
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userDocRef = doc(this.firestore, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      this.nombre = userData['nombre'] || '';
      this.apellido = userData['apellido'] || '';
      this.genero = userData['genero'] || '';
      this.edad = userData['edad'] || null;
      this.altura = userData['altura'] || null;
      this.peso = userData['peso'] || null;
      this.nivelActividad = userData['nivelActividad'] || '';
      this.objetivo = userData['objetivo'] || '';
      this.diasEntrenamiento = userData['diasEntrenamiento'] || null;
      this.tipoRutina = userData['tipoRutina'] || '';
      this.enfoque = userData['enfoque'] || '';
      if (Array.isArray(userData['equipamiento'])) {
        this.equipamiento = userData['equipamiento'].join(', ');
      } else {
        this.equipamiento = userData['equipamiento'] || '';
      }
      this.ubicacion = userData['ubicacion'] || '';
      this.fechaNacimiento = userData['fechaNacimiento'] || '';
      this.lesiones = userData['lesiones'] || '';
      this.enfermedades = userData['enfermedades'] || '';
    }
  }

  async onSubmit() {
    if (!this.validarFormulario()) {
      return;
    }

    const user = await this.authService.getCurrentUser();
    if (!user) {
      console.error('No hay usuario autenticado');
      return;
    }

    const datosParaGuardar = {
      nombre: this.nombre,
      apellido: this.apellido,
      genero: this.genero,
      edad: this.edad,
      altura: this.altura,
      peso: this.peso,
      nivelActividad: this.nivelActividad,
      objetivo: this.objetivo,
      diasEntrenamiento: this.diasEntrenamiento,
      tipoRutina: this.tipoRutina,
      enfoque: this.enfoque,
      equipamiento: this.equipamiento,
      ubicacion: this.ubicacion,
      fechaNacimiento: this.fechaNacimiento,
      lesiones: this.lesiones,
      enfermedades: this.enfermedades,
      fechaActualizacion: new Date().toISOString()
    };

    try {
      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      await setDoc(userDocRef, datosParaGuardar, { merge: true });
      console.log('Datos guardados exitosamente', datosParaGuardar);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  }

  private validarFormulario(): boolean {
    if (!this.nombre || !this.apellido) {
      alert('Por favor, completa tu nombre y apellido');
      return false;
    }
    if (!this.edad || this.edad < 15 || this.edad > 100) {
      alert('Por favor, ingresa una edad válida (entre 15 y 100 años)');
      return false;
    }
    if (!this.altura || this.altura < 100 || this.altura > 250) {
      alert('Por favor, ingresa una altura válida (entre 100 y 250 cm)');
      return false;
    }
    if (!this.peso || this.peso < 30 || this.peso > 300) {
      alert('Por favor, ingresa un peso válido (entre 30 y 300 kg)');
      return false;
    }
    if (!this.genero) {
      alert('Por favor, selecciona tu género');
      return false;
    }
    if (!this.nivelActividad) {
      alert('Por favor, selecciona tu nivel de actividad');
      return false;
    }
    if (!this.objetivo) {
      alert('Por favor, selecciona tu objetivo principal');
      return false;
    }
    if (!this.diasEntrenamiento || this.diasEntrenamiento < 1 || this.diasEntrenamiento > 7) {
      alert('Por favor, ingresa un número válido de días de entrenamiento (entre 1 y 7)');
      return false;
    }
    if (!this.tipoRutina) {
      alert('Por favor, selecciona tu tipo de rutina');
      return false;
    }
    return true;
  }
}
