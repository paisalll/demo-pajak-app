import React, { useState, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appInvoices } from 'src/_mock'; // Pastikan data dummy Anda sudah diupdate seperti sebelumnya
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import AppNewInvoice from '../app-new-invoice';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
// Import komponen detail baru
import AnalyticsTransactionDetail from '../analytics-transaction-detail'; // Sesuaikan path

// ----------------------------------------------------------------------
// DATA DUMMY CHART (Sama seperti sebelumnya)
const CHART_DATA_PENJUALAN = [10, 41, 35, 51, 49, 62, 69, 91, 148];
const CHART_DATA_PEMBELIAN = [22, 8, 35, 10, 30, 60, 34, 12, 40];
const CHART_DATA_PAJAK = [5, 15, 25, 10, 30, 15, 5, 20, 25];
const CHART_DATA_TRANSAKSI = [40, 30, 50, 60, 20, 30, 50, 80, 100];

export default function OverviewAppView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const settings = useSettingsContext();

  // STATE TABS
  const [currentTab, setCurrentTab] = useState('list'); // 'list' | 'detail'
  
  // STATE SELECTED INVOICE (Untuk ditampilkan di tab detail)
  // Default ambil data pertama untuk contoh tampilan
  const [selectedInvoice, setSelectedInvoice] = useState(_appInvoices[0]); 

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleViewDetail = useCallback((id: any) => {
    const invoice = _appInvoices.find((i) => i.id === id);
    
    if (invoice) {
        setSelectedInvoice(invoice);
        setCurrentTab('detail');
    }
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Grid container spacing={3}>
        
        {/* --- WIDGET SUMMARY --- */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary title="Total Penjualan" total={714000} color="success" icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />} percent={2.6} chartData={CHART_DATA_PENJUALAN} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary title="Total Pembelian" total={234567} color="error" icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />} percent={-0.8} chartData={CHART_DATA_PEMBELIAN} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary title="Total Pajak" total={172315} color="warning" icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />} percent={1.2} chartData={CHART_DATA_PAJAK} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary title="Total Transaksi" total={13528} color="info" icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />} percent={5.5} chartData={CHART_DATA_TRANSAKSI} />
        </Grid>

        {/* --- BAGIAN UTAMA (TABLE & DETAIL) --- */}
        <Grid xs={12} lg={12}>
          <Card>
            {/* Header Tabs */}
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              sx={{
                px: 2.5,
                boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.grey}`,
              }}
            >
              <Tab value="list" label="Report" />
              <Tab value="detail" label="Detail Transaksi" />
            </Tabs>

            {/* Content Tab 1: LIST / TABLE */}
            {currentTab === 'list' && (
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
            )}

            {/* Content Tab 2: DETAIL */}
            {currentTab === 'detail' && (
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
            )}
          </Card>
        </Grid>

      </Grid>
    </Container>
  );
}