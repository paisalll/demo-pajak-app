import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';

// utils
import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import { useRouter } from 'src/routes/hooks';
import { format } from 'date-fns';
import Scrollbar from 'src/components/scrollbar';
import { Divider } from '@mui/material';
import InvoiceAnalytic from '../invoice-analytic';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

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

export default function OverViewDashboard() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();

  // STATE DATA
  const [tableData, setTableData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE SUMMARY
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
  const [filterMonth, setFilterMonth] = useState('Semua Bulan'); 
  const [filterYear, setFilterYear] = useState(new Date().getFullYear()); 

  // STATE PAGINATION DATAGRID
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // DataGrid mulai dari 0
    pageSize: 10,
  });

  // --- DEFINISI KOLOM DATAGRID ---
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'id_transaksi',
      headerName: 'No. Invoice',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
        </Stack>
      )
    },
    {
      field: 'no_invoice',
      headerName: 'No. Invoice Customer/Vendor',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.no_faktur || '-'}</Typography>
        </Stack>
      )
    },
    {
      field: 'tanggal_pencatatan',
      headerName: 'Tanggal',
      width: 120,
      valueFormatter: (params: any) => {
        return format(new Date(params), 'dd MMM yyyy');
      }
    },
    {
      field: 'due_date',
      headerName: 'Jatuh Tempo',
      width: 120,
      valueFormatter: (params: any) => {
         return `${params} hari`
      }
    },
    {
      field: 'tanggal_jatuh_tempo',
      headerName: 'Tanggal Jatuh Tempo',
      width: 120,
      valueFormatter: (params: any) => {
        return format(new Date(params), 'dd MMM yyyy');
      }
    },
    {
      field: 'partner',
      headerName: 'Partner / Customer',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="bold">{params.row.m_company?.nama_perusahaan}</Typography>
        </Stack>
      )
    },
    {
      field: 'transaksi_jurnal',
      headerName: 'Akun COA',
      flex: 1.5, // Beri porsi lebih besar karena isinya banyak text
      minWidth: 400,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          {params.value?.map((item: any) => (
            <Typography key={item.id_akun} variant="body2">{item.m_coa?.id_coa} -{item.m_coa?.nama_akun}</Typography>
          ))}
        </Stack>
      )
    },
    {
      field: 'debit_jurnal',
      headerName: 'Akun Debit',
      flex: 1.5, // Beri porsi lebih besar karena isinya banyak text
      minWidth: 400,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          {params.row.transaksi_jurnal
            ?.filter((item: any) => item.posisi === 'kredit') 
            .map((item: any) => (
              <Typography key={item.id_jurnal} variant="body2" noWrap>
                {item.m_coa?.id_coa} - {item.m_coa?.nama_akun}
              </Typography>
            ))}
        </Stack>
      )
    },
    {
      field: 'kredit_jurnal',
      headerName: 'Akun Kredit',
      flex: 1.5, // Beri porsi lebih besar karena isinya banyak text
      minWidth: 400,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          {params.row.transaksi_jurnal
            ?.filter((item: any) => item.posisi === 'kredit') 
            .map((item: any) => (
              <Typography key={item.id_jurnal} variant="body2" noWrap>
                {item.m_coa?.id_coa} - {item.m_coa?.nama_akun}
              </Typography>
            ))}
        </Stack>
      )
    },
    {
      field: 'type',
      headerName: 'Tipe',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Label
          variant="soft"
          color={params.value === 'penjualan' ? 'success' : 'info'}
          sx={{ textTransform: 'capitalize' }}
        >
          {params.value}
        </Label>
      ),
    },
    {
      field: 'status_pembayaran',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Label
          variant="soft"
          color={params.value === 1 ? 'success' : 'error'}
        >
          {params.value === 1 ? 'Paid' : 'Unpaid'}
        </Label>
      ),
    },
    {
      field: 'total_dpp',
      headerName: 'DPP',
      width: 150,
      type: 'number',
      valueFormatter: (params: any) => {
        return fCurrency(params);
      }
    },
    {
      field: 'total_ppn',
      headerName: 'PPN',
      width: 140,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{mt: 1}} variant="body2" fontWeight="bold" color="primary.main">
            +{fCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'total_pph',
      headerName: 'PPH',
      width: 140,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{mt: 1}} variant="body2" fontWeight="bold" color="error.main">
            -{fCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'total_transaksi',
      headerName: 'Total Transaksi',
      width: 160,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{mt: 1}} variant="body2" fontWeight="bold" color="primary.main">
            {fCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Aksi',
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
          label="Delete"
          onClick={() => window.open(`${import.meta.env.VITE_HOST_API}/reports/pdf/${params.id}`, '_blank')}
        />,
        <GridActionsCellItem
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => router.push(paths.dashboard.one)}
        />,
      ],
    },
  ], [router]);


  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: paginationModel.page + 1, // DataGrid (0-based) -> API (1-based)
        limit: paginationModel.pageSize,
      };
      
      // Filter Logic
      if (filters.status !== 'all') params.type = filters.status;
      if (filters.name) params.search = filters.name;
      if (filterMonth !== 'Semua Bulan') params.month = Number(filterMonth);
      if (filterYear !== 0) params.year = filterYear;

      const response = await axios.get(endpoints.transaction, { params });
      
      setTableData(response.data.data);
      setSummary(response.data.summary);
      setTotalData(response.data.meta.total_items);

    } catch (error) {
      console.error("Gagal load transaksi", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, paginationModel, filterMonth, filterYear]);

  // Effect fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- HANDLERS ---
  const handleFilterMonth = (event: SelectChangeEvent) => {
    setFilterMonth(event.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset ke halaman 1
  };

  const handleFilterYear = (event: SelectChangeEvent) => {
    setFilterYear(Number(event.target.value));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleResetFilter = () => {
    setFilterMonth('Semua Bulan');
    setFilterYear(new Date().getFullYear());
    setFilters(defaultFilters);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleFilterStatus = (event: React.SyntheticEvent, newValue: string) => {
    setFilters(prev => ({ ...prev, status: newValue }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // TABS CONFIGURATION
  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totalData },
    { value: 'penjualan', label: 'Penjualan', color: 'success', count: summary.total_penjualan > 0 ? '...' : 0 },
    { value: 'pembelian', label: 'Pembelian', color: 'info', count: summary.total_pembelian > 0 ? '...' : 0 },
  ] as const;

  const getExportParams = () => {
    const params = new URLSearchParams();

    // 1. Filter Bulan
    if (filterMonth !== 'Semua Bulan') {
      params.append('month', filterMonth);
    }

    // 2. Filter Tahun
    if (filterYear !== 0) {
      params.append('year', String(filterYear));
    }

    // 3. Filter Tipe (Penjualan/Pembelian)
    if (filters.status !== 'all') {
      params.append('type', filters.status);
    }

    // 4. Filter Search
    if (filters.name) {
      params.append('search', filters.name);
    }

    return params.toString();
  };
  
  const handleExport = () => {
    const queryString = getExportParams();
    const url = `${import.meta.env.VITE_HOST_API}/reports/excel?${queryString}`;
    window.open(url, '_blank');
  };

  // Handler Print (PDF)
  const handlePrint = () => {
    const queryString = getExportParams();
    const url = `${import.meta.env.VITE_HOST_API}/reports/pdf-summary?${queryString}`;
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      
      {/* HEADER SECTION (Sama seperti sebelumnya) */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={12}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold">Laporan Pajak</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Data Grid View dengan Filter & Pagination Server-side
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* FILTER DROPDOWNS */}
          <Grid xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Bulan</Typography>
            <FormControl fullWidth size="small">
              <Select value={filterMonth} onChange={handleFilterMonth}>
                <MenuItem value="Semua Bulan">Semua Bulan</MenuItem>
                {MONTHS.map((month, index) => (
                  <MenuItem key={month} value={String(index + 1)}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tahun</Typography>
            <FormControl fullWidth size="small">
              <Select value={String(filterYear)} onChange={handleFilterYear}>
                <MenuItem value={0}>Semua Tahun</MenuItem>
                {YEARS.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
             <Typography variant="subtitle2" sx={{ mb: 1 }}>&nbsp;</Typography>
            <Button
              fullWidth
              variant="soft"
              color="info"
              onClick={handleResetFilter}
              startIcon={<Iconify icon="solar:restart-bold" />} 
            >
              Reset Filter
            </Button>
          </Grid>

          <Grid xs={12} display="flex" justifyContent="flex-end" gap={2} mt={1}>
            <Button
              variant="outlined"
              // ICON: Printer
              startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
              onClick={handlePrint}
            >
              Print
            </Button>

            <Button
              variant="contained"
              color="success"
              // ICON: Export / Download
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* WIDGETS SUMMARY */}
      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <InvoiceAnalytic
              title="Total Transaksi"
              total={totalData}
              percent={100}
              price={summary.total_transaksi}
              icon="solar:bill-list-bold-duotone"
              color={theme.palette.info.main} // theme.palette.primary.main  
            />

            <InvoiceAnalytic
              title="Total DPP"
              total={totalData}
              percent={100}
              price={summary.total_dpp}
              icon="solar:file-check-bold-duotone"
              color={theme.palette.success.main} // theme.palette.success.main
            />

            <InvoiceAnalytic
              title="Total PPN"
              total={totalData}
              percent={100}
              price={summary.total_ppn}
              icon="solar:sort-by-time-bold-duotone"
              color={theme.palette.warning.main} // theme.palette.warning.main
            />
              
              {/* Menampilkan Net Pajak */}
            <InvoiceAnalytic
              title="Net Pajak (PPN - PPh)"
              total={totalData}
              percent={100}
              price={summary.net_pajak}
              icon="solar:bell-bing-bold-duotone"
              color={theme.palette.error.main} // theme.palette.error.main
            />
            <InvoiceAnalytic
              title="Total Penjualan"
              total={totalData}
              percent={100}
              price={summary.total_penjualan}
              icon="solar:graph-new-up-bold-duotone"
              color={theme.palette.success.main} // theme.palette.error.main
            />
            <InvoiceAnalytic
              title="Total Pembelian"
              total={totalData}
              percent={100}
              price={summary.total_pembelian}
              icon="solar:graph-down-new-bold-duotone"
              color={theme.palette.error.main} // theme.palette.error.main
            />
          </Stack>
        </Scrollbar>
      </Card>

      {/* DATA GRID AREA */}
      <Card>
        {/* TABS FILTER */}
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
                <Label variant={((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'} color={tab.color}>
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        {/* DATA GRID */}
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                // Data Props
                rows={tableData}
                columns={columns}
                getRowId={(row) => row.id_transaksi} // Wajib karena ID kita 'id_transaksi' bukan 'id'
                rowCount={totalData} // Total data dari Backend untuk pagination
                loading={isLoading}
                
                // Pagination Props (Server Side)
                getRowHeight={() => 'auto'}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                
                // Toolbar
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 }, // Delay search agar tidak spam API (opsional)
                      printOptions: { disableToolbarButton: false }, // Pastikan tombol print muncul
                      csvOptions: { disableToolbarButton: false }, // Pastikan tombol CSV muncul
                      
                      // Logic CSS untuk Search Kanan & Tombol Kiri
                      sx: {
                          p: 2,
                          // Selector class untuk Quick Filter
                          '& .MuiDataGrid-toolbarQuickFilter': {
                              marginLeft: 'auto', // Dorong ke kanan mentok
                              width: 250 // Lebar search bar
                          }
                      } // Search Bar bawaan DataGrid (Client side search)
                    },
                }}

                // Styling
                disableRowSelectionOnClick
            />
        </Box>
      </Card>
      
    </Container>
  );
}