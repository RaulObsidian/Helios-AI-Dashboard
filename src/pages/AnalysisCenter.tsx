// src/pages/AnalysisCenter.tsx
import React, { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Typography } from '@mui/material';

// Importación Dinámica (Lazy Loading) para optimización
const WorkspaceTechnical = lazy(() => import('../components/analysis/workspaces/WorkspaceTechnical'));
// const WorkspaceOrderFlow = lazy(() => import('../components/analysis/workspaces/WorkspaceOrderFlow'));

type WorkspaceType = 'TECHNICAL' | 'ORDERFLOW' | 'MACRO' | 'FUNDAMENTALS';

const AnalysisCenter: React.FC = () => {
    const { t } = useTranslation();
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('TECHNICAL');

    const renderWorkspace = () => {
        switch (activeWorkspace) {
            case 'TECHNICAL': return <WorkspaceTechnical />;
            // case 'ORDERFLOW': return <WorkspaceOrderFlow />;
            default: return <Typography sx={{ color: 'white' }}>Workspace no implementado.</Typography>;
        }
    };

    return (
        <Box id="analytics-hub" sx={{ 
            height: 'calc(100vh - 112px)', // Altura total menos header y padding
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#1c212e', // Color de fondo del panel
            borderRadius: '8px',
            border: '1px solid #30363d'
        }}>
            <Box className="cockpit-header" sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid #30363d',
                backgroundColor: '#161b22'
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>{t('analysisCenter.cockpitTitle')}</Typography>
                
                <FormControl variant="outlined" size="small" sx={{ 
                    minWidth: 350,
                    '& .MuiInputLabel-root': { color: 'gray' },
                    '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
                        '& .MuiSelect-icon': { color: 'white' },
                    },
                }}>
                    <InputLabel id="workspace-select-label">{t('analysisCenter.workspaceSelectLabel')}</InputLabel>
                    <Select
                        labelId="workspace-select-label"
                        value={activeWorkspace}
                        onChange={(e) => setActiveWorkspace(e.target.value as WorkspaceType)}
                        label={t('analysisCenter.workspaceSelectLabel')}
                    >
                        <MenuItem value="TECHNICAL">{t('analysisCenter.workspaces.technical')}</MenuItem>
                        <MenuItem value="ORDERFLOW" disabled>{t('analysisCenter.workspaces.orderflow')}</MenuItem>
                        <MenuItem value="MACRO" disabled>{t('analysisCenter.workspaces.macro')}</MenuItem>
                        <MenuItem value="FUNDAMENTALS" disabled>{t('analysisCenter.workspaces.fundamentals')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box className="cockpit-content" sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                    {renderWorkspace()}
                </Suspense>
            </Box>
        </Box>
    );
};

export default AnalysisCenter;