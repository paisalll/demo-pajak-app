import React, { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

// components
import Iconify from 'src/components/iconify'; // <--- Import Iconify
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useSettingsContext } from 'src/components/settings';

// _mock
import { _appInvoices } from 'src/_mock';

// components (Custom Anda)
import AppNewInvoice from './app-new-invoice';
import AppWidgetSummary from './app-widget-summary';
import { emptyRows, TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom, TableSelectedAction, useTable } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Tab, Table, TableBody, TableContainer, Tabs, Tooltip } from '@mui/material';
import Label from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import TransactionTableRow from './TransactionTableRow';

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
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const START_YEAR = 2023;
const YEARS = Array.from({ length: 7 }, (_, i) => START_YEAR + i);

const defaultFilters = {
  name: '',
  status: 'all', // status disini kita pakai untuk 'type' (penjualan/pembelian)
  startDate: null,
  endDate: null,
};
// ----------------------------------------------------------------------

export default function ThreeView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'created_at' });
  const confirm = useBoolean();
  

  // STATE
  type Invoice = (typeof _appInvoices)[number];
  const [currentTab, setCurrentTab] = useState<'list' | 'detail'>('list'); // 'list' | 'detail'
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(_appInvoices[0] ?? null);
  
  const [tableData, setTableData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [summary, setSummary] = useState({
    total_dpp: 0,
    total_transaksi: 0,
    total_ppn: 0,
    total_pph: 0,
    net_pajak: 0,
    total_pembelian: 0,
    total_penjualan: 0,
  });
  // STATE FILTER
  const [filters, setFilters] = useState(defaultFilters);
  // ... imports dan setup variables

  // STATE FILTER
  // Default string 'Semua Bulan' agar match dengan MenuItem
  const [filterMonth, setFilterMonth] = useState('Semua Bulan'); 
  // Default tahun sekarang (2025)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); 

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: table.page + 1,
        limit: table.rowsPerPage,
      };
      
      if (filters.status !== 'all') {
        params.type = filters.status;
      }

      if (filters.name) {
        params.search = filters.name;
      }

      if (filterMonth !== 'Semua Bulan') {
        params.month = Number(filterMonth);
      }

      if (filterYear !== 0) {
        params.year = filterYear;
      }

      const response = await axios.get(endpoints.transaction, { params });
      
      setTableData(response.data.data);
      setSummary(response.data.summary);
      setTotalData(response.data.meta.total_items);

    } catch (error) {
      console.error("Gagal load transaksi", error);
    }
  }, [filters, table.page, table.rowsPerPage, filterMonth, filterYear]); // <--- Dependency ditambah filterMonth & filterYear

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // HANDLERS
  const handleFilterMonth = (event: SelectChangeEvent) => {
    setFilterMonth(event.target.value);
    table.onResetPage(); // Reset ke halaman 1 setiap ganti filter
  };

  const handleFilterYear = (event: SelectChangeEvent) => {
    setFilterYear(Number(event.target.value));
    table.onResetPage(); // Reset ke halaman 1
  };

  const handleResetFilter = () => {
    setFilterMonth('Semua Bulan');
    setFilterYear(new Date().getFullYear()); // Reset ke tahun sekarang
    setFilters(defaultFilters); // Reset filter type/search juga jika perlu
    table.onResetPage();
  };

  const handleViewDetail = useCallback((id: string) => {
    const invoice = _appInvoices.find((i) => i.id === id);
    if (invoice) {
      setSelectedInvoice(invoice);
      setCurrentTab('detail');
    }
  }, []);

  const handleBackToList = () => {
    setCurrentTab('list');
    setSelectedInvoice(null);
  };

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

  const dataFiltered = tableData; // Karena filtering sudah di server, dataFiltered = tableData

  const denseHeight = table.dense ? 56 : 76;
  const notFound = !dataFiltered.length;
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
      
      {/* HEADER SECTION */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* JUDUL & SUB JUDUL */}
          <Grid xs={12} md={12}>
            <Stack direction="row" alignItems="center" gap={2}>
              {currentTab === 'detail' && (
                <IconButton onClick={handleBackToList}>
                  {/* ICON: Back Arrow */}
                  <Iconify icon="solar:arrow-left-bold" />
                </IconButton>
              )}
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {currentTab === 'detail' ? `Detail Invoice: ${selectedInvoice?.invoiceNumber || '-'}` : 'Laporan Pajak'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {currentTab === 'detail' 
                    ? 'Lihat detail lengkap data pajak invoice ini' 
                    : 'Filter dan ekspor laporan data pajak'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* FILTER SECTION (Hanya tampil jika sedang di List View) */}
          {currentTab === 'list' && (
            <>
              {/* FILTER BULAN */}
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Bulan</Typography>
                <FormControl fullWidth size="medium">
                  <Select value={filterMonth} onChange={handleFilterMonth}>
                    <MenuItem value="Semua Bulan">Semua Bulan</MenuItem>
                    {MONTHS.map((month, index) => (
                      <MenuItem key={month} value={String(index + 1)}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* FILTER TAHUN */}
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Tahun</Typography>
                <FormControl fullWidth size="medium">
                  <Select value={String(filterYear)} onChange={(e: any) => handleFilterYear(e)}>
                    <MenuItem value={0}>Semua Tahun</MenuItem>
                    {YEARS.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* RESET FILTER */}
              <Grid xs={12} md={4}>
                 <Typography variant="subtitle2" sx={{ mb: 1 }}>&nbsp;</Typography>
                <Button
                  fullWidth
                  variant="soft"
                  color="info"
                  size="large"
                  onClick={handleResetFilter}
                  // ICON: Refresh / Restart
                  startIcon={<Iconify icon="solar:restart-bold" />} 
                  sx={{ height: 53 }}
                >
                  Reset Filter
                </Button>
              </Grid>

              {/* ACTION BUTTONS */}
              <Grid xs={12} display="flex" justifyContent="flex-end" gap={2} mt={1}>
                <Button
                  variant="outlined"
                  // ICON: Printer
                  startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                  onClick={() => {}}
                >
                  Print
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  // ICON: Export / Download
                  startIcon={<Iconify icon="solar:export-bold" />}
                  onClick={() => {}}
                >
                  Export CSV
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Card>

      {/* WIDGETS SUMMARY */}
      {currentTab === 'list' && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Pembelian" percent={2.6} total={summary.total_pembelian} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Penjualan" percent={0.2} total={summary.total_penjualan} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Pajak" percent={-0.1} total={summary.net_pajak} />
          </Grid>
          <Grid xs={12} md={3}>
            <AppWidgetSummary title="Total Transaksi" percent={-0.1} total={summary.total_transaksi} />
          </Grid>
        </Grid>
      )}

      {/* MAIN CONTENT AREA */}
      <Card>
        {/* --- TABS FILTER (All / Penjualan / Pembelian) --- */}
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${(theme.palette.grey[500], 0.08)}`,
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