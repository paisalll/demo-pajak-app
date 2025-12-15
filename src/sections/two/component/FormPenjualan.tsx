import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// @mui Material components
import { 
  Grid, Stack, Button, MenuItem, Box, Typography, Card, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers';

// Components
import FormProvider, { RHFTextField } from 'src/components/hook-form'; // Sesuaikan import
import ProdukDetail from './ProdukDetail'; // Pastikan path benar

// Hooks & API
import useMasterData from '../api/useMasterData'; // Untuk ambil data vendor/coa
import useCreateTransaction from '../api/useTransaction';
import { DUE_DATE_OPTIONS, TransactionFormValues } from './utils';
import RHFAutocomplete from 'src/components/hook-form/rhf-auto-complete';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// ----------------------------------------------------------------------

type Props = {
  isEdit?: boolean;
  currentData?: any; // Ganti 'any' dengan Interface Transaksi Anda
};

export default function FormPenjualan({ isEdit, currentData }: Props) {
  const navigate = useNavigate();
  
  const { enqueueSnackbar } = useSnackbar();
  
  // 1. Hooks API
  const { createTransaction, updateTransaction, isLoading: isSubmittingAPI } = useCreateTransaction();
  const { companies, coaOptions, ppnOptions, pphOptions } = useMasterData(); // Ambil data master

  // State untuk Tambah Vendor Cepat (Optional)
  const [openAddVendor, setOpenAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');

  const methods = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'penjualan',
      id_company: '',
      tanggal_pencatatan: new Date(),
      due_date: 30,
      tanggal_invoice: new Date(),
      tanggal_jatuh_tempo: new Date(),
      no_invoice: '',
      no_faktur: '',
      
      nama_proyek: '',
      nama_sales: '',
      pengaju: '',
      id_partner: '',
      id_akun_debit: '',
      id_akun_kredit: '',
      id_ppn_fk: '',
      id_pph_fk: '',
      
      // Default 1 baris produk kosong
      products: [
        { nama_produk: '', deskripsi: '', qty: 1, harga_satuan: 0, sub_total: 0 }
      ],
      
      // Field Kalkulasi (Display Only)
      total_dpp: 0,
      total_ppn: 0,
      total_pph: 0,
      total_transaksi: 0,
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    control,
    reset,
  } = methods;

  // 3. Live Calculation Logic
  const values = watch();

  useEffect(() => {
    const products = values.products || [];
    
    // A. Hitung Total DPP (Sum dari semua produk)
    const totalDPP = products.reduce((acc, item) => {
        return acc + (Number(item.qty || 0) * Number(item.harga_satuan || 0));
    }, 0);

    // B. Hitung Pajak
    let nominalPPN = 0;
    let nominalPPh = 0;

    // Cari rate PPN dari options (Pastikan value type number/string match)
    const selectedPPN = ppnOptions?.find(p => p.value == values.id_ppn_fk);
    if (selectedPPN) nominalPPN = totalDPP * (selectedPPN.rate || 0); // Asumsi API return field 'rate'

    // Cari rate PPh
    const selectedPPh = pphOptions?.find(p => p.value == values.id_pph_fk);
    if (selectedPPh) nominalPPh = totalDPP * (selectedPPh.rate || 0);

    // C. Grand Total Pembelian
    // Rumus: DPP + PPN - PPh (Jika PPh dipotong saat bayar) 
    // Atau DPP + PPN (Jika PPh urusan nanti). Sesuaikan dengan logic akuntansi Anda.
    // Di sini saya pakai: Total Tagihan = DPP + PPN - PPh (Net Payable)
    const grandTotal = totalDPP + nominalPPN - nominalPPh;

    // Update Form State untuk Display
    setValue('total_dpp', totalDPP);
    setValue('total_ppn', nominalPPN);
    setValue('total_pph', nominalPPh);
    setValue('total_transaksi', grandTotal);

  }, [
    JSON.stringify(values.products), // Re-calc jika produk berubah
    values.id_ppn_fk, 
    values.id_pph_fk
  ]); 

  useEffect(() => {
    // Ambil tanggal pencatatan & due date
    const startDate = values.tanggal_pencatatan ? new Date(values.tanggal_pencatatan) : new Date();
    const daysToAdd = Number(values.due_date || 0);

    // Hitung tanggal baru
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);

    // Set nilai ke field tanggal_jatuh_tempo
    setValue('tanggal_jatuh_tempo', dueDate);
    
  }, [values.tanggal_pencatatan, values.due_date]);

  useEffect(() => {
    if (isEdit && currentData) {
      
      // 1. Set Header Fields
      setValue('type', 'pembelian'); // Pastikan tipe benar
      setValue('id_company', currentData.m_company?.id_company || ''); // ID Vendor
      
      // Tanggal (Convert string ISO ke Date object)
      setValue('tanggal_pencatatan', currentData.tanggal_pencatatan ? new Date(currentData.tanggal_pencatatan) : new Date());
      setValue('tanggal_invoice', currentData.tanggal_invoice ? new Date(currentData.tanggal_invoice) : new Date());
      setValue('tanggal_jatuh_tempo', currentData.tanggal_jatuh_tempo ? new Date(currentData.tanggal_jatuh_tempo) : new Date());
      setValue('due_date', currentData.due_date || 30);

      // Info Faktur
      setValue('no_invoice', currentData.no_invoice || '');
      setValue('no_faktur', currentData.no_faktur || '');
      setValue('nama_proyek', currentData.nama_proyek || '');
      setValue('pengaju', currentData.pengaju || '');

      // 2. Set Akun & Pajak
      // Kita perlu cari ID akun dari jurnal. Logic-nya:
      // Pembelian -> Akun Kredit (Hutang) & Akun Debit (Biaya)
      // Helper function untuk cari akun di jurnal (asumsi data jurnal ada di currentData.transaksi_jurnal)
      const findAccount = (posisi: 'debit' | 'kredit') => {
         // Filter jurnal yang BUKAN pajak (id_coa tidak sama dengan akun pajak di master)
         // Atau ambil jurnal akun utama (biasanya nominalnya paling besar atau sama dengan total transaksi/DPP)
         // Simplifikasi: Ambil akun pertama sesuai posisi
         const jurnal = currentData.transaksi_jurnal?.find((j: any) => j.posisi === posisi);
         return jurnal?.id_coa_fk || '';
      };
      
      // Karena logic backend create/update jurnal kompleks, saat edit kita set manual
      // atau jika Anda menyimpan id_akun_debit/kredit di header (opsional) bisa langsung ambil.
      // Jika data jurnal lengkap, kita bisa mapping balik.
      // Di sini saya asumsikan Anda ingin user memilih ulang/memastikan akun benar:
      // ATAU jika backend Anda menyimpan ID akun inputan user, gunakan field tersebut.
      
      // Jika Backend HANYA simpan di jurnal, Anda perlu logic pintar untuk menebak mana akun utama.
      // Contoh sederhana: Ambil jurnal pertama Debit & Kredit.
      if (currentData.transaksi_jurnal) {
         const debitEntry = currentData.transaksi_jurnal.find((j: any) => j.posisi === 'debit' && /* Logic exclude PPN/PPh */ true);
         const kreditEntry = currentData.transaksi_jurnal.find((j: any) => j.posisi === 'kredit' && /* Logic exclude PPN/PPh */ true);
         
         if (debitEntry) setValue('id_akun_debit', debitEntry.id_coa_fk);
         if (kreditEntry) setValue('id_akun_kredit', kreditEntry.id_coa_fk);
      }

      // Pajak (ID PPN & PPh disimpan di header, jadi aman)
      setValue('id_ppn_fk', currentData.id_ppn_fk ? String(currentData.id_ppn_fk) : ''); // Select butuh string
      setValue('id_pph_fk', currentData.id_pph_fk ? String(currentData.id_pph_fk) : '');

      // 3. Set Produk (Mapping Detail)
      if (currentData.transaksi_detail && currentData.transaksi_detail.length > 0) {
        const mappedProducts = currentData.transaksi_detail.map((item: any) => ({
            nama_produk: item.nama_produk,
            deskripsi: item.deskripsi || '',
            qty: Number(item.qty),
            harga_satuan: Number(item.harga_satuan),
            sub_total: Number(item.sub_total)
        }));
        setValue('products', mappedProducts);
      } else {
        setValue('products', [{ nama_produk: '', deskripsi: '', qty: 1, harga_satuan: 0, sub_total: 0 }]);
      }

      // Trigger perhitungan total akan otomatis jalan karena useEffect Calculation (dependensi values)
    }
  }, [isEdit, currentData, setValue]);
  // 4. Submit Handler
  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const payload = {
        ...data,
        tanggal_pencatatan: data.tanggal_pencatatan ? new Date(data.tanggal_pencatatan).toISOString() : new Date().toISOString(),
        tanggal_invoice: data.tanggal_invoice ? new Date(data.tanggal_invoice).toISOString() : new Date().toISOString(),
        tanggal_jatuh_tempo: data.tanggal_jatuh_tempo ? new Date(data.tanggal_jatuh_tempo).toISOString() : new Date().toISOString(),
        
        // Convert ID pajak ke number (jika backend butuh number)
        id_ppn_fk: data.id_ppn_fk ? Number(data.id_ppn_fk) : undefined,
        id_pph_fk: data.id_pph_fk ? Number(data.id_pph_fk) : undefined,
        
        // Map products (pastikan number)
        products: data.products.map(p => ({
            nama_produk: p.nama_produk,
            deskripsi: p.deskripsi,
            qty: Number(p.qty),
            harga_satuan: Number(p.harga_satuan)
        }))
      };

      // Kirim ke API
      await createTransaction(payload as any);
      
      enqueueSnackbar(`Penjualan Berhasil Disimpan!\nTotal: ${formatCurrency(data.total_transaksi)} \n Silahkan Buka Dashboard atau Laporan`, { variant: 'success' });
      // navigate('/dashboard/pembelian'); // Redirect jika perlu
      reset(); // Reset form

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menyimpan data penjualan.', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* HEADER SECTION */}
        <Grid item xs={12}>
             <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>Input Data Penjualan</Typography>
             <Typography variant="body2" color="text.secondary">
                Catat tagihan dari customer/vendor (Accounts Receivable)
             </Typography>
        </Grid>

        {/* --- KOLOM KIRI: INFO FAKTUR --- */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
              Informasi Faktur & Customer
            </Typography>
            <Box gap={2} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
                {/* Tanggal */}
                {/* <DatePicker
                    label="Tanggal Pencatatan"
                    value={values.tanggal_pencatatan ? dayjs(values.tanggal_pencatatan) : null}
                    onChange={(newValue) => setValue('tanggal_pencatatan', newValue?.toDate() ?? null)}
                    slotProps={{ textField: { fullWidth: true } }}
                /> */}
                <DatePicker
                    label="Tanggal Invoice"
                    value={values.tanggal_invoice ? dayjs(values.tanggal_invoice) : null}
                    onChange={(newValue) => setValue('tanggal_invoice', newValue?.toDate() ?? null)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                <RHFAutocomplete
                  name="due_date"
                  label="Due Date (Termin Hari)"
                  required
                  options={DUE_DATE_OPTIONS}
                />
                <DatePicker
                    label="Jatuh Tempo"
                    disabled
                    value={values.tanggal_jatuh_tempo ? dayjs(values.tanggal_jatuh_tempo) : null}
                    onChange={(newValue) => setValue('tanggal_jatuh_tempo', newValue?.toDate() ?? null)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                
                {/* No Dokumen */}
                <RHFTextField name="no_invoice" label="No. Invoice Customer" placeholder="INV-..." />
                <RHFTextField name="no_faktur" label="No. Faktur Pajak" placeholder="010..." />
                <RHFAutocomplete
                  name="id_company"
                  label="Customer *"
                  options={companies}
                  onAddNew={() => setOpenAddVendor(true)} // Menyalakan fitur tambah baru
                  addNewLabel="Tambah Customer Baru"
                />
                
                <RHFTextField name="nama_proyek" label="Nama Proyek" placeholder="Masukan Nama Proyek" />
                <RHFTextField name="pengaju" label="Nama Pengaju" placeholder="Masukan Nama Pengaju" />
                <RHFTextField name="nama_sales" label="Nama Sales" placeholder="Masukan Nama Sales" />

            </Box>
          </Card>
        </Grid>

        {/* --- KOLOM KANAN: AKUN & PAJAK --- */}
        <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
                   Akun Akuntansi & Pajak
                </Typography>
                <Stack spacing={3}>
                  <RHFAutocomplete
                    name="id_akun_debit"
                    label="Akun Debit *"
                    options={coaOptions}
                  />

                  <RHFAutocomplete
                    name="id_akun_kredit"
                    label="Akun Kredit *"
                    options={coaOptions}
                  />

                  <RHFTextField select name="id_ppn_fk" label="Presentase PPN *">
                      {ppnOptions.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                  </RHFTextField>

                  <RHFTextField select name="id_pph_fk" label="Presentase PPh *">
                      {pphOptions.map((op) => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                  </RHFTextField>
              </Stack>
            </Card>
        </Grid>

        {/* --- DETAIL ITEM PRODUK --- */}
        <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
                 <Typography variant="subtitle1" sx={{ mb: 2 }}>Rincian Barang / Jasa</Typography>
                 
                 {/* Komponen Tabel Produk (Reusable) */}
                 <ProdukDetail />
                 
                 {/* SUMMARY BOX (Kanan Bawah) */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, p: 1, borderRadius: 1, bgcolor: 'background.neutral', }}>
                  <Box>
                      <Typography variant="caption" display="block" color="text.secondary">PPN Amount</Typography>
                      <Typography variant="subtitle2" color="primary.main" fontWeight="bold">+ {formatCurrency(values.total_ppn || 0)}</Typography>
                      <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                        { values.total_ppn &&  values.total_ppn > 0 ? 'utang PPN Keluaran' :  ' - '}
                      </Typography>
                  </Box>
                  <Box>
                      <Typography variant="caption" display="block" color="text.secondary">PPh Amount</Typography>
                      <Typography variant="subtitle2" color="error.main" fontWeight="bold">- {formatCurrency(values.total_pph || 0)}</Typography>
                      <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                        { values.total_pph && values.total_pph > 0 ? 'Pajak Dibayar Dimuka - PPh Final 4 (2)' : ' - '}
                      </Typography>
                  </Box>
                  <Box >
                      <Typography variant="caption" display="block" color="text.secondary">Subtotal</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(values.total_dpp || 0)}</Typography>
                  </Box>
                  <Box sx={{textAlign: 'right'}}>
                      <Typography variant="caption" display="block" color="text.secondary">Grand Total Transaksi</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(values.total_transaksi || 0)}</Typography>
                  </Box>
                </Stack>
            </Card>
        </Grid>

        {/* BUTTON ACTIONS */}
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
            {!isEdit && <Button size="large" variant="outlined" color="inherit" onClick={() => reset()}>
                Reset Form
            </Button>}
            <LoadingButton 
                type="submit" 
                variant="contained" 
                size="large"
                color="primary"
                loading={isSubmittingAPI} // Loading state dari Hook
            >
                {isEdit ? 'Update Penjualan' : 'Simpan Penjualan'}
            </LoadingButton>
        </Grid>

      </Grid>

      {/* --- DIALOG TAMBAH VENDOR (Dummy Logic) --- */}
      <Dialog open={openAddVendor} onClose={() => setOpenAddVendor(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Vendor Baru</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 1 }}>
                <TextField
                    autoFocus fullWidth
                    label="Nama Vendor"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenAddVendor(false)}>Batal</Button>
            <Button variant="contained" onClick={() => {
                alert('Fitur tambah vendor via modal belum connect API :)');
                setOpenAddVendor(false);
            }}>Simpan</Button>
        </DialogActions>
      </Dialog>

    </FormProvider>
  );
}