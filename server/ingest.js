// server/ingest.js
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import path from 'path';

const DOCS_PATH = path.resolve(process.cwd(), '../Implementaciones');
const DB_PATH = path.resolve(process.cwd(), 'helios_vector_db');

async function ingestDocumentation() {
    console.log("Iniciando Ingesta de Conocimiento RAG con FAISS...");

    try {
        // 1. Cargar documentos
        const loader = new DirectoryLoader(
            DOCS_PATH,
            { ".md": (path) => new TextLoader(path) }
        );
        const docs = await loader.load();
        if (docs.length === 0) {
            console.log("No se encontraron documentos. Saliendo.");
            return;
        }
        console.log(`${docs.length} documentos cargados.`);

        // 2. Dividir en fragmentos
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
        const splits = await textSplitter.splitDocuments(docs);
        console.log(`${splits.length} fragmentos creados.`);

        // 3. Definir modelo de Embeddings
        const embeddings = new HuggingFaceTransformersEmbeddings({
            model: 'Xenova/all-MiniLM-L6-v2'
        });
        console.log("Modelo de embeddings cargado.");

        // 4. Crear y guardar la Vector DB con FAISS
        console.log("Creando base de datos vectorial FAISS...");
        const vectorStore = await FaissStore.fromDocuments(splits, embeddings);
        await vectorStore.save(DB_PATH);
        
        console.log(`Vector DB FAISS creada y guardada en ${DB_PATH}. ${splits.length} fragmentos indexados.`);

    } catch (error) {
        console.error("Error durante la ingesta de conocimiento:", error);
    }
}

ingestDocumentation();