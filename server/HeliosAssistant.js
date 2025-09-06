// server/HeliosAssistant.js
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Usamos la librería oficial de Google
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'helios_vector_db');

export class HeliosAssistant {
    constructor() {
        this.vectorStore = null;
        this.llmChain = null;
        this.apiKey = null;
    }

    async initialize(apiKey = null) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            console.warn("HeliosAssistant: OPENAI_API_KEY not found. Assistant will not be functional.");
            return;
        }

        try {
            const directory = path.resolve(__dirname, 'helios_vector_db');
            const embeddings = new OpenAIEmbeddings({ openAIApiKey: this.apiKey });
            this.vectorStore = await FaissStore.load(directory, embeddings);

            const model = new ChatOpenAI({ openAIApiKey: this.apiKey, temperature: 0.2 });
            const template = `Eres HeliosAI, un asistente experto en la red ScPrime y análisis de datos de almacenamiento descentralizado. Tu objetivo es ayudar al usuario a entender el estado de su nodo, el mercado y tomar decisiones informadas. Sé conciso y preciso.
            Contexto relevante: {context}
            Pregunta del usuario: {question}
            Respuesta de HeliosAI:`;
            const prompt = new PromptTemplate({ template, inputVariables: ["context", "question"] });

            this.llmChain = new LLMChain({ llm: model, prompt });
            console.log("HeliosAssistant initialized successfully.");

        } catch (error) {
            console.error("Failed to initialize HeliosAssistant:", error);
            this.vectorStore = null;
            this.llmChain = null;
        }
    }

    async ask(query, context = {}) {
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

