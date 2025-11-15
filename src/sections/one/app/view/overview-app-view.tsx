// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import AppNewInvoice from '../app-new-invoice';
// import AppWidgetSummary from '../app-widget-summary'; // Anda mungkin tidak perlu ini lagi
import AnalyticsWidgetSummary from '../analytics-widget-summary'; // Ini yang kita modifikasi

// ----------------------------------------------------------------------

// DATA DUMMY UNTUK CHART
const CHART_DATA_PENJUALAN = [10, 41, 35, 51, 49, 62, 69, 91, 148];
const CHART_DATA_PEMBELIAN = [22, 8, 35, 10, 30, 60, 34, 12, 40];
const CHART_DATA_PAJAK = [5, 15, 25, 10, 30, 15, 5, 20, 25];
const CHART_DATA_TRANSAKSI = [40, 30, 50, 60, 20, 30, 50, 80, 100];

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        
        {/* HIJAU: Total Penjualan */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Penjualan"
            total={714000}
            color="success" // Sesuai permintaan: hijau
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
            percent={2.6} // Prop baru (data dummy)
            chartData={CHART_DATA_PENJUALAN} // Prop baru (data dummy)
          />
        </Grid>

        {/* MERAH: Total Pembelian */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Pembelian"
            total={234567} // Data dummy
            color="error" // Sesuai permintaan: merah
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
            percent={-0.8} // Prop baru (data dummy)
            chartData={CHART_DATA_PEMBELIAN} // Prop baru (data dummy)
          />
        </Grid>
        
        {/* KUNING: Total Pajak */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Pajak"
            total={172315}
            color="warning" // Sesuai permintaan: kuning
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            percent={1.2} // Prop baru (data dummy)
            chartData={CHART_DATA_PAJAK} // Prop baru (data dummy)
          />
        </Grid>

        {/* BIRU: Total Transaksi */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Transaksi"
            total={13528} // Data dummy
            color="info" // Sesuai permintaan: biru
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            percent={5.5} // Prop baru (data dummy)
            chartData={CHART_DATA_TRANSAKSI} // Prop baru (data dummy)
          />
        </Grid>

        <Grid xs={12} lg={12}>
          <AppNewInvoice
            title="New Invoice"
            tableData={_appInvoices}
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
        </Grid>

      </Grid>
    </Container>
  );
}