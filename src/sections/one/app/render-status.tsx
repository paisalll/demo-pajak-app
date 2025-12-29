import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'src/components/snackbar';
import Label from 'src/components/label'; // Sesuaikan path komponen Label Anda
import Iconify from 'src/components/iconify'; // Sesuaikan path
import axios, { endpoints } from 'src/utils/axios';

// Props yang dibutuhkan
type RenderStatusProps = {
  id: string;
  status: number;
  onSuccess: () => void; // Callback untuk refresh tabel setelah update
};

export default function RenderStatus({ id, status, onSuccess }: RenderStatusProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdate = async (newStatus: number) => {
    handleClose();
    setIsLoading(true);

    try {
      const safeId = encodeURIComponent(id);
      
      await axios.patch(`${endpoints.transaction}/${safeId}/status`, {
        status_pembayaran: newStatus
      });

      enqueueSnackbar('Status berhasil diperbarui!', { variant: 'success' });
      
      onSuccess();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal update status', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Label
        variant="soft"
        color={status === 1 ? 'success' : 'error'}
        sx={{ 
            textTransform: 'capitalize', 
            cursor: 'pointer',
            '&:hover': { opacity: 0.7 } 
        }}
        onClick={handleClick}
        endIcon={<Iconify icon={open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} width={16} sx={{ ml: 0.5 }} />}
      >
        {status === 1 ? 'Paid' : 'Unpaid'}
      </Label>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem 
            onClick={() => handleUpdate(1)} 
            selected={status === 1}
            sx={{ color: 'success.main' }}
        >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 1 }} />
            Set Paid (Lunas)
        </MenuItem>

        <MenuItem 
            onClick={() => handleUpdate(0)} 
            selected={status === 0}
            sx={{ color: 'error.main' }}
        >
            <Iconify icon="eva:close-circle-fill" sx={{ mr: 1 }} />
            Set Unpaid (Belum)
        </MenuItem>
      </Menu>
    </>
  );
}