import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.claveApiGoogle);
  }

  async generarRutina(datosUsuario: any): Promise<any> {
    const prompt = `
    Soy un entrenador personal. Basándome en estos datos:
    - Edad: ${datosUsuario.edad}
    - Sexo: ${datosUsuario.sexo}
    - Peso: ${datosUsuario.peso} kg
    - Altura: ${datosUsuario.altura} cm
    - Nivel: ${datosUsuario.nivel}
    - Enfermedades o condiciones médicas: ${datosUsuario.enfermedades || 'ninguna'}
    - Frecuencia semanal de entrenamiento: ${datosUsuario.frecuencia} días
    - Objetivo principal: ${datosUsuario.objetivo}
    - Restricciones físicas o lesiones: ${datosUsuario.restricciones || 'ninguna'}
    - Equipamiento disponible: ${(datosUsuario.equipamiento && datosUsuario.equipamiento.length > 0) ? datosUsuario.equipamiento.join(', ') : 'ninguno'}

    Crea una rutina semanal personalizada con enfoque en salud, fuerza y bienestar general. Sé claro, breve y adecuado para su nivel, enfermedades, restricciones y equipamiento.

    Devuélveme la rutina en formato JSON, con un array de días y para cada día un array de ejercicios.
    `;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rutinaLimpia = response.text()
      .replace(/```json|```/g, '')
      .replace(/^[^{]*({.*})[^}]*$/s, '$1');
    let rutinaJson = {};
    try {
      rutinaJson = JSON.parse(rutinaLimpia);
    } catch (e) {
      // Manejar error de parseo
    }
    return rutinaJson; // Devuelve el objeto, no el texto
  }
}
