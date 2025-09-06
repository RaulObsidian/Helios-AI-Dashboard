¡Este es un desafío técnico importante y tienes toda la razón al exigir una solución que no tome atajos ni comprometa la calidad de Helios AI\! Usar `any` (la "solución pragmática" que intentó Gemini CLI) desactiva efectivamente TypeScript para ese objeto, lo cual es inaceptable en una aplicación de nivel institucional donde la robustez del código es primordial.

He analizado el log y el diagnóstico de Gemini CLI.

### Análisis del Problema y el Intento Fallido

El diagnóstico de Gemini CLI es correcto:

> *El error TS2339: Property 'addCandlestickSeries' does not exist on type 'IChartApi' es un error de tipos, no de lógica.*

Esto significa que la función existe en el código JavaScript de `lightweight-charts`, pero TypeScript no la "ve" en las definiciones de tipos (`.d.ts`) proporcionadas por la librería en tu entorno.

**¿Por qué falló el intento de usar `any`?**

Gemini CLI aplicó `any` a la referencia `useRef`:

```typescript
const chartRef = useRef<any>(null); // <- Aplicó 'any' aquí.
```

Pero el error ocurre en la variable local `chart` dentro del `useEffect`:

```typescript
useEffect(() => {
    // ...
    // 'chart' sigue siendo inferido como el tipo IChartApi (incompleto).
    const chart = createChart(chartContainerRef.current, chartOptions); 
    
    // El error ocurre aquí, porque 'chart' (IChartApi) no tiene el método definido.
    const candlestickSeries = chart.addCandlestickSeries({...}); 
    // ...
}, []);
```

Cambiar el tipo de `chartRef` no solucionó el problema en el punto de uso inicial.

### Solución Robusta y Profesional (Estrategia de Escalada)

Vamos a resolver esto sistemáticamente, empezando por las soluciones más simples y escalando a la solución arquitectónica definitiva solo si es necesario.

#### Paso 1: Optimización de la Configuración de TypeScript (Alta Calidad, Bajo Impacto)

Existe una configuración en `tsconfig.json` diseñada para cuando confías en una librería, pero sus definiciones de tipos internas pueden ser imperfectas o estar en conflicto con tu entorno.

**Instrucciones para Gemini CLI:** Modificar `tsconfig.json`.

1.  Abre `tsconfig.json`.
2.  Dentro de `compilerOptions`, añade o actualiza la siguiente línea:

<!-- end list -->

```json
{
  "compilerOptions": {
    // ... otras opciones ...
    "skipLibCheck": true
  }
}
```

**¿Qué hace esto?** Le dice a TypeScript que omita la verificación de tipos de los archivos de declaración de las librerías (`.d.ts` en `node_modules`). Esto a menudo resuelve estos conflictos sin sacrificar la seguridad de tipos en el código de Helios AI.

**Acción:** Intenta compilar de nuevo (`npm run build`). Si tiene éxito, hemos terminado. Si falla, continúa con el Paso 2.

#### Paso 2: Aumentación de Módulos (La Solución Arquitectónica Definitiva)

Si el Paso 1 no resuelve el problema, confirmamos que las definiciones de la librería están genuinamente incompletas para TypeScript en tu proyecto. En lugar de usar `any`, utilizaremos la técnica profesional llamada **Aumentación de Módulos (Module Augmentation)**.

Esto nos permite "extender" o "parchear" localmente las definiciones de tipos de la librería externa.

**Instrucciones para Gemini CLI:**

1.  **Revertir el Workaround (`any`):** Primero, asegúrate de que `LightweightChartAdapter.tsx` esté usando los tipos correctos y **no contenga `any`**.

<!-- end list -->

```typescript
// En LightweightChartAdapter.tsx
import { IChartApi } from 'lightweight-charts';
// ...
// Asegúrate de que esto sea IChartApi, no 'any'.
const chartRef = useRef<IChartApi | null>(null); 
// ...
```

2.  **Crear un archivo de definición de tipos local:** Crea un archivo `.d.ts` (la extensión es crucial).

<!-- end list -->

```bash
mkdir -p src/types
touch src/types/lightweight-charts-augmentation.d.ts
```

3.  **Implementar la Aumentación del Módulo:** Añade el siguiente contenido a `src/types/lightweight-charts-augmentation.d.ts`.

<!-- end list -->

```typescript
// Contenido para: src/types/lightweight-charts-augmentation.d.ts

// Importamos los tipos necesarios que el método utiliza.
// Usamos PartialOptions ya que suelen ser más seguros para aumentaciones.
import {
    ISeriesApi,
    CandlestickSeriesPartialOptions,
    HistogramSeriesPartialOptions,
    LineSeriesPartialOptions
} from 'lightweight-charts';

// Declaramos que estamos extendiendo el módulo original 'lightweight-charts'.
declare module 'lightweight-charts' {
  
  // Extendemos la interfaz IChartApi que está causando el problema.
  export interface IChartApi {
    
    // Añadimos manualmente la definición del método que falta.
    addCandlestickSeries(options?: CandlestickSeriesPartialOptions): ISeriesApi<'Candlestick'>;
    
    // Añadimos otros métodos comunes preventivamente.
    addHistogramSeries(options?: HistogramSeriesPartialOptions): ISeriesApi<'Histogram'>;
    addLineSeries(options?: LineSeriesPartialOptions): ISeriesApi<'Line'>;
  }
}
```

4.  **Verificar `tsconfig.json`:** Asegúrate de que el archivo `tsconfig.json` incluya este nuevo archivo. Generalmente lo hace si la sección `include` contiene `"src"`.

<!-- end list -->

```json
// Verificación en tsconfig.json
{
  // ...
  "include": [
    "src"
  ]
}
```

**Acción:** Intenta compilar de nuevo (`npm run build`). La Aumentación de Módulos proporciona una solución global y robusta al problema de tipos, asegurando la máxima calidad del código.