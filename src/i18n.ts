import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

// Lista de idiomas soportados
export const supportedLngs = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano', // <-- AÑADIDO
  'zh-CN': '简体中文',
  pt: 'Português',
  ja: '日本語',
  ru: 'Русский',
};

i18n
  .use(HttpApi) // Carga traducciones desde el servidor (carpeta /public/locales)
  .use(initReactI18next) // Pasa la instancia de i18n a react-i18next
  .init({
    lng: 'en', // Idioma por defecto
    fallbackLng: 'en', // Idioma de respaldo si una traducción falta
    supportedLngs: Object.keys(supportedLngs),
    
    // Opciones del backend
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`, // Ruta a los archivos de traducción
      // Añade parámetros a la URL para evitar problemas de caché del navegador
      // durante el desarrollo.
      queryStringParams: { v: new Date().getTime() },
    },

    interpolation: {
      escapeValue: false, // React ya se encarga de escapar los valores
    },
  });

export default i18n;