import React, { useState, useRef, useEffect } from 'react';
import type { OHLCData, ChartConfig, IndicatorInstance, ChartAppearance, ChartIndicator } from '../types';

import { CogIcon, XCircleIcon } from './icons';

type Translator = (key: string, options?: { [key: string]: string }) => string;

// Type guard to check if a setting is valid
function isValidSetting(setting: unknown): setting is { name: string; type: string } {
    return (
        typeof setting === 'object' &&
        setting !== null &&
        'name' in setting &&
        typeof (setting as any).name === 'string' &&
        'type' in setting &&
        typeof (setting as any).type === 'string'
    );
}

// --- Indicator Definitions & Calculations ---
const INDICATORS: Record<string, ChartIndicator> = {
    EMA: {
        name: 'chart.indicator.ema', type: 'EMA', pane: 'price',
        settings: {
            period: { name: 'chart.indicator.settings.period', type: 'number', defaultValue: 20 },
            color: { name: 'chart.indicator.settings.color', type: 'color', defaultValue: '#f6ad55' },
        },
        calculate: (data: OHLCData[], settings: { [key: string]: any }) => {
            const { period } = settings;
            if (!period || data.length < period) return [];
            const k = 2 / (period + 1);
            
            if (data.length > 0) {
                 // Start with the first close price
                let currentEma = data.slice(0, period).reduce((sum: number, d: OHLCData) => sum + d.close, 0) / period;
                
                const result = data.map((d: OHLCData) => ({time: d.time, value: 0}));
                
                for (let i = 0; i < data.length; i++) {
                    if (i < period -1) {
                        // Not enough data yet
                    } else if (i === period -1) {
                        result[i] = {time: data[i].time, value: currentEma};
                    }
                    else {
                        currentEma = (data[i].close * k) + (currentEma * (1 - k));
                        result[i] = {time: data[i].time, value: currentEma};
                    }
                }
                return result.slice(period-1);
            }
            return [];
        },
    },
    VOLUME: {
        name: 'chart.indicator.volume', type: 'VOLUME', pane: 'indicator',
        settings: {
             upColor: { name: 'chart.indicator.settings.upColor', type: 'color', defaultValue: 'rgba(72, 187, 120, 0.5)' },
             downColor: { name: 'chart.indicator.settings.downColor', type: 'color', defaultValue: 'rgba(245, 101, 101, 0.5)' }
        },
        calculate: (data: OHLCData[], settings: { [key: string]: any }) => data.map(d => ({ time: d.time, value: d.volume, isUp: d.close >= d.open, color: d.close >= d.open ? settings.upColor : settings.downColor })),
    },
     RSI: {
        name: 'chart.indicator.rsi', type: 'RSI', pane: 'indicator',
        settings: {
            period: { name: 'chart.indicator.settings.period', type: 'number', defaultValue: 14 },
            color: { name: 'chart.indicator.settings.color', type: 'color', defaultValue: '#c084fc' },
        },
        calculate: (data: OHLCData[], settings: { [key: string]: any }) => {
             const { period } = settings;
             if (!period || data.length < period) return [];
             let rsiArray: any[] = [];
             let gains: number[] = [];
             let losses: number[] = [];

             for (let i = 1; i < data.length; i++) {
                 const change = data[i].close - data[i - 1].close;
                 gains.push(change > 0 ? change : 0);
                 losses.push(change < 0 ? -change : 0);
             }

             const sma = (arr: number[], len: number) => arr.slice(0, len).reduce((a, b) => a + b, 0) / len;
             let avgGain = sma(gains, period);
             let avgLoss = sma(losses, period);
             if (avgLoss === 0) avgLoss = 0.00001; // prevent division by zero

             const firstRsi = 100 - (100 / (1 + (avgGain / avgLoss)));
             rsiArray.push({ time: data[period].time, value: firstRsi });
             
             for (let i = period; i < gains.length; i++) {
                 avgGain = (avgGain * (period - 1) + gains[i]) / period;
                 avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
                 if (avgLoss === 0) avgLoss = 0.00001;
                 const rs = avgGain / avgLoss;
                 const rsi = 100 - (100 / (1 + rs));
                 rsiArray.push({ time: data[i + 1].time, value: rsi });
             }

             return rsiArray;
        },
    },
    MACD: {
        name: 'chart.indicator.macd', type: 'MACD', pane: 'indicator',
        settings: {
            fast: { name: 'chart.indicator.settings.fast', type: 'number', defaultValue: 12 },
            slow: { name: 'chart.indicator.settings.slow', type: 'number', defaultValue: 26 },
            signal: { name: 'chart.indicator.settings.signal', type: 'number', defaultValue: 9 },
        },
        calculate: (data: OHLCData[], settings: { [key: string]: any }) => {
            const { fast, slow, signal } = settings;
            if(data.length < slow) return [];

            const ema = (source: number[], period: number) => {
                 const k = 2 / (period + 1);
                 let emaArray: number[] = [source[0]];
                 for (let i = 1; i < source.length; i++) {
                     emaArray.push((source[i] * k) + (emaArray[i - 1] * (1 - k)));
                 }
                 return emaArray;
            };
            
            const closePrices = data.map((d: OHLCData) => d.close);
            const emaFast = ema(closePrices, fast);
            const emaSlow = ema(closePrices, slow);

            const macdLine = data.map((_d: OHLCData, i: number) => (emaFast[i] - emaSlow[i]));
            const signalLine = ema(macdLine, signal);

            return data.map((d: OHLCData, i: number) => ({ 
                time: d.time, 
                macd: macdLine[i], 
                signal: signalLine[i], 
                histogram: macdLine[i] - signalLine[i]
            }));
        }
    }
};

// --- Helper Functions ---
const calculateTicks = (min: number, max: number, tickCount: number) => {
    if (min === max || !Number.isFinite(min) || !Number.isFinite(max)) return [min || 0];
    const range = max - min;
    const step = range / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => min + i * step);
};

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; controls?: React.ReactNode; className?: string }> = ({ title, children, controls, className }) => (
    <div className={`bg-helios-gray rounded-lg shadow-lg p-4 flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-2 px-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-200">{title}</h3>
            {controls}
        </div>
        <div className="flex-grow w-full h-full min-h-0 relative">
            {children}
        </div>
    </div>
);


// --- Modals for Advanced Chart ---
const IndicatorModal: React.FC<{ isOpen: boolean; onAdd: (type: string) => void; t: Translator }> = ({ isOpen, onAdd, t }) => {
    if(!isOpen) return null;
    return (
        <div className="absolute top-12 left-0 bg-helios-gray border border-helios-light-gray rounded-md shadow-lg z-20 p-2">
            <h4 className="font-bold mb-2 px-2">{t('chart.controls.indicators.title')}</h4>
            <ul className="text-sm">
                {Object.values(INDICATORS).map(ind => (
                    <li key={ind.type as React.Key} onClick={() => onAdd(ind.type as string)} className="px-2 py-1 hover:bg-helios-light-gray rounded cursor-pointer">
                        {t(ind.name as string)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const IndicatorConfigModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (settings: any) => void; indicatorType: string; initialSettings: any; t: Translator }> = ({ isOpen, onClose, onSave, indicatorType, initialSettings, t }) => {
    if (!isOpen) return null;
    const indicator = INDICATORS[indicatorType];
    const [settings, setSettings] = useState(initialSettings);

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-helios-gray rounded-lg shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <h3 className="text-lg font-bold mb-4">{t(indicator.name as string)} {t('chart.indicator.settings.title')}</h3>
                 <div className="space-y-4">
                     {Object.entries(indicator.settings || {}).map(([key, setting]) => {
                        if (!isValidSetting(setting)) return null; // Type guard in action
                        return (
                            <div key={key}>
                                <label className="text-sm text-gray-400">{t(setting.name)}</label>
                                <input
                                    type={setting.type}
                                    value={settings[key] as string}
                                    onChange={e => setSettings((s: any) => ({ ...s, [key]: setting.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                                    className="mt-1 block w-full bg-helios-light-gray border border-gray-600 rounded-md py-1 px-2 text-sm"
                                />
                            </div>
                        );
                     })}
                 </div>
                 <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-1 text-sm rounded bg-helios-light-gray hover:bg-gray-600">{t('chart.controls.common.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-1 text-sm rounded bg-helios-accent hover:bg-blue-500 text-white">{t('chart.controls.common.save')}</button>
                 </div>
            </div>
        </div>
    );
};

const ChartAppearanceModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (settings: ChartAppearance) => void; settings: ChartAppearance; t: Translator }> = ({ isOpen, onClose, onSave, settings: initialSettings, t }) => {
    if (!isOpen) return null;
    const [settings, setSettings] = useState(initialSettings);
    
    const SettingRow = ({ labelKey, value, onChange }: { labelKey: string, value: string, onChange: (val: string) => void }) => (
        <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">{t(labelKey)}</label>
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="bg-transparent" />
        </div>
    );

    return (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-helios-gray rounded-lg shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{t('chart.settings.title')}</h3>
                <div className="space-y-3">
                    <SettingRow labelKey="chart.settings.background" value={settings.background} onChange={v => setSettings(s => ({...s, background: v}))}/>
                    <SettingRow labelKey="chart.settings.grid" value={settings.grid} onChange={v => setSettings(s => ({...s, grid: v}))}/>
                    <SettingRow labelKey="chart.settings.upCandle" value={settings.upCandle} onChange={v => setSettings(s => ({...s, upCandle: v}))}/>
                    <SettingRow labelKey="chart.settings.downCandle" value={settings.downCandle} onChange={v => setSettings(s => ({...s, downCandle: v}))}/>
                    <SettingRow labelKey="chart.settings.wick" value={settings.wick} onChange={v => setSettings(s => ({...s, wick: v}))}/>
                </div>
                 <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-1 text-sm rounded bg-helios-light-gray hover:bg-gray-600">{t('chart.controls.common.cancel')}</button>
                    <button onClick={() => onSave(settings)} className="px-4 py-1 text-sm rounded bg-helios-accent hover:bg-blue-500 text-white">{t('chart.controls.common.save')}</button>
                 </div>
            </div>
         </div>
    );
};

// --- Advanced Trading Chart ---
export const AdvancedTradingChart: React.FC<{ 
    ohlcData: OHLCData[]; 
    config: ChartConfig;
    setConfig: (config: ChartConfig) => void;
    className?: string; 
    t: Translator; 
    conversionRate: number; 
    currency: string; 
    language: string; 
}> = ({ ohlcData, config, setConfig, className, t, conversionRate, currency, language }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [configIndicator, setConfigIndicator] = useState<IndicatorInstance | null>(null);

    const handleAddIndicator = (type: string) => {
        setIsIndicatorModalOpen(false);
        const indicator = INDICATORS[type];
        const newInstance: IndicatorInstance = {
            id: `${type}-${Date.now()}`,
            type: type,
            settings: Object.fromEntries(Object.entries(indicator.settings || {}).map(([key, val]) => [key, (val as any).defaultValue]))
        };
        setConfigIndicator(newInstance);
    };

    const handleSaveIndicatorConfig = (newSettings: any) => {
        if (!configIndicator) return;
        const existingIndex = config.indicators.findIndex(i => i.id === configIndicator.id);
        if (existingIndex > -1) {
            const newIndicators = [...config.indicators];
            newIndicators[existingIndex] = { ...configIndicator, settings: newSettings };
            setConfig({ ...config, indicators: newIndicators });
        } else {
            setConfig({ ...config, indicators: [...config.indicators, { ...configIndicator, settings: newSettings }] });
        }
        setConfigIndicator(null);
    };
    
    const handleRemoveIndicator = (id: string) => {
        setConfig({...config, indicators: config.indicators.filter(i => i.id !== id)});
    }
    
    const handleSaveAppearance = (newAppearance: ChartAppearance) => {
        setConfig({...config, appearance: newAppearance});
        setIsSettingsModalOpen(false);
    }
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !ohlcData || ohlcData.length === 0 || dimensions.width === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);
        const { width, height } = dimensions;

        // --- Configuration ---
        const margin = { top: 10, right: 60, bottom: 25, left: 10 };
        const indicatorPanes = config.indicators.filter(inst => INDICATORS[inst.type].pane === 'indicator');
        const pricePaneHeight = height * (1 - indicatorPanes.length * 0.2) - margin.top - margin.bottom;
        const indicatorPaneHeight = height * 0.2 - 20;

        const prices = ohlcData.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices) * 0.99;
        const maxPrice = Math.max(...prices) * 1.01;
        
        const candleWidth = (width - margin.left - margin.right) / (ohlcData.length + 2); // add padding
        const candleSpacing = candleWidth * 0.2;

        const priceFormatter = new Intl.NumberFormat(language, { style: 'currency', currency: currency, minimumFractionDigits: 4 });
        const timeFormatter = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' });

        // --- Scaling Functions ---
        const xScale = (index: number) => margin.left + (index + 1.5) * candleWidth;
        const yScalePrice = (price: number) => margin.top + ((maxPrice - price) / (maxPrice - minPrice)) * pricePaneHeight;

        // --- Drawing ---
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = config.appearance.background;
        ctx.fillRect(0, 0, width, height);
        
        // --- Draw Price Pane ---
        // Grid
        const yTicks = calculateTicks(minPrice, maxPrice, 6);
        yTicks.forEach((tick: number) => {
            const y = yScalePrice(tick);
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.strokeStyle = config.appearance.grid;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.fillStyle = '#9ca3af';
            ctx.font = '10px sans-serif';
            ctx.fillText(priceFormatter.format(tick * conversionRate), width - margin.right + 5, y + 3);
        });
        
        // Time Axis
        const xTickCount = Math.floor((width - margin.left - margin.right) / 100);
        const xTickIndices = calculateTicks(0, ohlcData.length-1, xTickCount).map(Math.floor);
        xTickIndices.forEach((index: number) => {
            const x = xScale(index);
            const time = ohlcData[index]?.time;
            if (time) {
                 ctx.fillStyle = '#9ca3af';
                 ctx.font = '10px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.fillText(timeFormatter.format(new Date(time)), x, height - 10);
            }
        });

        // Candles
        ohlcData.forEach((d: OHLCData, i: number) => {
            const x = xScale(i);
            const yOpen = yScalePrice(d.open);
            const yClose = yScalePrice(d.close);
            const yHigh = yScalePrice(d.high);
            const yLow = yScalePrice(d.low);

            // Wick
            ctx.beginPath();
            ctx.moveTo(x, yHigh);
            ctx.lineTo(x, yLow);
            ctx.strokeStyle = config.appearance.wick;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Body
            const isUp = d.close >= d.open;
            ctx.fillStyle = isUp ? config.appearance.upCandle : config.appearance.downCandle;
            ctx.fillRect(x - (candleWidth - candleSpacing) / 2, Math.min(yOpen, yClose), candleWidth - candleSpacing, Math.abs(yOpen - yClose));
        });

        // --- Draw Indicators ---
        config.indicators.forEach(inst => {
            const indicator = INDICATORS[inst.type];
            const data = typeof indicator.calculate === 'function'
                ? indicator.calculate(ohlcData, inst.settings)
                : [];
            
            if (indicator.pane === 'price') { // EMA
                ctx.beginPath();
                ctx.strokeStyle = inst.settings.color as string;
                ctx.lineWidth = 1.5;
                data.forEach((point: { time: number; value: number }, i: number) => {
                    const ohlcIndex = ohlcData.findIndex(d => d.time === point.time);
                    if (ohlcIndex < 0) return;
                    
                    const x = xScale(ohlcIndex);
                    const y = yScalePrice(point.value);
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            }
        });

        // --- Draw Indicator Panes ---
        indicatorPanes.forEach((inst, paneIndex) => {
            const indicator = INDICATORS[inst.type];
            if(indicator.type === 'VOLUME') {
                const paneTop = margin.top + pricePaneHeight + 20 * (paneIndex + 1) + indicatorPaneHeight * paneIndex;
                const data = typeof indicator.calculate === 'function'
                    ? indicator.calculate(ohlcData, inst.settings)
                    : [];
                const maxVolume = Math.max(...data.map((d: { value: number }) => d.value)) * 1.1;
                const yScaleIndicator = (value: number) => paneTop + indicatorPaneHeight - (value / maxVolume) * indicatorPaneHeight;
                
                // Draw volume bars
                data.forEach((d: { value: number; color: string | CanvasGradient | CanvasPattern; }, i: number) => {
                    const x = xScale(i);
                    const y = yScaleIndicator(d.value);
                    ctx.fillStyle = d.color;
                    ctx.fillRect(x - (candleWidth - candleSpacing) / 2, y, candleWidth - candleSpacing, paneTop + indicatorPaneHeight - y);
                });
            }
        });

    }, [ohlcData, config, language, currency, conversionRate, dimensions]);
    
     useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const controls = (
        <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs">
            {['1m', '5m', '15m', '30m', '1H', '4H', '1D'].map(tf => (
                <button key={tf} onClick={() => setConfig({...config, timeframe: tf})} className={`px-2 py-1 rounded ${config.timeframe === tf ? 'bg-helios-accent text-white' : 'bg-helios-light-gray text-gray-300'}`}>
                    {tf}
                </button>
            ))}
            <div className="relative">
                 <button onClick={() => setIsIndicatorModalOpen(v => !v)} className="px-3 py-1 rounded bg-helios-light-gray text-gray-300">{t('chart.controls.indicators.title')}</button>
                 <IndicatorModal isOpen={isIndicatorModalOpen} onAdd={handleAddIndicator} t={t} />
            </div>
             <button onClick={() => setIsSettingsModalOpen(true)} className="p-1.5 rounded bg-helios-light-gray text-gray-300"><CogIcon className="w-4 h-4"/></button>
        </div>
    );
    
    return (
        <ChartContainer title={`SCP / ${currency}`} controls={controls} className={className}>
           <div ref={containerRef} className="absolute inset-0">
                <canvas ref={canvasRef} className="w-full h-full" />
           </div>
           
           <div className="absolute bottom-0 left-0 right-0 flex-shrink-0 p-2 flex items-center flex-wrap gap-2 text-xs bg-helios-gray/80 backdrop-blur-sm border-t border-helios-light-gray">
                {config.indicators.map(inst => (
                     <div key={inst.id} className="flex items-center bg-helios-light-gray rounded px-2 py-0.5">
                         <span>{t(INDICATORS[inst.type].name as string)} ({Object.values(inst.settings || {}).join(', ')})</span>
                         <button onClick={() => setConfigIndicator(inst)} className="ml-2 text-gray-400 hover:text-white"><CogIcon className="w-3 h-3"/></button>
                         <button onClick={() => handleRemoveIndicator(inst.id)} className="ml-1 text-gray-400 hover:text-helios-red"><XCircleIcon className="w-3 h-3"/></button>
                     </div>
                ))}
           </div>

           {configIndicator && (
               <IndicatorConfigModal 
                   isOpen={!!configIndicator}
                   onClose={() => setConfigIndicator(null)}
                   onSave={handleSaveIndicatorConfig}
                   indicatorType={configIndicator.type}
                   initialSettings={configIndicator.settings}
                   t={t}
               />
           )}
           <ChartAppearanceModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={handleSaveAppearance}
                settings={config.appearance}
                t={t}
           />
        </ChartContainer>
    );
};