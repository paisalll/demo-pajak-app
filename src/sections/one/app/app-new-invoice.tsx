// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Card, { CardProps } from '@mui/material/Card';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  invoiceNumber: string;
  createDate: Date | string | number;
  price: number;
  coa: string;
  invoiceTo: {
    name: string;
  };
  taxes?: number;
  status: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
  onViewDetail?: (id: string) => void; 
}

export default function AppNewInvoice({
  title,
  subheader,
  tableData,
  tableLabels,
  onViewDetail,
  ...other
}: Props) {
  return (
    <Card {...other}>
      {title && <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />}

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <AppNewInvoiceRow 
                    key={row.id} 
                    row={row} 
                    // TAMBAHAN 2: Teruskan fungsi ke Row
                    onViewRow={() => onViewDetail && onViewDetail(row.id)}
                />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          Lihat Semua
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type AppNewInvoiceRowProps = {
  row: RowProps;
  // TAMBAHAN 3: Definisi tipe prop di Row
  onViewRow: VoidFunction; 
};

function AppNewInvoiceRow({ row, onViewRow }: AppNewInvoiceRowProps) {
  const popover = usePopover();

  // TAMBAHAN 4: Fungsi Handler Klik Detail
  const handleViewDetail = () => {
    popover.onClose();
    onViewRow(); // Panggil fungsi dari parent
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row.id);
  };

  const taxAmount = row.taxes || row.price * 0.11;

  return (
    <>
      <TableRow>
        <TableCell>{fDate(row.createDate)}</TableCell>
        <TableCell>{row.invoiceNumber}</TableCell>
        <TableCell>{row.invoiceTo.name}</TableCell>
        <TableCell>{row.coa}</TableCell>
        <TableCell>{fCurrency(row.price)}</TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>{fCurrency(taxAmount)}</TableCell>
        
        <TableCell align="right" sx={{ pr: 1 }}>
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
        {/* Update tombol Detail untuk memanggil handleViewDetail */}
        <MenuItem onClick={handleViewDetail}>
          <Iconify icon="solar:round-graph-bold" />
          Detail
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}