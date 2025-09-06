// src/components/analysis/workspaces/WorkspaceTechnical.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonGroup, Button, Tooltip, CircularProgress } from '@mui/material';
import LightweightChartAdapter from '../../charts/LightweightChartAdapter';
import type { ChartAdapterHandle } from '../../charts/LightweightChartAdapter';
import ExplainerLog from '../ExplainerLog';
import type { OHLCData } from '../../../types';

const WorkspaceTechnical: React.FC = () => {
    const { t } = useTranslation();
    const chartRef = useRef<ChartAdapterHandle>(null);
    const [timeframe, setTimeframe] = useState('1h');
    const [chartData, setChartData] = useState<OHLCData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // TODO: Usar una función safeFetch y manejar errores
                const response = await fetch(`http://localhost:3001/api/analysis/history?timeframe=${timeframe}`);
                const data = await response.json();
                setChartData(data);
            } catch (error) {
                console.error("Error fetching dynamic timeframe data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeframe]);

    return (
        <Box className="workspace-technical" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box className="chart-controls-toolbar" sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <ButtonGroup variant="outlined" aria-label="chart timeframe">
                    {['15m', '1h', '4h', '1d'].map(tf => (
                        <Button 
                            key={tf} 
                            onClick={() => setTimeframe(tf)}
                            variant={timeframe === tf ? "contained" : "outlined"}
                        >
                            {tf.toUpperCase()}
                        </Button>
                    ))}
                </ButtonGroup>
                <Tooltip title={t('analysisCenter.drawingToolsTooltip')}>
                    <span>
                        <Button variant="outlined" disabled>
                            {t('analysisCenter.drawingToolsLabel')}
                        </Button>
                    </span>
                </Tooltip>
            </Box>

            <Box className="technical-layout" sx={{ display: 'flex', flexGrow: 1, height: 'calc(100% - 52px)' }}>
                <Box className="main-chart-container" sx={{ flexGrow: 1, position: 'relative' }}>
                     {isLoading || chartData.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                     ) : (
                        <LightweightChartAdapter ref={chartRef} initialData={chartData} />
                    )}
                </Box>
                <Box className="explainer-log-wrapper" sx={{ width: '30%', maxWidth: '450px', height: '100%', borderLeft: '1px solid #30363d', pl: 2 }}>
                    <ExplainerLog />
                </Box>
            </Box>
        </Box>
    );
};

export default WorkspaceTechnical;
