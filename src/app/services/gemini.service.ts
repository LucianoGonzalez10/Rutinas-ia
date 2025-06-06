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
    console.log('Generando rutina con datos:', datosUsuario);
    const prompt = `
    Soy un entrenador personal. Basándome en estos datos:
    - Edad: ${datosUsuario.edad}
    - Sexo: ${datosUsuario.genero}
    - Peso: ${datosUsuario.peso} kg
    - Altura: ${datosUsuario.altura} cm
    - Nivel: ${datosUsuario.nivelActividad}
    - Enfermedades o condiciones médicas: ${datosUsuario.enfermedades || 'ninguna'}
    - Frecuencia semanal de entrenamiento: ${datosUsuario.diasEntrenamiento} días
    - Objetivo principal: ${datosUsuario.objetivo}
    - Restricciones físicas o lesiones: ${datosUsuario.lesiones || 'ninguna'}
    - Ubicación de entrenamiento: ${datosUsuario.ubicacion}
    - Equipamiento disponible: ${datosUsuario.equipamiento || 'ninguno'}

    Crea una rutina semanal personalizada con enfoque en salud, fuerza y bienestar general. Sé claro, breve y adecuado para su nivel, enfermedades, restricciones y equipamiento.
    
    ${datosUsuario.ubicacion === 'Casa' ? 'Prioriza ejercicios que se puedan realizar en casa con el equipamiento disponible.' : 'Incluye ejercicios que aprovechen el equipamiento del gimnasio.'}

    IMPORTANTE: La rutina debe tener exactamente ${datosUsuario.diasEntrenamiento} días de entrenamiento por semana.

    IMPORTANTE: Devuelve SOLO el JSON, sin ningún texto adicional antes o después. El JSON debe tener este formato exacto:
    {
      "rutina_semanal": [
        {
          "dia": "Lunes",
          "enfoque": "Fuerza superior",
          "ejercicios": [
            {
              "nombre": "Flexiones",
              "series": 3,
              "repeticiones": 12,
              "descanso": "90 segundos",
              "notas": "Mantener la espalda recta"
            }
          ]
        }
      ]
    }
    `;

    console.log('Enviando prompt a Gemini:', prompt);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    console.log('Respuesta raw de Gemini:', responseText);
    
    // Limpiar la respuesta
    let rutinaLimpia = responseText
      .replace(/```json|```/g, '') // Eliminar marcadores de código
      .replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1') // Extraer solo el JSON
      .trim(); // Eliminar espacios en blanco
    
    console.log('Rutina limpia:', rutinaLimpia);
    
    try {
      // Intentar parsear el JSON
      const rutinaJson = JSON.parse(rutinaLimpia);
      console.log('Rutina parseada:', rutinaJson);

      // Validar la estructura
      if (!rutinaJson.rutina_semanal || !Array.isArray(rutinaJson.rutina_semanal)) {
        throw new Error('La respuesta no tiene el formato esperado');
      }

      // Validar que tenga el número correcto de días
      if (rutinaJson.rutina_semanal.length !== datosUsuario.diasEntrenamiento) {
        throw new Error(`La rutina debe tener ${datosUsuario.diasEntrenamiento} días`);
      }

      return rutinaJson;
    } catch (e: any) {
      console.error('Error al procesar la rutina:', e);
      console.error('Contenido que causó el error:', rutinaLimpia);
      throw new Error('Error al procesar la respuesta de la IA: ' + e.message);
    }
  }
}
