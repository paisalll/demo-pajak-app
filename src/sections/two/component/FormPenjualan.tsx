import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// @mui Material components
import { Grid, Stack, Button, MenuItem, Box, Typography, InputAdornment, Autocomplete, TextField, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import FormProvider from '../../../components/hook-form/form-provider';
import RHFTextField from '../../../components/hook-form/rhf-text-field';
import RHFAutocomplete from 'src/components/hook-form/rhf-auto-complete';
import {COA_OPTIONS, INITIAL_CUSTOMERS, AKUN_DEBIT_OPTIONS, AKUN_KREDIT_OPTIONS, PAJAK_PPN_OPTIONS, PAJAK_PPH_OPTIONS} from './utils';


const getTodayDate = () => new Date().toISOString().split('T')[0];

// ----------------------------------------------------------------------

export default function FormPenjualan() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [openAddCustomer, setOpenAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

  const SalesFormSchema = Yup.object().shape({
    tanggalPencatatan: Yup.string().required('Tanggal wajib diisi'),
    tanggalInvoice: Yup.string().required('Tanggal wajib diisi'),
    tanggalJatuhTempo: Yup.string().required('Tanggal wajib diisi'),
    noInvoice: Yup.string().required('No. Invoice wajib diisi'),
    noFaktur: Yup.string().required('No. Faktur wajib diisi'),
    customer: Yup.string().required('Customer wajib diisi'),
    coa: Yup.string(),
    akunDebit: Yup.string().required('Akun Debit wajib dipilih'),
    akunKredit: Yup.string().required('Akun Kredit wajib dipilih'),
    qty: Yup.number().min(1, 'Minimal 1').required('Wajib diisi'),
    hargaSatuan: Yup.number().min(0, 'Minimal 0').required('Wajib diisi'),
    persentasePPN: Yup.number().required('PPN wajib dipilih'),
    persentasePPh: Yup.number().required('PPh wajib dipilih'),
    // Computed/read-only fields included so setValue accepts them
    subtotal: Yup.number(),
    ppnAmount: Yup.number(),
    pphAmount: Yup.number(),
    totalAkhir: Yup.number(),
  });

  const defaultValues = {
    tanggalPencatatan: getTodayDate(),
    tanggalInvoice: getTodayDate(),
    tanggalJatuhTempo: getTodayDate(),
    noInvoice: '',
    noFaktur: '',
    customer: '',
    coa: '',
    akunDebit: '',
    akunKredit: '',
    qty: 0,
    hargaSatuan: 0,
    persentasePPN: 11,
    persentasePPh: 0,
    // Field hasil hitungan (read only/display)
    subtotal: 0,
    ppnAmount: 0,
    pphAmount: 0,
    totalAkhir: 0, 
  };

  const methods = useForm({
    resolver: yupResolver(SalesFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

  // Pantau nilai input untuk kalkulasi otomatis
  const values = useWatch({
    control,
    name: ['qty', 'hargaSatuan', 'persentasePPN', 'persentasePPh'],
  });

  useEffect(() => {
    const [qty, hargaSatuan, ppn, pph] = values;
    
    const subtotal = (Number(qty) || 0) * (Number(hargaSatuan) || 0);
    const ppnAmount = subtotal * (Number(ppn) / 100);
    const pphAmount = subtotal * (Number(pph) / 100);
    
    // Total = Subtotal + PPN - PPh
    const totalAkhir = subtotal + ppnAmount - pphAmount;

    setValue('subtotal', subtotal);
    setValue('ppnAmount', ppnAmount);
    setValue('pphAmount', pphAmount);
    setValue('totalAkhir', totalAkhir);
  }, [values, setValue]);

  const handleAddNewCustomer = () => {
    if (newCustomerName.trim() !== '') {
      const newOption = { label: newCustomerName, value: newCustomerName };
      setCustomers((prev) => [...prev, newOption]);
      setValue('customer', newCustomerName); // Set nilai form ke customer baru
      setOpenAddCustomer(false);
      setNewCustomerName('');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('DATA PENJUALAN:', data);
      alert(`Data Penjualan Tersimpan!\nTotal: Rp ${data.totalAkhir.toLocaleString('id-ID')}`);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const { subtotal, ppnAmount, pphAmount, totalAkhir } = useWatch({ control });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
             <Typography variant="h6" sx={{ mb: 2 }}>Input Data Penjualan</Typography>
             <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Masukkan data transaksi penjualan kepada customer
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

        {/* Baris 2: Identitas */}
        <Grid item xs={12} md={4}>
          <RHFTextField name="noFaktur" label="No. Faktur" placeholder="Masukkan nomor faktur" required/>
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField name="noInvoice" label="No. Invoice" placeholder="Masukkan nomor invoice" required/>
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFAutocomplete
            name="customer"
            label="Vendor/Customer *"
            options={customers}
            onAddNew={() => setOpenAddCustomer(true)} // Menyalakan fitur tambah baru
            addNewLabel="Tambah Customer Baru"
          />
        </Grid>

        {/* Baris 3: Akun */}
        <Grid item xs={12} md={6}>
          <RHFAutocomplete
            name="akunDebit"
            label="Akun Debit *"
            options={COA_OPTIONS}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFAutocomplete
            name="akunKredit"
            label="Akun Kredit *"
            options={COA_OPTIONS}
          />
        </Grid>

        {/* Baris 4: Detail Item */}
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
           {/* Display Only Subtotal */}
           <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f9fafb' }}>
               <Typography variant="caption" color="text.secondary">Subtotal</Typography>
               <Typography variant="h6" color="primary">{formatCurrency(subtotal || 0)}</Typography>
           </Box>
        </Grid>

        {/* Baris 5: Pajak */}
        <Grid item xs={12} md={4}>
          <RHFTextField select name="persentasePPN" label="Presentase PPN *">
             {PAJAK_PPN_OPTIONS.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
          </RHFTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <RHFTextField select name="persentasePPh" label="Presentase PPh *">
             {PAJAK_PPH_OPTIONS.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
          </RHFTextField>
        </Grid>
         <Grid item xs={12} md={4}>
           {/* Display Only Total Akhir */}
           <Box sx={{ p: 2, border: '1px solid #c8facd', borderRadius: 1, bgcolor: '#f0fdf4' }}>
               <Typography variant="caption" color="text.secondary">Total (Subtotal + PPN - PPh)</Typography>
               <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>{formatCurrency(totalAkhir || 0)}</Typography>
           </Box>
        </Grid>

        {/* Baris 6: Summary Pajak (Info tambahan seperti di gambar bagian bawah) */}
        <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary">PPN Amount</Typography>
                    <Typography variant="subtitle1" color="primary.main" fontWeight="bold">+ {formatCurrency(ppnAmount || 0)}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary">PPh Amount</Typography>
                    <Typography variant="subtitle1" color="error.main" fontWeight="bold">- {formatCurrency(pphAmount || 0)}</Typography>
                </Box>
                 <Box sx={{textAlign: 'right'}}>
                    <Typography variant="caption" display="block" color="text.secondary">Subtotal Barang</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(subtotal || 0)}</Typography>
                </Box>
            </Stack>
        </Grid>
        <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary">PPn</Typography>
                    <Typography variant="subtitle1" color="success.main" fontWeight="bold">
                      { ppnAmount &&  ppnAmount > 0 
                        ? 'Hutang PPn'
                        :  ' - '}
                    </Typography>
                </Box>
                 <Box>
                    <Typography variant="caption" display="block" color="text.secondary">PPh</Typography>
                    <Typography variant="subtitle1" color="error.main" fontWeight="bold">
                      { pphAmount && pphAmount > 0 ? 'Hutang Dibayar Dimuka' : ' - '}
                    </Typography>
                </Box>
                <Box></Box>
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
          Simpan Data Penjualan
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
      {/* Dialog Tambah Customer Baru */}
      <Dialog open={openAddCustomer} onClose={() => setOpenAddCustomer(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Customer Baru</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 1 }}>
                <TextField
                    autoFocus
                    fullWidth
                    label="Nama Customer Baru"
                    placeholder="Masukkan nama customer baru"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenAddCustomer(false)} color="inherit">Batal</Button>
            <Button onClick={handleAddNewCustomer} variant="contained" color="primary">Tambah</Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}