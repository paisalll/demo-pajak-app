import React, { useState } from 'react';

// @mui Material components
import {
  Box,
  Card,
  Container,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';

import FormPenjualan from './component/FormPenjualan';
import FormPembelian from './component/FormPembelian';

// ----------------------------------------------------------------------

export default function InputDataPajakPage() {
  const [currentTab, setCurrentTab] = useState<string>('penjualan');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string): void => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ p: 0, boxShadow: 3 }}>
        {/* Header Form */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Input Data Pajak
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pilih tab Penjualan atau Pembelian untuk memasukkan data transaksi
          </Typography>
        </Box>

        {/* Navigasi Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="Tab data pajak">
            <Tab label="Input Penjualan" value="penjualan" id="tab-penjualan" />
            <Tab label="Input Pembelian" value="pembelian" id="tab-pembelian" />
          </Tabs>
        </Box>

        {/* Konten Tab */}
        <Box sx={{ p: 4 }}>
          {/* Panel Tab Penjualan */}
          <Box
            role="tabpanel"
            hidden={currentTab !== 'penjualan'}
            aria-labelledby="tab-penjualan"
          >
            {currentTab === 'penjualan' && <FormPenjualan />}
          </Box>

          {/* Panel Tab Pembelian */}
          <Box
            role="tabpanel"
            hidden={currentTab !== 'pembelian'}
            aria-labelledby="tab-pembelian"
          >
            {currentTab === 'pembelian' && <FormPembelian />}
          </Box>
        </Box>
      </Card>
    </Container>
  );
}