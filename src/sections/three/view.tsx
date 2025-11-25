import React, { useState, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

// components
import Iconify from 'src/components/iconify'; // <--- Import Iconify
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useSettingsContext } from 'src/components/settings';

// _mock
import { _appInvoices } from 'src/_mock';

// components (Custom Anda)
import AppNewInvoice from './app-new-invoice';
import AppWidgetSummary from './app-widget-summary';

// ----------------------------------------------------------------------

// CONSTANTS
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const START_YEAR = 2023;
const YEARS = Array.from({ length: 7 }, (_, i) => START_YEAR + i);

// ----------------------------------------------------------------------

export default function ThreeView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const settings = useSettingsContext();

  // STATE
  type Invoice = (typeof _appInvoices)[number];
  const [currentTab, setCurrentTab] = useState<'list' | 'detail'>('list'); // 'list' | 'detail'
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(_appInvoices[0] ?? null);
  
  // STATE FILTER
  const [filterMonth, setFilterMonth] = useState('Semua Bulan');
  const [filterYear, setFilterYear] = useState(2025);

  // HANDLERS
  const handleFilterMonth = (event: SelectChangeEvent) => {
    setFilterMonth(event.target.value);
  };

  const handleFilterYear = (event: SelectChangeEvent) => {
    setFilterYear(Number(event.target.value));
  };

  const handleResetFilter = () => {
    setFilterMonth('Semua Bulan');
    setFilterYear(2025);
  };

  const handleViewDetail = useCallback((id: string) => {
    const invoice = _appInvoices.find((i) => i.id === id);
    if (invoice) {
      setSelectedInvoice(invoice);
      setCurrentTab('detail');
    }
  }, []);

  const handleBackToList = () => {
    setCurrentTab('list');
    setSelectedInvoice(null);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      
      {/* HEADER SECTION */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* JUDUL & SUB JUDUL */}
          <Grid xs={12} md={12}>
            <Stack direction="row" alignItems="center" gap={2}>
              {currentTab === 'detail' && (
                <IconButton onClick={handleBackToList}>
                  {/* ICON: Back Arrow */}
                  <Iconify icon="solar:arrow-left-bold" />
                </IconButton>
              )}
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {currentTab === 'detail' ? `Detail Invoice: ${selectedInvoice?.invoiceNumber || '-'}` : 'Laporan Pajak'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {currentTab === 'detail' 
                    ? 'Lihat detail lengkap data pajak invoice ini' 
                    : 'Filter dan ekspor laporan data pajak'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* FILTER SECTION (Hanya tampil jika sedang di List View) */}
          {currentTab === 'list' && (
            <>
              {/* FILTER BULAN */}
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Bulan</Typography>
                <FormControl fullWidth size="medium">
                  <Select value={filterMonth} onChange={handleFilterMonth}>
                    <MenuItem value="Semua Bulan">Semua Bulan</MenuItem>
                    {MONTHS.map((month, index) => (
                      <MenuItem key={month} value={String(index + 1)}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* FILTER TAHUN */}
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Tahun</Typography>
                <FormControl fullWidth size="medium">
                  <Select value={String(filterYear)} onChange={(e: any) => handleFilterYear(e)}>
                    <MenuItem value={0}>Semua Tahun</MenuItem>
                    {YEARS.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* RESET FILTER */}
              <Grid xs={12} md={4}>
                 <Typography variant="subtitle2" sx={{ mb: 1 }}>&nbsp;</Typography>
                <Button
                  fullWidth
                  variant="soft"
                  color="info"
                  size="large"
                  onClick={handleResetFilter}
                  // ICON: Refresh / Restart
                  startIcon={<Iconify icon="solar:restart-bold" />} 
                  sx={{ height: 53 }}
                >
                  Reset Filter
                </Button>
              </Grid>

              {/* ACTION BUTTONS */}
              <Grid xs={12} display="flex" justifyContent="flex-end" gap={2} mt={1}>
                <Button
                  variant="outlined"
                  // ICON: Printer
                  startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                  onClick={() => {}}
                >
                  Print
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  // ICON: Export / Download
                  startIcon={<Iconify icon="solar:export-bold" />}
                  onClick={() => {}}
                >
                  Export CSV
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Card>

      {/* WIDGETS SUMMARY */}
      {currentTab === 'list' && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Pembelian" percent={2.6} total={18765} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Penjualan" percent={0.2} total={4876} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Pajak" percent={-0.1} total={678} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Transaksi" percent={-0.1} total={678} />
          </Grid>
        </Grid>
      )}

      {/* MAIN CONTENT AREA */}
      <Card>
        {currentTab === 'list' ? (
          // --- VIEW LIST ---
          <AppNewInvoice
            onViewDetail={handleViewDetail}
            tableData={_appInvoices}
            sx={{ boxShadow: 'none', borderRadius: 0 }} 
            tableLabels={[
              { id: 'tanggal', label: 'Tanggal' },
              { id: 'no_invoice', label: 'No. Invoice' },
              { id: 'akun', label: 'Akun' },
              { id: 'coa', label: 'COA' },
              { id: 'pembelian', label: 'Pembelian' },
              { id: 'penjualan', label: 'Penjualan' },
              { id: 'nominal', label: 'Nominal' },
              { id: 'pajak', label: 'Pajak' },
              { id: '' },
            ]}
          />
        ) : (
          // --- VIEW DETAIL (Placeholder) ---
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" paragraph>
              Detail untuk Invoice #{selectedInvoice?.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (Halaman Detail Invoice)
            </Typography>
            
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1,
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: 12,
                overflowX: 'auto'
              }}
            >
              <pre>{JSON.stringify(selectedInvoice, null, 2)}</pre>
            </Box>
          </Box>
        )}
      </Card>
      
    </Container>
  );
}