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
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const TIPE_OPTIONS = [
  { value: 'Customer', label: 'Customer (Pelanggan)' },
  { value: 'Vendor', label: 'Vendor (Supplier)' },
];

export default function PartnerListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // STATE DATA
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // STATE FORM
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ 
    id_partner: '', 
    nama_partner: '', 
    npwp: '', 
    tipe: 'Customer' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE DELETE
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- COLUMNS ---
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'id_partner', 
      headerName: 'ID Partner', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      )
    },
    {
      field: 'nama_partner',
      headerName: 'Nama Partner',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'npwp',
      headerName: 'NPWP',
      width: 180,
    },
    {
      field: 'tipe',
      headerName: 'Tipe',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Label
          variant="soft"
          color={params.value === 'Customer' ? 'success' : 'warning'}
        >
          {params.value}
        </Label>
      ),
    },
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
      setTableData(response.data);
    } catch (error) {
      console.error("Gagal load partners", error);
      enqueueSnackbar('Gagal mengambil data partner', { variant: 'error' });
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
    setFormData({ id_partner: '', nama_partner: '', npwp: '', tipe: 'Customer' });
    setOpenForm(true);
  };

  const handleOpenEdit = (row: any) => {
    setIsEdit(true);
    setFormData({ 
        id_partner: row.id_partner, 
        nama_partner: row.nama_partner, 
        npwp: row.npwp || '', 
        tipe: row.tipe || 'Customer' 
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
      if (isEdit) {
        // UPDATE (PATCH)
        await axios.patch(`${endpoints.master.partners.root}/${formData.id_partner}`, formData);
        enqueueSnackbar('Update berhasil!');
      } else {
        // CREATE (POST)
        await axios.post(endpoints.master.partners.root, formData);
        enqueueSnackbar('Partner baru berhasil dibuat!');
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
      enqueueSnackbar('Gagal menghapus data (mungkin sedang digunakan)', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
            <Typography variant="h4">Master Partner</Typography>
            <Typography variant="body2" color="text.secondary">
                Data Customer & Vendor
            </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenAdd}
        >
          Tambah Partner
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
                    toolbar: { showQuickFilter: true },
                }}
            />
        </Box>
      </Card>

      {/* MODAL FORM */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Partner' : 'Tambah Partner Baru'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    label="ID Partner"
                    name="id_partner"
                    value={formData.id_partner}
                    onChange={handleChange}
                    disabled={isEdit} // Primary Key gaboleh diedit
                    fullWidth
                    required
                    helperText="Contoh: CUST-001 atau VEND-001"
                />
                <TextField
                    label="Nama Partner"
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
                <TextField
                    select
                    label="Tipe Partner"
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleChange}
                    fullWidth
                    required
                >
                    {TIPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
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
        title="Hapus Partner"
        content="Apakah Anda yakin ingin menghapus data ini? Data yang terhapus tidak dapat dikembalikan."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Hapus
          </Button>
        }
      />

    </Container>
  );
}