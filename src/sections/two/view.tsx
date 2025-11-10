import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// @mui Material components
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  MenuItem,
  Container,
  Typography,
  InputAdornment,
} from '@mui/material';
// @mui Icons
// import SaveIcon from '@mui/icons-material/Save';
// import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Komponen Kustom Anda (sesuaikan path import-nya)
import FormProvider from '../../components/hook-form/form-provider';
import RHFTextField from '../../components/hook-form/rhf-text-field';

// ----------------------------------------------------------------------

// Data Dummy untuk Opsi Dropdown
const AKUN_OPTIONS = [
  { value: 'kas', label: 'Kas' },
  { value: 'bank', label: 'Bank BCA' },
  { value: 'piutang', label: 'Piutang Usaha' },
];

const COA_OPTIONS = [
  { value: '1101', label: '1101 - Kas Besar' },
  { value: '1102', label: '1102 - Rekening Bank' },
  { value: '4001', label: '4001 - Pendapatan Jasa' },
];

// ----------------------------------------------------------------------

export default function InputDataPajakPage() {
  // 1. Definisi Schema Validasi (Opsional tapi disarankan)
  const TaxFormSchema = Yup.object().shape({
    tanggal: Yup.string().required('Tanggal wajib diisi'),
    noInvoice: Yup.string().required('No. Invoice wajib diisi'),
    akun: Yup.string().required('Akun wajib dipilih'),
    coa: Yup.string().required('COA wajib dipilih'),
    pembelian: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
    penjualan: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
    nominal: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
    nominalPajak: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
  });

  // 2. Setup Default Values
  const defaultValues = {
    tanggal: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD hari ini
    noInvoice: '',
    akun: '',
    coa: '',
    pembelian: 0,
    penjualan: 0,
    nominal: 0,
    nominalPajak: 0,
  };

  // 3. Inisialisasi useForm
  const methods = useForm({
    resolver: yupResolver(TaxFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // 4. Handle Submit
  const onSubmit = async (data: typeof defaultValues) => {
    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Data Tersimpan:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Judul Halaman (Optional, jika di luar card) */}
      {/* <Typography variant="h4" sx={{ mb: 3 }}>
        Sistem Data Pajak
      </Typography> */}

      <Card sx={{ p: 4, boxShadow: 3 }}>
        {/* Header Form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Input Data Pajak
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Masukkan data transaksi pajak baru
          </Typography>
        </Box>

        {/* Form Provider Membungkus Form */}
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Baris 1 */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="tanggal"
                label="Tanggal *"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                name="noInvoice"
                label="No. Invoice *"
                placeholder="INV-001"
              />
            </Grid>

            {/* Baris 2 - Menggunakan RHFTextField sebagai Select */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                select
                name="akun"
                label="Akun *"
                SelectProps={{ native: false }} // Gunakan false agar bisa pakai MenuItem
              >
                <MenuItem value="" disabled>
                  Pilih Akun
                </MenuItem>
                {AKUN_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField select name="coa" label="COA (Chart of Accounts) *">
                <MenuItem value="" disabled>
                  Pilih COA
                </MenuItem>
                {COA_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFTextField>
            </Grid>

            {/* Baris 3 - Angka */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="pembelian"
                label="Pembelian *"
                type="number"
                placeholder="0"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                name="penjualan"
                label="Penjualan *"
                type="number"
                placeholder="0"
              />
            </Grid>

            {/* Baris 4 - Angka */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="nominal"
                label="Nominal *"
                type="number"
                placeholder="0"
                // Opsional: Tambah prefix Rp jika mau
                // InputProps={{
                //   startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                // }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                name="nominalPajak"
                label="Nominal Pajak *"
                type="number"
                placeholder="0"
              />
            </Grid>
          </Grid>

          {/* Tombol Aksi */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              // startIcon={<SaveIcon />}
              disabled={isSubmitting}
              sx={{ px: 4, py: 1.2, fontWeight: 'bold' }} // Styling agar mirip tombol biru di gambar
            >
              Simpan Data
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              // startIcon={<RestartAltIcon />}
              onClick={() => reset()}
              sx={{ px: 4, py: 1.2 }}
            >
              Reset
            </Button>
          </Stack>
        </FormProvider>
      </Card>
    </Container>
  );
}