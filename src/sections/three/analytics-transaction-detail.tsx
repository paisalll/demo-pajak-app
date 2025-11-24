import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AnalyticsTransactionDetail({ invoice }: any) {
  if (!invoice) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        Pilih transaksi untuk melihat detail
      </Box>
    );
  }

  const taxAmount = invoice.taxes || invoice.price * 0.11;
  const totalAmount = invoice.price + taxAmount;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Detail: Status & ID */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6"> Detail Transaksi </Typography>
        <Label
          variant="soft"
          color={
            (invoice.status === 'paid' && 'success') ||
            (invoice.status === 'pending' && 'warning') ||
            'error'
          }
        >
          {invoice.status.toUpperCase()}
        </Label>
      </Stack>

      <Grid container spacing={3}>
        {/* Informasi Utama */}
        <Grid xs={12} md={6}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No. Invoice</Typography>
              <Typography variant="subtitle2">{invoice.invoiceNumber}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tanggal</Typography>
              <Typography variant="subtitle2">{fDate(invoice.createDate)}</Typography>
            </Stack>
             <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>COA</Typography>
              <Typography variant="subtitle2">{invoice.coa}</Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Informasi Pihak Terkait */}
        <Grid xs={12} md={6}>
           <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kepada</Typography>
              <Typography variant="subtitle2">{invoice.invoiceTo.name}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tipe</Typography>
              <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                 {/* Logic sederhana untuk tipe, bisa disesuaikan dengan data real */}
                 {invoice.price > 0 ? 'Pemasukan' : 'Pengeluaran'}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      {/* Rincian Harga */}
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Rincian Pembayaran</Typography>
        
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Nominal</Typography>
            <Typography variant="body2">{fCurrency(invoice.price)}</Typography>
        </Stack>
        
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pajak (PPN 11%)</Typography>
            <Typography variant="body2" sx={{ color: 'error.main' }}>
                + {fCurrency(taxAmount)}
            </Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Total Akhir</Typography>
            <Typography variant="h6" color="primary">
                {fCurrency(totalAmount)}
            </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

AnalyticsTransactionDetail.propTypes = {
  invoice: PropTypes.object,
};