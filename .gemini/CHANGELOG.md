# Changelog / Puntos de Restauración - Helios AI Dashboard

Este archivo documenta los avances significativos y sirve como punto de restauración para el proyecto.

---

## v0.4.0-beta - (4 de septiembre de 2025)

**Estado:** Estable.

### Cambios y Logros:
- **Chat de Helios AI Funcional:** Se ha depurado y solucionado por completo la funcionalidad del chat con el asistente de IA.
  - Se reemplazó la librería de `OpenAI` por la de `Google GenAI` para compatibilidad con la API Key.
  - Se corrigieron errores de inicialización del modelo y se actualizó al modelo `gemini-1.5-flash`.
  - Se refactorizó el código para eliminar dependencias innecesarias de LangChain, usando la librería oficial de Google para mayor estabilidad.
- **Preparado para el Futuro:**
  - El nombre del modelo de IA se ha externalizado al archivo de configuración `server/.env` (`LLM_MODEL_NAME`), permitiendo futuras actualizaciones sin modificar el código.
  - Se ha limpiado el código de los `console.log` de depuración.
- **Interfaz de Configuración:** Se verificó que la página de `Settings` permite guardar correctamente la API Key del LLM, que se encripta y almacena de forma segura.

---

## v0.3.6-beta - (28 de agosto de 2025)

**Estado:** Estable.

### Cambios y Logros:
- **Idioma Añadido:** Se ha creado y traducido completamente el fichero de idioma para **Ruso (`ru`)**.