import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ejecucion-rutina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejecucion-rutina.component.html',
  styleUrls: ['./ejecucion-rutina.component.css']
})
export class EjecucionRutinaComponent {
  dia: any;
  ejerciciosRealizados: { peso: number; reps: number }[][] = [];

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.dia = navigation?.extras.state?.['dia'];

    if (this.dia?.ejercicios) {
      this.ejerciciosRealizados = this.dia.ejercicios.map((ej: any) =>
        Array.from({ length: ej.series }, () => ({ peso: 0, reps: 0 }))
      );
    }
  }

  async guardarEjecucion() {
    const user = this.auth.currentUser;
    if (!user) return;

    const ejecucion = {
      dia: this.dia.dia,
      enfoque: this.dia.enfoque,
      fecha: Timestamp.now(),
      ejercicios: this.dia.ejercicios.map((ej: any, i: number) => ({
        nombre: ej.nombre,
        repeticionesObjetivo: ej.repeticiones,
        series: this.ejerciciosRealizados[i] // array con {peso, reps} por serie
      }))
    };

    const ejecucionesCollection = collection(this.firestore, `usuarios/${user.uid}/ejecuciones`);
    await addDoc(ejecucionesCollection, ejecucion);

    alert('¡Ejecución guardada con éxito!');
    this.router.navigate(['/home']);
  }
}
