import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { user, User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { Formulario } from '../formulario/formulario-datos.component';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { GeminiService } from '../../services/gemini.service';
import { updateDoc } from '@angular/fire/firestore';
import { GraficoDiasCompletadosComponent } from '../graficos/grafico-dias-completados/grafico-dias-completados.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Formulario, RouterModule, GraficoDiasCompletadosComponent],
  templateUrl: './home.component.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      background-color: #121212;
    }

    .home-container {
      padding: 40px;
      width: 100%;
      min-height: 100vh;
      background-color: #121212;
      color: #ffffff;
      font-family: 'Inter', 'Roboto', sans-serif;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    h2 {
      color: #00FF00;
      font-weight: 600;
      margin-bottom: 2rem;
      font-size: 2.5rem;
    }

    h3 {
      color: #00FF00;
      font-weight: 600;
      margin-bottom: 1.5rem;
      font-size: 2rem;
    }

    .formulario-status {
      background-color: rgba(0, 255, 0, 0.1);
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      border: 1px solid rgba(0, 255, 0, 0.2);
      font-size: 1.2rem;
    }

    .rutina-container {
      background-color: #1E1E1E;
      padding: 35px;
      border-radius: 12px;
      margin: 30px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 1000px;
    }

    .rutina-content {
      background-color: #2A2A2A;
      padding: 35px;
      border-radius: 8px;
      border: 1px solid rgba(0, 255, 0, 0.1);
    }

    .rutina-content pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.8;
      color: #E0E0E0;
      font-size: 1.1rem;
    }

    .loading-rutina {
      text-align: center;
      padding: 40px;
      background-color: #1E1E1E;
      border-radius: 12px;
      margin: 30px 0;
      border: 1px solid rgba(0, 255, 0, 0.1);
      font-size: 1.2rem;
    }

    .loading-steps {
      margin: 30px 0;
      text-align: left;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .loading-step {
      margin: 15px 0;
      padding: 10px 20px;
      background-color: rgba(0, 255, 0, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 255, 0, 0.1);
      animation: fadeIn 0.5s ease-in-out;
    }

    .loading-step:nth-child(1) { animation-delay: 0s; }
    .loading-step:nth-child(2) { animation-delay: 0.5s; }
    .loading-step:nth-child(3) { animation-delay: 1s; }

    .error-message {
      color: #FF3B30;
      margin: 20px 0;
    }

    .btn-retry {
      background-color: #00FF00;
      color: #000000;
      margin-top: 20px;
    }

    .loading-text {
      color: #888;
      font-size: 1rem;
      margin-top: 15px;
    }

    .formulario-pendiente {
      background-color: #1E1E1E;
      padding: 35px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
      border: 1px solid rgba(255, 59, 48, 0.2);
      font-size: 1.2rem;
    }

    button {
      padding: 15px 40px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 200px;
    }

    .btn-completar {
      background-color: #00FF00;
      color: #000000;
    }

    .btn-completar:hover {
      background-color: #00CC00;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 255, 0, 0.2);
    }

    .btn-logout {
      background-color: #FF3B30;
      color: white;
      margin-top: 30px;
    }

    .btn-logout:hover {
      background-color: #FF1A1A;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 59, 48, 0.2);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .loading-rutina p {
      animation: pulse 2s infinite;
    }

    .tabla-rutina {
      width: 100%;
      max-width: 1100px;
      margin: 40px auto 30px auto;
      background: #1E1E1E;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      color: #fff;
      font-size: 1.1rem;
      background: transparent;
    }

    th, td {
      border: 1px solid #00FF00;
      padding: 18px 12px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #121212;
      color: #00FF00;
      font-size: 1.25rem;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    tr:nth-child(even) td {
      background: #232323;
    }

    ul {
      margin: 0;
      padding-left: 18px;
    }

    li {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    b {
      color: #00FF00;
    }

    i {
      color: #b2ffb2;
      font-size: 0.98em;
    }

    @media (max-width: 800px) {
      .tabla-rutina, table, th, td {
        font-size: 0.95rem;
        padding: 10px 4px;
      }
      .tabla-rutina {
        padding: 10px 2px;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  displayName: string = 'Usuario';
  rutina: string | null = null;
  formularioCompletado: boolean = false;
  generandoRutina: boolean = false;
  errorGeneracion: string | null = null;
  rutinaEstructurada: any[] = [];
  completedDays: { [key: string]: boolean } = {};
  currentUserUid: string | null = null;

  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private geminiService: GeminiService,
    private firestore: Firestore
  ) {}
  

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(async (user: User | null) => {
      if (user) {
        this.currentUserUid = user.uid;
        console.log('Usuario autenticado:', this.currentUserUid);
        try {
          const userData = await this.obtenerDatosUsuario(user.uid);
          console.log('Datos del usuario desde Firestore:', userData);

          // Establecer nombre para mostrar
          if (userData?.nombre && userData?.apellido) {
            this.displayName = `${userData.nombre} ${userData.apellido}`;
          } else if (user.displayName) {
            this.displayName = user.displayName;
          } else {
            this.displayName = user.email || 'Usuario';
          }

          // Verificar si el formulario fue completado
          this.formularioCompletado = !!(userData?.edad && userData?.altura && userData?.peso && userData?.sexo && userData?.nivel);
          console.log('Formulario completado:', this.formularioCompletado, 'Datos:', userData);

          // Cargar días completados desde Firestore
          this.completedDays = userData?.completedDays || {};

          // Verificar si existe una rutina generada
          this.rutina = userData?.rutina || null;
          this.rutinaEstructurada = [];
          if (this.rutina) {
            if (typeof this.rutina === 'object') {
              this.rutinaEstructurada = (this.rutina as any).rutina_semanal || this.rutina;
            } else {
              try {
                const rutinaObj = JSON.parse(this.rutina);
                this.rutinaEstructurada = (rutinaObj as any).rutina_semanal || rutinaObj;
              } catch {
                this.rutinaEstructurada = [];
              }
            }
          }

          // Generar rutina si es necesario
          if (!this.rutina && this.formularioCompletado) {
            try {
              console.log('Iniciando generación de rutina...');
              this.generandoRutina = true;
              this.errorGeneracion = null;
              
              const model = 'gemini-2.0-flash';
              const rutinaGenerada = await this.geminiService.generarRutina(userData);
              console.log('Rutina generada exitosamente');
              
              const userDocRef = doc(this.firestore, 'usuarios', user.uid);
              await updateDoc(userDocRef, { rutina: rutinaGenerada });
              console.log('Rutina guardada en Firestore');
              
              this.rutina = rutinaGenerada;
              this.generandoRutina = false;
            } catch (error) {
              console.error('Error generando rutina:', error);
              this.errorGeneracion = 'Hubo un error al generar la rutina. Por favor, intenta nuevamente.';
              this.generandoRutina = false;
            }
          }

        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          this.displayName = user.email || 'Usuario';
        }
      } else {
        this.currentUserUid = null;
        console.log('No hay usuario autenticado');
        this.displayName = 'Usuario';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Sesión cerrada');
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  async obtenerDatosUsuario(uid: string): Promise<any> {
    const userDocRef = doc(this.firestore, 'usuarios', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('Datos del usuario no encontrados');
    }
  }

  // Método para actualizar los días completados y guardarlos en Firestore
  async updateCompletedDays(updatedDays: { [key: string]: boolean }): Promise<void> {
    this.completedDays = updatedDays;
    // Usar el UID almacenado
    if (this.currentUserUid) {
      const userDocRef = doc(this.firestore, 'usuarios', this.currentUserUid);
      try {
        await updateDoc(userDocRef, { completedDays: this.completedDays });
        console.log('Días completados guardados en Firestore');
      } catch (error) {
        console.error('Error al guardar días completados:', error);
      }
    }
  }
}
