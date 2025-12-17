import React, { useState, useCallback, useEffect, useMemo } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User Biasa' },
];

export default function UserListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // STATE DATA
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE MODAL FORM
  const [openForm, setOpenForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // Data user yang sedang diedit
  const [showPassword, setShowPassword] = useState(false);
  
  // STATE FORM INPUT
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'user' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE DELETE
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- DEFINISI KOLOM ---
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'id_user', 
      headerName: 'ID User', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary" noWrap>
           {params.value}
        </Typography>
      )
    },
    {
      field: 'username',
      headerName: 'Username',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={2}>
           {/* Avatar Dummy (Optional) */}
           <Box
             component="img"
             alt={params.value}
             src={`https://api.dicebear.com/7.x/initials/svg?seed=${params.value}`}
             sx={{ width: 32, height: 32, borderRadius: '50%' }}
           />
           <Typography variant="subtitle2">{params.value}</Typography>
        </Stack>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Label
          variant="soft"
          color={params.value === 'admin' ? 'primary' : 'default'}
          sx={{ textTransform: 'capitalize' }}
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
             setDeleteId(params.row.id_user);
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
      const response = await axios.get(endpoints.users);
      setTableData(response.data);
    } catch (error) {
      console.error("Gagal load users", error);
      enqueueSnackbar('Gagal mengambil data user', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FORM HANDLERS ---
  const handleOpenAdd = () => {
    setCurrentUser(null);
    setFormData({ username: '', password: '', role: 'user' });
    setOpenForm(true);
  };

  const handleOpenEdit = (row: any) => {
    setCurrentUser(row);
    // Password dikosongkan saat edit (karena ter-hash). User isi jika ingin ganti.
    setFormData({ 
        username: row.username, 
        password: '', 
        role: row.role 
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setShowPassword(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Logic Payload
      const payload: any = { ...formData };
      
      // Jika Mode Edit & Password Kosong -> Hapus field password agar tidak diupdate jadi string kosong
      if (currentUser && payload.password === '') {
          delete payload.password;
      }

      if (currentUser) {
        // UPDATE (PATCH)
        await axios.patch(`${endpoints.users}/${currentUser.id_user}`, payload);
        enqueueSnackbar('Update user berhasil!');
      } else {
        // CREATE (POST)
        await axios.post(endpoints.users, payload);
        enqueueSnackbar('User baru berhasil dibuat!');
      }

      fetchData(); // Refresh Data
      handleCloseForm();
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || 'Gagal menyimpan data';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${endpoints.users}/${deleteId}`);
      enqueueSnackbar('User berhasil dihapus!');
      fetchData();
      setOpenConfirm(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menghapus user', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
            <Typography variant="h4">Manajemen User</Typography>
            <Typography variant="body2" color="text.secondary">Kelola akses pengguna aplikasi</Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenAdd}
        >
          Tambah User
        </Button>
      </Stack>

      {/* DATA GRID */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={tableData}
                columns={columns}
                getRowId={(row) => row.id_user}
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
        <DialogTitle>{currentUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                
                {/* ID USER (Read Only saat Edit) */}
                {currentUser && (
                    <TextField
                        label="ID User"
                        value={currentUser.id_user}
                        disabled
                        fullWidth
                        variant="filled"
                    />
                )}

                <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    required
                />

                <TextField
                    label={currentUser ? "Password Baru (Opsional)" : "Password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required={!currentUser} // Wajib jika Create, Optional jika Edit
                    helperText={currentUser ? "Biarkan kosong jika tidak ingin mengubah password" : ""}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                          </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    select
                    label="Role / Hak Akses"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    fullWidth
                >
                    {ROLE_OPTIONS.map((option) => (
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
                disabled={!formData.username || (!currentUser && !formData.password)}
            >
                Simpan
            </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Hapus User"
        content={
            <>
                Apakah Anda yakin ingin menghapus user ini? 
                <br /> 
                Akses login mereka akan dicabut permanen.
            </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Hapus
          </Button>
        }
      />

    </Container>
  );
}