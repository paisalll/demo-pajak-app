// components/QuickAddVendorDialog.tsx

import React, { useState } from 'react';
import dayjs from 'dayjs';
import axios, { endpoints } from 'src/utils/axios'; // Sesuaikan path

// MUI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (newId: string) => void;
  type: 'Vendor' | 'Customer';
};

export default function QuickAddVendorDialog({ open, onClose, onSuccess, type }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Internal
  const [formData, setFormData] = useState({
    nama_partner: '',
    npwp: '',
    no_telp: '',
    email: '',
    nama_sales: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.nama_partner) return;

    setIsSubmitting(true);
    try {
      // 1. Generate ID
      const nowStr = dayjs().format('YYMMDD-HHmm');
      const newId = `VEND-${nowStr}`;

      // 2. Payload
      const payload = {
        id_partner: newId,
        tipe: type,
        ...formData,
      };

      // 3. API Call
      await axios.post(endpoints.master.partners.root, payload);

      enqueueSnackbar('Vendor berhasil ditambahkan!', { variant: 'success' });

      // 4. Reset & Notify Parent
      setFormData({ nama_partner: '', npwp: '', no_telp: '', email: '', nama_sales: '' });
      onSuccess(newId); // <--- KUNCI: Kirim ID baru ke Parent
      onClose();

    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menambah vendor', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah {type} Baru</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label={`Nama ${type} *`}
            name="nama_partner"
            value={formData.nama_partner}
            onChange={handleChange}
            placeholder="PT. Sinar Jaya Abadi"
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label="NPWP"
            name="npwp"
            value={formData.npwp}
            onChange={handleChange}
            placeholder="00.000.000.0-000.000"
            fullWidth
            disabled={isSubmitting}
          />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="No. Telepon"
              name="no_telp"
              value={formData.no_telp}
              onChange={handleChange}
              fullWidth
              disabled={isSubmitting}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              disabled={isSubmitting}
            />
          </Box>

          <TextField
            label="Nama Sales / PIC"
            name="nama_sales"
            value={formData.nama_sales}
            onChange={handleChange}
            fullWidth
            helperText="Nama sales yang biasa dihubungi"
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Batal
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!formData.nama_partner}
        >
          Simpan {type}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}