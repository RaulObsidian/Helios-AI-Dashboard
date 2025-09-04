// server/HeliosAssistant.js
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Usamos la librería oficial de Google
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'helios_vector_db');

export class HeliosAssistant {
    constructor() {
        this.model = null;
        this.vectorStore = null;
        this.apiKey = null;
    }

    async initialize(apiKey) {
        this.apiKey = apiKey;
        try {
            console.log("Inicializando Asistente Helios...");
            const embeddings = new HuggingFaceTransformersEmbeddings({
                model: 'Xenova/all-MiniLM-L6-v2'
            });

            this.vectorStore = await FaissStore.load(DB_PATH, embeddings);
            console.log("Base de datos vectorial FAISS cargada.");

            if (!this.apiKey) {
                console.log("Asistente Helios inicializado en modo placeholder (sin API Key).");
                return;
            }

            const modelName = process.env.LLM_MODEL_NAME || "gemini-1.5-flash"; // Fallback por si no está en .env
            console.log(`Intentando inicializar Google GenAI con el modelo: ${modelName}...`);
            const genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = genAI.getGenerativeModel({ model: modelName });
            console.log("Modelo Google GenAI creado. Asistente Helios inicializado correctamente.");

        } catch (error) {
            console.error("Error al inicializar HeliosAssistant:", error);
            this.model = null; // Asegurarse de que el modelo es nulo si falla
        }
    }

    async ask(query, appState = {}) {
        if (!this.model || !this.vectorStore) {
            return "Helios Assistant está activo, pero el motor LLM no está configurado. Por favor, añade tu API Key en la configuración.";
        }

        try {
            // 1. Buscar documentos relevantes en la base de datos vectorial
            const relevantDocs = await this.vectorStore.similaritySearch(query, 4);
            const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

            // 2. Construir el prompt mejorado
            const prompt = `
                Eres Helios AI, un asistente experto en la criptomoneda ScPrime (SCP). Tu conocimiento se basa en la documentación proporcionada. Sé conciso y preciso.
                
                Aquí tienes información relevante de la base de conocimiento para responder la pregunta:
                ---
                ${context}
                ---

                Aquí tienes contexto adicional sobre el estado actual de la aplicación del usuario, si es relevante:
                ---
                ${JSON.stringify(appState, null, 2)}
                ---
                
                Pregunta del Usuario: "${query}"

                Respuesta:
            `;

            // 3. Llamar al modelo de Google
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text;

        } catch (error) {
            console.error("Error al procesar la pregunta del asistente:", error);
            return "Hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.";
        }
    }
}

