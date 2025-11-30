import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// @mui Material components
import { 
  Grid, Stack, Button, MenuItem, Box, Typography, 
  InputAdornment, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from '@mui/material';

// Components
import FormProvider from '../../../components/hook-form/form-provider';
import RHFTextField from '../../../components/hook-form/rhf-text-field';
import RHFAutocomplete from 'src/components/hook-form/rhf-auto-complete';

// Utils
import {
  COA_OPTIONS, 
  INITIAL_CUSTOMERS, 
  AKUN_DEBIT_OPTIONS, 
  AKUN_KREDIT_OPTIONS, 
  PAJAK_PPN_OPTIONS, 
  PAJAK_PPH_OPTIONS
} from './utils';
import axios, { endpoints } from 'src/utils/axios';
import useMasterData from '../api/useMasterData';

// ----------------------------------------------------------------------

const getTodayDate = () => new Date().toISOString().split('T')[0];
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// ----------------------------------------------------------------------

export default function FormPembelian() {

  // State untuk Data Master dari API
  const { companies, setCompanies, coaOptions, ppnOptions, pphOptions, isLoading } = useMasterData();
  // const [vendors, setVendors] = useState(INITIAL_CUSTOMERS);
  const [openAddVendor, setOpenAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');

  
  interface PurchaseFormValues {
    tanggalPencatatan: string;
    tanggalInvoice: string;
    tanggalJatuhTempo: string;
    noFaktur: string;
    noInvoice: string;
    vendor: string;
    coa?: string;
    akunDebit: string;
    akunKredit: string;
    qty: number;
    hargaSatuan: number;
    persentasePPN: number;
    persentasePPh: number;
    subtotal?: number;
    ppnAmount?: number;
    pphAmount?: number;
    totalAkhir?: number;
  }

  const PurchaseFormSchema = Yup.object().shape({
    tanggalPencatatan: Yup.string().required('Tanggal wajib diisi'),
    tanggalInvoice: Yup.string().required('Tanggal wajib diisi'),
    tanggalJatuhTempo: Yup.string().required('Tanggal wajib diisi'),
    noFaktur: Yup.string().required('No. Faktur wajib diisi'),
    noInvoice: Yup.string().required('No. Invoice wajib diisi'),
    vendor: Yup.string().required('Vendor wajib diisi'),
    coa: Yup.string(),
    akunDebit: Yup.string().required('Akun Debit wajib dipilih'),
    akunKredit: Yup.string().required('Akun Kredit wajib dipilih'),
    qty: Yup.number().min(1, 'Minimal 1').required('Wajib diisi'),
    hargaSatuan: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
    persentasePPN: Yup.number().required('PPN wajib dipilih'),
    persentasePPh: Yup.number().required('PPh wajib dipilih'),
    subtotal: Yup.number(),
    ppnAmount: Yup.number(),
    pphAmount: Yup.number(),
    totalAkhir: Yup.number(),
  });

  const defaultValues: PurchaseFormValues = {
    tanggalPencatatan: getTodayDate(),
    tanggalInvoice: getTodayDate(),
    tanggalJatuhTempo: getTodayDate(),
    noFaktur: '',
    noInvoice: '',
    vendor: '',
    coa: '',
    akunDebit: '',
    akunKredit: '',
    qty: 0,
    hargaSatuan: 0,
    persentasePPN: 4,
    persentasePPh: 4,
    subtotal: 0,
    ppnAmount: 0,
    pphAmount: 0,
    totalAkhir: 0,
  };

  const methods = useForm<PurchaseFormValues>({
    resolver: yupResolver<PurchaseFormValues>(PurchaseFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

  // Watch nilai untuk kalkulasi realtime
  const values = useWatch({
    control,
    name: ['qty', 'hargaSatuan', 'persentasePPN', 'persentasePPh'],
  });

  // Logic Kalkulasi
  useEffect(() => {
    const [qty, hargaSatuan, ppn, pph] = values;
    
    const subtotal = (Number(qty) || 0) * (Number(hargaSatuan) || 0);
    const ppnAmount = subtotal * (Number(ppn) / 100);
    const pphAmount = subtotal * (Number(pph) / 100);
    
    // Total Pembelian = Subtotal + PPN - PPh 
    const totalAkhir = subtotal + ppnAmount - pphAmount;

    setValue('subtotal', subtotal);
    setValue('ppnAmount', ppnAmount);
    setValue('pphAmount', pphAmount);
    setValue('totalAkhir', totalAkhir);
  }, [values, setValue]);

  // Logic Tambah Vendor Baru
  const handleAddNewVendor = () => {
    if (newVendorName.trim() !== '') {
      const newOption = { label: newVendorName, value: newVendorName };
      setCompanies((prev: any[]) => [...prev, newOption]);
      setValue('vendor', newVendorName); 
      setNewVendorName('');
      setOpenAddVendor(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('DATA PEMBELIAN:', data);
      alert(`Data Pembelian Tersimpan!\nTotal: ${formatCurrency(data.totalAkhir)}`);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  // Ambil nilai hasil kalkulasi untuk ditampilkan di UI
  const { subtotal, ppnAmount, pphAmount, totalAkhir } = useWatch({ control });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
         <Grid item xs={12}>
             <Typography variant="h6" sx={{ mb: 2 }}>Input Data Pembelian</Typography>
             <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Masukkan data transaksi pembelian dari vendor/supplier
             </Typography>
        </Grid>

        {/* Baris 1: Tanggal */}
        <Grid item xs={12} md={4}>
          <RHFTextField name="tanggalPencatatan" label="Tanggal Pencatatan *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField name="tanggalInvoice" label="Tanggal Invoice *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField name="tanggalJatuhTempo" label="Tanggal Jatuh Tempo *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>

        {/* Baris 2: Identitas & Vendor */}
        <Grid item xs={12} md={4}>
          <RHFTextField name="noFaktur" label="No. Faktur" placeholder="Masukkan nomor faktur" />
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField name="noInvoice" label="No. Invoice" placeholder="Masukkan nomor invoice" />
        </Grid>
        <Grid item xs={12} md={4}>
          {/* MENGGUNAKAN RHFAutocomplete AGAR LEBIH RAPI */}
          <RHFAutocomplete
            name="vendor"
            label="Vendor/Supplier *"
            options={companies}
            onAddNew={() => setOpenAddVendor(true)} // Menyalakan fitur tambah baru
            addNewLabel="Tambah Vendor Baru"
          />
        </Grid>

        {/* Baris 3: Akun (COA) */}
        <Grid item xs={12} md={6}>
          <RHFAutocomplete
            name="akunDebit"
            label="Akun Debit *"
            options={coaOptions}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RHFAutocomplete
            name="akunKredit"
            label="Akun Kredit *"
            options={coaOptions}
          />
        </Grid>

        {/* Baris 4: Detail Item & Subtotal */}
        <Grid item xs={12} md={4}>
          <RHFTextField name="qty" label="Qty *" type="number" placeholder="Masukkan qty" />
        </Grid>
        <Grid item xs={12} md={4}>
             <RHFTextField 
                name="hargaSatuan" 
                label="Harga Satuan *" 
                type="number" 
                placeholder="Masukkan harga satuan"
                InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
            />
        </Grid>
        <Grid item xs={12} md={4}>
           <Box sx={{ px: 1, py: 0.3, border: '1px solid #e0e0e0', borderRadius: 1}}>
               <Typography variant="caption" color="text.secondary">Subtotal</Typography>
               <Typography variant="subtitle1" color="primary">{formatCurrency(subtotal || 0)}</Typography>
           </Box>
        </Grid>

        {/* Baris 5: Pajak & Total Akhir */}
        <Grid item xs={12} md={4}>
          <RHFTextField select name="persentasePPN" label="Presentase PPN *">
             {ppnOptions.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
          </RHFTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField select name="persentasePPh" label="Presentase PPh *">
             {pphOptions.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
          </RHFTextField>
        </Grid>
         <Grid item xs={12} md={4}>
           <Box sx={{ px: 1, py: 0.3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
               <Typography variant="caption" color="text.secondary">Total (Subtotal + PPN - PPh)</Typography>
               <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 'bold' }}>{formatCurrency(totalAkhir || 0)}</Typography>
           </Box>
        </Grid>

        {/* Baris 6: Summary / Rincian Akun Otomatis */}
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, p: 1, borderRadius: 1 }}>
              <Box>
                  <Typography variant="caption" display="block" color="text.secondary">PPN Amount</Typography>
                  <Typography variant="subtitle2" color="primary.main" fontWeight="bold">+ {formatCurrency(ppnAmount || 0)}</Typography>
                  <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                    { ppnAmount &&  ppnAmount > 0 
                      ? 'Hutang PPn'
                      :  ' - '}
                  </Typography>
              </Box>
              <Box>
                  <Typography variant="caption" display="block" color="text.secondary">PPh Amount</Typography>
                  <Typography variant="subtitle2" color="error.main" fontWeight="bold">- {formatCurrency(pphAmount || 0)}</Typography>
                  <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                    { pphAmount && pphAmount > 0 ? 'Hutang Dibayar Dimuka' : ' - '}
                  </Typography>
              </Box>
                <Box sx={{textAlign: 'right'}}>
                  <Typography variant="caption" display="block" color="text.secondary">Subtotal Barang</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(subtotal || 0)}</Typography>
              </Box>
            </Stack>
        </Grid>
      </Grid>

      {/* Tombol Aksi */}
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={isSubmitting}
          sx={{ px: 4, py: 1.2, fontWeight: 'bold' }}
        >
          Simpan Data Pembelian
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => reset()}
          sx={{ px: 4, py: 1.2 }}
        >
          Reset
        </Button>
      </Stack>

      {/* Dialog Tambah Vendor Baru */}
      <Dialog open={openAddVendor} onClose={() => setOpenAddVendor(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Vendor Baru</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 1 }}>
                <TextField
                    autoFocus
                    fullWidth
                    label="Nama Vendor Baru"
                    placeholder="Masukkan nama vendor baru"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenAddVendor(false)} color="inherit">Batal</Button>
            <Button onClick={handleAddNewVendor} variant="contained" color="primary">Tambah</Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}