import React, { useState, useCallback, useEffect, useMemo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';

import { 
  DataGrid, 
  GridColDef, 
  GridToolbar, 
  GridActionsCellItem,
  GridRowParams,
  GridRenderCellParams,
} from '@mui/x-data-grid';

// components
import Iconify from 'src/components/iconify'; 
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function TaxListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // STATE TABS
  const [currentTab, setCurrentTab] = useState('ppn'); // 'ppn' or 'pph'

  // STATE DATA
  const [ppnData, setPpnData] = useState([]);
  const [pphData, setPphData] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]); // Untuk Dropdown Akun
  const [isLoading, setIsLoading] = useState(false);

  // STATE FORM
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Form Data (Bisa untuk PPN atau PPh)
  const [formData, setFormData] = useState<any>({});

  // STATE DELETE
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // --- FETCH DATA (PPN, PPh, COA) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load Parallel agar cepat
      const [resPpn, resPph, resCoa] = await Promise.all([
        axios.get(endpoints.master.ppn.root),
        axios.get(endpoints.master.pph.root),
        axios.get(endpoints.master.coa.root),
      ]);

      setPpnData(resPpn.data);
      setPphData(resPph.data);
      setCoaOptions(resCoa.data);

    } catch (error) {
      console.error("Gagal load data pajak", error);
      enqueueSnackbar('Gagal mengambil data master', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- KOLOM DATA GRID ---
  
  // 1. Kolom PPN
  const ppnColumns: GridColDef[] = useMemo(() => [
    { field: 'label', headerName: 'Nama Pajak', flex: 1, minWidth: 150 },
    { 
      field: 'rate', headerName: 'Tarif (%)', width: 100,
      valueFormatter: (params: any) => `${Number(params) * 100}%` // 0.11 -> 11%
    },
    {
      field: 'coa_keluaran', headerName: 'Akun PPN Keluaran (Jual)', flex: 1, minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.row?.coa_keluaran?.id_coa}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.coa_keluaran?.nama_akun}</Typography>
        </Stack>
      )
    },
    {
      field: 'coa_masukan', headerName: 'Akun PPN Masukan (Beli)', flex: 1, minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.row?.coa_masukan?.id_coa}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.coa_masukan?.nama_akun}</Typography>
        </Stack>
      )
    },
    {
      field: 'actions', type: 'actions', headerName: 'Aksi', width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem icon={<Iconify icon="solar:pen-bold" />} label="Edit" onClick={() => handleOpenEdit(params.row)} showInMenu />,
        <GridActionsCellItem icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />} label="Delete" onClick={() => { setDeleteId(params.row.id_ppn); setOpenConfirm(true); }} showInMenu />,
      ],
    },
  ], []);

  // 2. Kolom PPh
  const pphColumns: GridColDef[] = useMemo(() => [
    { field: 'label', headerName: 'Nama Pajak', flex: 1, minWidth: 150 },
    { 
      field: 'rate', headerName: 'Tarif (%)', width: 100,
      valueFormatter: (params: any) => `${Number(params) * 100}%`
    },
    { field: 'jenis_pph', headerName: 'Jenis PPh', width: 150 },
    {
      field: 'coa_penjualan_pph', headerName: 'Akun Saat Penjualan', flex: 1, minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.row?.coa_penjualan?.id_coa}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row?.coa_penjualan ?.nama_akun}</Typography>
        </Stack>
      )
    },
    {
      field: 'coa_pembelian', headerName: 'Akun Saat Pembelian', flex: 1, minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.row?.coa_pembelian?.id_coa}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.coa_pembelian?.nama_akun}</Typography>
        </Stack>
      )
    },
    {
      field: 'actions', type: 'actions', headerName: 'Aksi', width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem icon={<Iconify icon="solar:pen-bold" />} label="Edit" onClick={() => handleOpenEdit(params.row)} showInMenu />,
        <GridActionsCellItem icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />} label="Delete" onClick={() => { setDeleteId(params.row.id_pph); setOpenConfirm(true); }} showInMenu />,
      ],
    },
  ], []);


  // --- FORM HANDLERS ---
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    // Init form kosong sesuai Tab
    if (currentTab === 'ppn') {
        setFormData({ label: '', rate: '', id_coa_keluaran: '', id_coa_masukan: '' });
    } else {
        setFormData({ label: '', rate: '', jenis_pph: '', id_coa_penjualan: '', id_coa_pembelian: '' });
    }
    setOpenForm(true);
  };

  const handleOpenEdit = (row: any) => {
    setIsEdit(true);
    // Clone row data to form, convert rate decimal to percent (0.11 -> 11)
    const data = { ...row, rate: Number(row.rate) * 100 };
    setFormData(data);
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData, rate: Number(formData.rate) / 100 };

      delete payload.coa_keluaran;    // Relasi PPN
      delete payload.coa_masukan;     // Relasi PPN
      delete payload.coa_penjualan;   // Relasi PPh
      delete payload.coa_pembelian;   // Relasi PPh
      delete payload.transaksi_pajak; // Relasi Balik
      delete payload.id_ppn;
      delete payload.id_pph;

      const endpoint = currentTab === 'ppn' ? endpoints.master.ppn.root : endpoints.master.pph.root;
      const id = currentTab === 'ppn' ? formData.id_ppn : formData.id_pph;

      if (isEdit) {
        await axios.patch(`${endpoint}/${id}`, payload);
        enqueueSnackbar(`Update ${currentTab.toUpperCase()} berhasil!`);
      } else {
        await axios.post(endpoint, payload);
        enqueueSnackbar(`${currentTab.toUpperCase()} baru berhasil dibuat!`);
      }
      
      fetchData();
      handleCloseForm();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menyimpan data', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const endpoint = currentTab === 'ppn' ? endpoints.master.ppn.root : endpoints.master.pph.root;
      await axios.delete(`${endpoint}/${deleteId}`);
      enqueueSnackbar('Data berhasil dihapus!');
      fetchData();
      setOpenConfirm(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menghapus data', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
            <Typography variant="h4">Master Pajak</Typography>
            <Typography variant="body2" color="text.secondary">
                Pengaturan PPN & PPh
            </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenAdd}
        >
          Tambah {currentTab === 'ppn' ? 'PPN' : 'PPh'}
        </Button>
      </Stack>

      {/* TABS */}
      <Card sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 2, bgcolor: 'background.neutral' }}>
              <Tab value="ppn" label="PPN (Pertambahan Nilai)" />
              <Tab value="pph" label="PPh (Penghasilan)" />
          </Tabs>
      </Card>

      {/* DATA GRID */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                // Switch Data & Columns based on Tab
                rows={currentTab === 'ppn' ? ppnData : pphData}
                columns={currentTab === 'ppn' ? ppnColumns : pphColumns}
                getRowId={(row) => currentTab === 'ppn' ? row.id_ppn : row.id_pph}
                loading={isLoading}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true } }}
            />
        </Box>
      </Card>

      {/* MODAL FORM (DYNAMIC) */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
            {isEdit ? 'Edit' : 'Tambah'} {currentTab === 'ppn' ? 'PPN' : 'PPh'}
        </DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                
                {/* 1. Label & Rate (Common Fields) */}
                <TextField
                    label="Nama Pajak"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    fullWidth required
                    placeholder={currentTab === 'ppn' ? "PPN 11%" : "PPh 23"}
                />
                <TextField
                    label="Tarif (%)"
                    type="number"
                    value={formData.rate || ''}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    fullWidth required
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    helperText="Masukkan angka persen (cth: 11 untuk 11%)"
                />

                {/* 2. Specific Fields PPN */}
                {currentTab === 'ppn' && (
                    <>
                        {/* COA Keluaran (Penjualan) */}
                        <Autocomplete
                            options={coaOptions}
                            getOptionLabel={(option: any) => `${option.id_coa} - ${option.nama_akun}`}
                            value={coaOptions.find((c: any) => c.id_coa === formData.id_coa_keluaran) || null}
                            onChange={(_, newValue: any) => setFormData({ ...formData, id_coa_keluaran: newValue?.id_coa || '' })}
                            renderInput={(params) => <TextField {...params} label="Akun PPN Keluaran (Saat Jual)" placeholder="Biasanya Hutang PPN" />}
                        />
                         {/* COA Masukan (Pembelian) */}
                         <Autocomplete
                            options={coaOptions}
                            getOptionLabel={(option: any) => `${option.id_coa} - ${option.nama_akun}`}
                            value={coaOptions.find((c: any) => c.id_coa === formData.id_coa_masukan) || null}
                            onChange={(_, newValue: any) => setFormData({ ...formData, id_coa_masukan: newValue?.id_coa || '' })}
                            renderInput={(params) => <TextField {...params} label="Akun PPN Masukan (Saat Beli)" placeholder="Biasanya Piutang/Aset PPN" />}
                        />
                    </>
                )}

                {/* 3. Specific Fields PPh */}
                {currentTab === 'pph' && (
                    <>
                         <TextField
                            label="Jenis PPh"
                            value={formData.jenis_pph || ''}
                            onChange={(e) => setFormData({ ...formData, jenis_pph: e.target.value })}
                            fullWidth
                            placeholder="Final / Non-Final"
                        />
                        {/* COA Penjualan (Customer potong PPh kita -> Prepaid Tax) */}
                        <Autocomplete
                            options={coaOptions}
                            getOptionLabel={(option: any) => `${option.id_coa} - ${option.nama_akun}`}
                            value={coaOptions.find((c: any) => c.id_coa === formData.id_coa_penjualan) || null}
                            onChange={(_, newValue: any) => setFormData({ ...formData, id_coa_penjualan: newValue?.id_coa || '' })}
                            renderInput={(params) => <TextField {...params} label="Akun PPh Penjualan" helperText="Akun untuk menampung PPh yang dipotong Customer (Prepaid)" />}
                        />
                         {/* COA Pembelian (Kita potong PPh Vendor -> Hutang PPh) */}
                         <Autocomplete
                            options={coaOptions}
                            getOptionLabel={(option: any) => `${option.id_coa} - ${option.nama_akun}`}
                            value={coaOptions.find((c: any) => c.id_coa === formData.id_coa_pembelian) || null}
                            onChange={(_, newValue: any) => setFormData({ ...formData, id_coa_pembelian: newValue?.id_coa || '' })}
                            renderInput={(params) => <TextField {...params} label="Akun PPh Pembelian" helperText="Akun untuk menampung PPh yang kita potong dari Vendor (Hutang)" />}
                        />
                    </>
                )}

            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseForm} color="inherit">Batal</Button>
            <LoadingButton 
                onClick={handleSubmit} 
                variant="contained" 
                loading={isSubmitting}
                disabled={!formData.label || !formData.rate}
            >
                Simpan
            </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Hapus Pajak"
        content="Apakah Anda yakin ingin menghapus data pajak ini?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Hapus
          </Button>
        }
      />

    </Container>
  );
}