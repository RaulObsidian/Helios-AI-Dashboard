// src/components/charts/LightweightChartAdapter.tsx
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp, PriceLineOptions, IPriceLine, SeriesMarker } from 'lightweight-charts';
import type { OHLCData } from '../../types';

// --- Tipos de Eventos ---
export interface TradeMarkerEvent {
    trade_id: string;
    timestamp: number;
    side: 'BUY' | 'SELL';
    price: number;
}

export interface AISignalEvent {
    signal_id: string;
    timestamp: number;
    signal_type: string;
}

// --- Props e Handle ---
interface ChartAdapterProps {
    initialData: OHLCData[];
}

export interface ChartAdapterHandle {
    addTradeMarker: (trade: TradeMarkerEvent) => void;
    visualizeAISignal: (signal: AISignalEvent) => void;
    manageAIStructureLine: (id: string, options: PriceLineOptions, action: 'CREATE' | 'REMOVE') => void;
    clearDrawings: () => void;
}

const LightweightChartAdapter = forwardRef<ChartAdapterHandle, ChartAdapterProps>(({ initialData }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const markersRef = useRef<SeriesMarker<any>[]>([]);
    const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map());

    // --- Efecto de Inicialización ---
    useEffect(() => {
        if (!chartContainerRef.current) return;
        const container = chartContainerRef.current;

        const chart = createChart(container, {
            layout: { background: { color: '#111827' }, textColor: 'rgba(255, 255, 255, 0.9)' },
            grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#34D399', downColor: '#F87171', borderDownColor: '#F87171',
            borderUpColor: '#34D399', wickDownColor: '#F87171', wickUpColor: '#34D399',
        });
        seriesRef.current = candlestickSeries;

        const formattedData = initialData.map(d => ({
            time: d.time as UTCTimestamp, open: d.open, high: d.high, low: d.low, close: d.close,
        }));
        candlestickSeries.setData(formattedData);

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !entries[0].target) return;
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                chart.applyOptions({ width, height });
            }
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [initialData]);

    // --- Métodos Expuestos ---
    useImperativeHandle(ref, () => ({
        addTradeMarker(trade: TradeMarkerEvent) {
            if (!seriesRef.current) return;
            const isBuy = trade.side === 'BUY';
            const newMarker: SeriesMarker<any> = {
                time: trade.timestamp as UTCTimestamp,
                position: isBuy ? 'belowBar' : 'aboveBar',
                color: isBuy ? '#00ff84' : '#ff4976',
                shape: isBuy ? 'arrowUp' : 'arrowDown',
                text: `${trade.side} @ ${trade.price.toFixed(4)}`,
                size: 1.5,
                id: trade.trade_id,
            };
            markersRef.current = [...markersRef.current.filter(m => m.id !== newMarker.id), newMarker]
                .sort((a, b) => (a.time as number) - (b.time as number));
            seriesRef.current.setMarkers(markersRef.current);
        },
        visualizeAISignal(signal: AISignalEvent) {
            if (!seriesRef.current) return;
            const newMarker: SeriesMarker<any> = {
                time: signal.timestamp as UTCTimestamp,
                position: 'inBar',
                color: '#007acc',
                shape: 'circle',
                text: `AI: ${signal.signal_type}`,
                size: 0.8,
                id: signal.signal_id,
            };
            markersRef.current = [...markersRef.current.filter(m => m.id !== newMarker.id), newMarker]
                .sort((a, b) => (a.time as number) - (b.time as number));
            seriesRef.current.setMarkers(markersRef.current);
        },
        manageAIStructureLine(id: string, options: PriceLineOptions, action: 'CREATE' | 'REMOVE') {
            if (!seriesRef.current) return;
            if (action === 'CREATE') {
                if (priceLinesRef.current.has(id)) return;
                const line = seriesRef.current.createPriceLine(options);
                priceLinesRef.current.set(id, line);
            } else if (action === 'REMOVE') {
                const line = priceLinesRef.current.get(id);
                if (line) {
                    seriesRef.current.removePriceLine(line);
                    priceLinesRef.current.delete(id);
                }
            }
        },
        clearDrawings() {
            if (seriesRef.current) {
                seriesRef.current.setMarkers([]);
                markersRef.current = [];
                priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
                priceLinesRef.current.clear();
            }
        }
    }));

    return <div ref={chartContainerRef} style={{ minHeight: '500px', border: '2px solid red' }} />;
});

export default LightweightChartAdapter;
