import {
  // Komponen Toolbar Baru
  Toolbar,
  QuickFilter,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv, 
  ExportPrint, // Opsional jika butuh Print
} from '@mui/x-data-grid';

import Box from '@mui/material/Box';

export function CustomToolbar() {
  return (
    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
      <Toolbar>
        {/* KIRI: Tombol-tombol Menu */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <ColumnsPanelTrigger />
        <FilterPanelTrigger />
        
        {/* Export sekarang tombol terpisah. Pilih sesuai kebutuhan: */}
        <ExportCsv /> 
        {/* <ExportPrint /> */}
      </Box>

      {/* SPACER: Dorong Search ke Kanan */}
      <Box sx={{ flexGrow: 1 }} />

      {/* KANAN: Search Bar */}
      <QuickFilter 
        variant="outlined" 
        size="small"
        placeholder="Cari data..."
      />
      </Toolbar>
    </Box>
  );
}
