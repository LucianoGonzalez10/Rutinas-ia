import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, orderBy, onSnapshot, getDocs, QueryDocumentSnapshot, doc, deleteDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

// Definir interfaces para la estructura de los datos guardados
interface SerieData {
  peso: number;
  reps: number;
}

interface EjercicioHistorial {
  nombre: string;
  repeticionesObjetivo: number; // Añadir repeticionesObjetivo
  series: SerieData[]; // Definir series como un array de SerieData
}

interface EjecucionHistorial {
  id: string;
  dia: string;
  enfoque: string;
  fecha: any; // Considerar usar Timestamp si es posible o Date después de .toDate()
  ejercicios: EjercicioHistorial[];
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  ejecuciones: EjecucionHistorial[] = []; // Usar la nueva interfaz
  cargando: boolean = true;
  currentUserUid: string | null = null; // Para almacenar el UID del usuario

  // Propiedades para el área de confirmación
  mostrarConfirmacion: boolean = false;
  ejecucionAEliminarId: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        this.currentUserUid = user.uid; // Guardar el UID
        this.loadExecutions(user.uid); // Cargar ejecuciones para el usuario autenticado
      } else {
        this.ejecuciones = []; // Limpiar ejecuciones si no hay usuario autenticado
        this.cargando = false;
        this.currentUserUid = null;
      }
    });
  }

  async loadExecutions(uid: string) {
    this.cargando = true;
    const ejecucionesRef = collection(this.firestore, `usuarios/${uid}/ejecuciones`);
    const q = query(ejecucionesRef, orderBy('fecha', 'desc'));

    // Usar onSnapshot para actualizaciones en tiempo real
    onSnapshot(q, (querySnapshot) => {
      this.ejecuciones = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          dia: data['dia'],
          enfoque: data['enfoque'],
          fecha: data['fecha'],
          ejercicios: data['ejercicios'].map((ej: any) => ({
            nombre: ej.nombre,
            repeticionesObjetivo: ej.repeticionesObjetivo, // Mapear la propiedad
            series: ej.series // Mapear el array de series
          }))
        };
      });
      this.cargando = false;
    }, (error) => {
      console.error("Error loading executions: ", error);
      this.cargando = false;
    });
  }

  // Abre el área de confirmación
  confirmAndDeleteExecution(id: string) {
    this.ejecucionAEliminarId = id;
    this.mostrarConfirmacion = true;
  }

  // Cancela la eliminación y cierra el área de confirmación
  cancelDeletion() {
    this.mostrarConfirmacion = false;
    this.ejecucionAEliminarId = null;
  }

  // Confirma la eliminación y llama a la función de Firebase
  async proceedDeletion() {
    if (this.ejecucionAEliminarId && this.currentUserUid) {
      try {
        const docRef = doc(this.firestore, `usuarios/${this.currentUserUid}/ejecuciones`, this.ejecucionAEliminarId);
        await deleteDoc(docRef);
        console.log("Document successfully deleted!");
        // onSnapshot en loadExecutions manejará la actualización de la lista automáticamente
      } catch (error) {
        console.error("Error removing document: ", error);
        alert('Hubo un error al intentar eliminar la sesión.');
      } finally {
        this.cancelDeletion(); // Cerrar el área de confirmación después de intentar eliminar
      }
    }
  }

  async deleteExecutionFromFirebase(uid: string, executionId: string) {
    // Esta función ya no se usa directamente desde el template
    // La lógica se movió a proceedDeletion()
  }
}