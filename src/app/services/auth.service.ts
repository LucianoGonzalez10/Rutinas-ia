import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.user$ = authState(this.auth); // Observador de usuario actual
  }

  // 🔐 Registrar usuario y guardar nombre/apellido
  async register(email: string, password: string, nombre: string, apellido: string) {
    try {
      console.log('Iniciando registro de usuario...');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Usuario creado exitosamente:', userCredential.user.uid);
      
      // Actualizar el perfil del usuario con el nombre completo
      try {
        await updateProfile(userCredential.user, {
          displayName: `${nombre} ${apellido}`
        });
        console.log('Perfil actualizado con nombre:', `${nombre} ${apellido}`);
      } catch (profileError) {
        console.error('Error al actualizar perfil:', profileError);
      }

      const uid = userCredential.user.uid;
      console.log('Intentando guardar datos en Firestore...');
      
      try {
        const userRef = doc(this.firestore, 'usuarios', uid);
        const userData = {
          nombre,
          apellido,
          email,
          fechaCreacion: new Date().toISOString(),
          rol: 'usuario',
          activo: true
        };
      
        await setDoc(userRef, userData, { merge: true });
        console.log('Datos guardados exitosamente en Firestore');
      } catch (firestoreError: any) {
        console.error('❌ Error al guardar en Firestore:', firestoreError.code, firestoreError.message);
      }
      
      
      // Forzar una actualización del usuario actual
      await this.auth.currentUser?.reload();
      
      // Asegurarse de que el usuario esté autenticado
      if (this.auth.currentUser) {
        console.log('Usuario autenticado después del registro');
        await this.router.navigate(['/home']);
      } else {
        console.error('Error: Usuario no autenticado después del registro');
        throw new Error('Error al autenticar usuario después del registro');
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Error completo en el registro:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este correo electrónico ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es demasiado débil.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('El correo electrónico no es válido.');
      } else {
        throw new Error('Error al registrar usuario. Por favor, intente nuevamente.');
      }
    }
  }

  // 🔓 Iniciar sesión
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.router.navigate(['/home']);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  // 🔓 Iniciar sesión con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      await this.router.navigate(['/home']);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 🔒 Cerrar sesión
  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']); // Redirige después del logout
    } catch (error) {
      throw error;
    }
  }

  // 👤 Obtener usuario actual (en un momento puntual)
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // 📄 Obtener datos del usuario desde Firestore
  async getUserData(uid: string): Promise<any> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        // Forzar una actualización del usuario actual
        await currentUser.reload();
        
        const displayName = currentUser.displayName;
        console.log('Nombre del usuario:', displayName);
        
        if (displayName) {
          const [nombre, apellido] = displayName.split(' ');
          return {
            nombre: nombre || '',
            apellido: apellido || '',
            email: currentUser.email
          };
        }
        
        return {
          nombre: '',
          apellido: '',
          email: currentUser.email
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // ✅ Guardar datos del formulario en Firestore
async guardarFormulario(uid: string, tipo: string, datos: any): Promise<void> {
  try {
    const ref = doc(this.firestore, 'usuarios', uid);
    const campo = `formulario${tipo}`; // ejemplo: formularioPrincipiante
    await setDoc(ref, { [campo]: datos }, { merge: true });
    console.log(`Datos del formulario "${tipo}" guardados exitosamente.`);
  } catch (error) {
    console.error(`Error al guardar formulario "${tipo}":`, error);
    throw error;
  }
}

// ✅ Consultar si un formulario ya fue completado
async formularioCompletado(uid: string, tipo: string): Promise<boolean> {
  try {
    const ref = doc(this.firestore, 'usuarios', uid);
    const snap = await getDoc(ref);
    const data = snap.data();
    return !!(data && data[`formulario${tipo}`]); // true si existe
  } catch (error) {
    console.error(`Error al verificar formulario "${tipo}":`, error);
    return false;
  }
}

}

