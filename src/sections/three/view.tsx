import React, { useState, useCallback, useEffect, useMemo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
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
  GridPaginationModel,
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

export default function CoaListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // STATE DATA
  const [tableData, setTableData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE PAGINATION
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // STATE MODAL FORM
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ id_coa: '', nama_akun: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE DELETE CONFIRM
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- COLUMNS ---
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'id_coa', 
      headerName: 'Kode Akun (COA)', 
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      )
    },
    {
      field: 'nama_akun',
      headerName: 'Nama Akun',
      flex: 2,
      minWidth: 250,
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
             setDeleteId(params.id as string);
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
      // Sesuaikan endpoint get list COA Anda
      // Jika endpoint Anda support pagination, kirim params page/limit.
      // Jika tidak (ambil semua), pagination dilakukan di client-side (DataGrid bisa handle).
      // Asumsi: Endpoint '/master/coa' mengambil SEMUA data (karena master data biasanya sedikit)
      
      const response = await axios.get(endpoints.master.coa.root); 
      // Jika response backend Anda array langsung: response.data
      // Jika response backend terbungkus: response.data.data
      setTableData(response.data);
      setTotalData(response.data.length);

    } catch (error) {
      console.error("Gagal load COA", error);
      enqueueSnackbar('Gagal mengambil data COA', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS FORM ---
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ id_coa: '', nama_akun: '' });
    setOpenForm(true);
  };

  const handleOpenEdit = (row: any) => {
    setIsEdit(true);
    setFormData({ id_coa: row.id_coa, nama_akun: row.nama_akun });
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
        // Edit
        await axios.put(`${endpoints.master.coa.root}/${formData.id_coa}`, formData);
        enqueueSnackbar('Update berhasil!');
      } else {
        // Create
        await axios.post(endpoints.master.coa.root, formData);
        enqueueSnackbar('Buat COA baru berhasil!');
      }
      fetchData(); // Refresh table
      handleCloseForm();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menyimpan data', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS DELETE ---
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${endpoints.master.coa.root}/${deleteId}`);
      enqueueSnackbar('Hapus data berhasil!');
      fetchData();
      setOpenConfirm(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menghapus data. Mungkin sedang digunakan di transaksi.', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Master Chart of Accounts (COA)</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenAdd}
        >
          Tambah Akun
        </Button>
      </Stack>

      {/* DATA GRID */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={tableData}
                columns={columns}
                getRowId={(row) => row.id_coa}
                loading={isLoading}
                
                // Pagination Client-Side (Karena data master biasanya < 1000 baris)
                // Jika ingin server-side, ganti prop seperti di TransactionView
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50]}
                
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                    },
                }}
                disableRowSelectionOnClick
            />
        </Box>
      </Card>

      {/* MODAL FORM ADD/EDIT */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Akun COA' : 'Tambah Akun Baru'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    label="Kode Akun (ID COA)"
                    name="id_coa"
                    value={formData.id_coa}
                    onChange={handleChange}
                    disabled={isEdit} // Primary Key tidak boleh diedit
                    fullWidth
                    required
                    helperText="Contoh: 1-1000"
                />
                <TextField
                    label="Nama Akun"
                    name="nama_akun"
                    value={formData.nama_akun}
                    onChange={handleChange}
                    fullWidth
                    required
                    helperText="Contoh: Kas Besar, Piutang Usaha"
                />
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseForm} color="inherit">Batal</Button>
            <LoadingButton 
                onClick={handleSubmit} 
                variant="contained" 
                loading={isSubmitting}
                disabled={!formData.id_coa || !formData.nama_akun}
            >
                Simpan
            </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* DIALOG CONFIRM DELETE */}
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Hapus Akun"
        content="Apakah Anda yakin ingin menghapus akun COA ini? Data yang dihapus tidak dapat dikembalikan."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Hapus
          </Button>
        }
      />

    </Container>
  );
}