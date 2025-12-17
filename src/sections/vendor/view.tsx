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
import LoadingButton from '@mui/lab/LoadingButton';

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
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function VendorListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // STATE DATA
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // STATE FORM
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  // Default Tipe = 'Vendor'
  const [formData, setFormData] = useState({ 
    id_partner: '', 
    nama_partner: '', 
    npwp: '', 
    tipe: 'Vendor' // <--- HARDCODE 'Vendor'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE DELETE
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- COLUMNS ---
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'id_partner', 
      headerName: 'ID Vendor', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      )
    },
    {
      field: 'nama_partner',
      headerName: 'Nama Vendor (Supplier)',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'npwp',
      headerName: 'NPWP',
      width: 180,
    },
    // Kolom Tipe kita HAPUS/SKIP karena semua disini pasti Vendor
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Aksi',
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleOpenEdit(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Iconify icon="solar:trash-bin-trash-bold" color="error.main" />}
          label="Delete"
          onClick={() => {
             setDeleteId(params.row.id_partner);
             setOpenConfirm(true);
          }}
          showInMenu
        />,
      ],
    },
  ], []);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(endpoints.master.partners.root);
      
      // FILTER CLIENT SIDE: HANYA VENDOR
      const onlyVendors = response.data.filter((item: any) => item.tipe === 'Vendor');
      
      setTableData(onlyVendors);
    } catch (error) {
      console.error("Gagal load vendor", error);
      enqueueSnackbar('Gagal mengambil data vendor', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS FORM ---
  const handleOpenAdd = () => {
    setIsEdit(false);
    // Reset form tapi pastikan tipe tetap 'Vendor'
    setFormData({ id_partner: '', nama_partner: '', npwp: '', tipe: 'Vendor' });
    setOpenForm(true);
  };

  const handleOpenEdit = (row: any) => {
    setIsEdit(true);
    setFormData({ 
        id_partner: row.id_partner, 
        nama_partner: row.nama_partner, 
        npwp: row.npwp || '', 
        tipe: 'Vendor' 
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Payload otomatis membawa tipe: 'Vendor'
      if (isEdit) {
        await axios.patch(`${endpoints.master.partners.root}/${formData.id_partner}`, formData);
        enqueueSnackbar('Update vendor berhasil!');
      } else {
        await axios.post(endpoints.master.partners.root, formData);
        enqueueSnackbar('Vendor baru berhasil dibuat!');
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

  // --- HANDLER DELETE ---
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${endpoints.master.partners.root}/${deleteId}`);
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
            <Typography variant="h4">Master Vendor</Typography>
            <Typography variant="body2" color="text.secondary">
                Daftar Supplier / Pemasok
            </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenAdd}
        >
          Tambah Vendor
        </Button>
      </Stack>

      {/* DATA GRID */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={tableData}
                columns={columns}
                getRowId={(row) => row.id_partner}
                loading={isLoading}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: { 
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 }
                    },
                }}
            />
        </Box>
      </Card>

      {/* MODAL FORM */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Vendor' : 'Tambah Vendor Baru'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    label="ID Vendor"
                    name="id_partner"
                    value={formData.id_partner}
                    onChange={handleChange}
                    disabled={isEdit} 
                    fullWidth
                    required
                    helperText="Contoh: VEND-001"
                />
                <TextField
                    label="Nama Vendor (PT/CV/Perorangan)"
                    name="nama_partner"
                    value={formData.nama_partner}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    label="NPWP"
                    name="npwp"
                    value={formData.npwp}
                    onChange={handleChange}
                    fullWidth
                    placeholder="00.000.000.0-000.000"
                />
                
                {/* Field Tipe kita sembunyikan atau buat Read Only jika ingin ditampilkan */}
                <TextField
                    label="Tipe"
                    value="Vendor"
                    disabled
                    fullWidth
                    variant="filled"
                    helperText="Tipe otomatis diset sebagai Vendor"
                />
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseForm} color="inherit">Batal</Button>
            <LoadingButton 
                onClick={handleSubmit} 
                variant="contained" 
                loading={isSubmitting}
                disabled={!formData.id_partner || !formData.nama_partner}
            >
                Simpan
            </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Hapus Vendor"
        content="Apakah Anda yakin ingin menghapus vendor ini? Data yang terhapus tidak dapat dikembalikan."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Hapus
          </Button>
        }
      />

    </Container>
  );
}