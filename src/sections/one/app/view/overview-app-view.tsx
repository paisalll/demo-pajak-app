import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

// routes
import { paths } from 'src/routes/paths';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// utils
import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

// Analytics Component (Bisa pakai InvoiceAnalytic bawaan template)
import InvoiceAnalytic from '../invoice-analytic'; 

// Child Components
import TransactionTableRow from '../TransactionTableRow';
// import TransactionTableToolbar from '../TransactionTableToolbar'; // (Opsional: search bar)

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'tanggal', label: 'Tanggal' },
  { id: 'no_invoice', label: 'No. Invoice' },
  { id: 'coa', label: 'COA' },
  { id: 'tipe', label: 'Tipe' },
  { id: 'nominal', label: 'Subtotal' },
  { id: 'total', label: 'Total Transaksi' },
  { id: 'pajak', label: 'Net Pajak' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  status: 'all', // status disini kita pakai untuk 'type' (penjualan/pembelian)
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const theme = useTheme();

  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'created_at' });
  const confirm = useBoolean();

  // State Data
  const [tableData, setTableData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [summary, setSummary] = useState({
    total_dpp: 0,
    total_transaksi: 0,
    total_ppn: 0,
    total_pph: 0,
    net_pajak: 0
  });

  const [filters, setFilters] = useState(defaultFilters);

  // --- FETCH DATA DARI API (Server Side Filtering) ---
  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: table.page + 1, // table.page MUI mulai dari 0, Backend page mulai dari 1
        limit: table.rowsPerPage,
      };

      
      // Mapping Filter Frontend ke Backend API
      if (filters.status !== 'all') {
        params.type = filters.status;
      }
      if (filters.name) {
        params.search = filters.name;
      }
      // Jika ada filter tanggal, bisa dikirim month/year
      if (filters.startDate) {
         params.month = new Date(filters.startDate).getMonth() + 1;
         params.year = new Date(filters.startDate).getFullYear();
      }

      const response = await axios.get(endpoints.transaction, { params });
      
      setTableData(response.data.data);
      setSummary(response.data.summary);
      setTotalData(response.data.meta.total_items);

    } catch (error) {
      console.error("Gagal load transaksi", error);
    }
  }, [filters]);

  // Panggil fetch data saat filter berubah
  useEffect(() => {
    fetchData();
  }, [fetchData, table.page, table.rowsPerPage]);
  // ---------------------------------------------------

  const dataFiltered = tableData; // Karena filtering sudah di server, dataFiltered = tableData
  
  const denseHeight = table.dense ? 56 : 76;
  const notFound = !dataFiltered.length;

  // Tabs Configuration
  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    { value: 'penjualan', label: 'Penjualan', color: 'success', count: tableData.filter((i:any) => i.type === 'penjualan').length },
    { value: 'pembelian', label: 'Pembelian', color: 'info', count: tableData.filter((i:any) => i.type === 'pembelian').length },
  ] as const;

  const handleFilters = useCallback(
    (name: string, value: any) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleDeleteRow = useCallback(async (id: string) => {
      // Logic Delete API here
      // await axios.delete(endpoints.transaction + `/${id}`);
      // fetchData();
  }, []);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.two);
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Daftar Transaksi"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* --- SUMMARY CARDS (Total Transaksi & DPP) --- */}
      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <InvoiceAnalytic
              title="Total Transaksi"
              total={dataFiltered.length}
              percent={100}
              price={summary.total_transaksi}
              icon="solar:bill-list-bold-duotone"
              color={theme.palette.info.main} // theme.palette.primary.main  
            />

            <InvoiceAnalytic
              title="Total DPP"
              total={dataFiltered.length}
              percent={100}
              price={summary.total_dpp}
              icon="solar:file-check-bold-duotone"
              color={theme.palette.success.main} // theme.palette.success.main
            />

            <InvoiceAnalytic
              title="Total PPN"
              total={dataFiltered.length}
              percent={100}
              price={summary.total_ppn}
              icon="solar:sort-by-time-bold-duotone"
              color={theme.palette.warning.main} // theme.palette.warning.main
            />
             
             {/* Menampilkan Net Pajak */}
             <InvoiceAnalytic
              title="Net Pajak (PPN - PPh)"
              total={dataFiltered.length}
              percent={100}
              price={summary.net_pajak}
              icon="solar:bell-bing-bold-duotone"
              color={theme.palette.error.main} // theme.palette.error.main
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Card>
        {/* --- TABS FILTER (All / Penjualan / Pembelian) --- */}
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'}
                  color={tab.color}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        {/* --- TOOLBAR (Search & Date) --- */}
        {/* Anda bisa menggunakan komponen InvoiceTableToolbar bawaan template, 
            cukup mapping props onFilters-nya */}
        
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(checked, tableData.map((row: any) => row.id_transaksi))
            }
            action={
              <Stack direction="row">
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(checked, tableData.map((row: any) => row.id_transaksi))
                }
              />

              <TableBody>
                {dataFiltered
                  .map((row: any) => (
                    <TransactionTableRow
                      key={row.id_transaksi}
                      row={row}
                      selected={table.selected.includes(row.id_transaksi)}
                      onSelectRow={() => table.onSelectRow(row.id_transaksi)}
                      onEditRow={() => handleEditRow(row.id_transaksi)}
                      onDeleteRow={() => handleDeleteRow(row.id_transaksi)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={totalData}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}