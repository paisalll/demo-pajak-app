import { format } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: any; // Atau definisikan Interface Transaction
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function TransactionTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { 
    no_invoice, 
    tanggal_pencatatan, 
    type, 
    total_dpp, 
    total_transaksi,
    total_ppn,
    total_pph,
    m_company,
    m_coa_debit,
    m_coa_kredit,
    id_akun_debit,
    id_akun_kredit 
  } = row;

  const popover = usePopover();

  // Logic Hitung Pajak Bersih (PPN - PPh)
  const netPajak = (Number(total_ppn) || 0) - (Number(total_pph) || 0);

  // Logic Tampilan Akun (Debit utk Pembelian, Kredit utk Penjualan)
  // Atau tampilkan sesuai kebutuhan
  const akunDisplay = type === 'penjualan' ? m_coa_kredit?.nama_akun : m_coa_debit?.nama_akun;
  const coaCode = type === 'penjualan' ? id_akun_kredit : id_akun_debit;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {/* Tanggal */}
        <TableCell>
          <ListItemText
            primary={format(new Date(tanggal_pencatatan), 'dd MMM yyyy')}
            secondary={format(new Date(tanggal_pencatatan), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        {/* No Invoice & Company */}
        <TableCell>
            <ListItemText
                primary={no_invoice}
                secondary={m_company?.nama_perusahaan || '-'}
                primaryTypographyProps={{ typography: 'body2', fontWeight: 'bold' }}
                secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
            />
        </TableCell>

        {/* Nama Akun */}
        <TableCell>{akunDisplay || '-'}</TableCell>

        {/* Kode COA */}
        <TableCell>
            <Label variant="soft" color="default">
                {coaCode}
            </Label>
        </TableCell>

        {/* Tipe Transaksi */}
        <TableCell>
          <Label
            variant="soft"
            color={
              (type === 'penjualan' && 'success') ||
              (type === 'pembelian' && 'info') ||
              'default'
            }
          >
            {type}
          </Label>
        </TableCell>

        {/* Nominal DPP */}
        <TableCell>{fCurrency(total_dpp)}</TableCell>

        {/* Total Transaksi */}
        <TableCell>
            <Box sx={{ fontWeight: 'bold' }}>{fCurrency(total_transaksi)}</Box>
        </TableCell>

        {/* Pajak (Net & Detail) */}
        <TableCell>
            <Box sx={{ 
                color: netPajak >= 0 ? 'text.primary' : 'error.main', 
                fontWeight: 'bold' 
            }}>
                {fCurrency(netPajak)}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
               PPN: {fCurrency(total_ppn)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
               PPh: {fCurrency(total_pph)}
            </Typography>
        </TableCell>

        {/* Action Button (Titik Tiga) */}
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            onDeleteRow();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}