import React, { useState, useEffect, useCallback } from 'react';
// @mui Material components
import {
  Box,
  Card,
  Container,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Stack
} from '@mui/material';

// components
import { useSettingsContext } from 'src/components/settings';
import { useParams } from 'src/routes/hooks'; // Atau 'react-router-dom' tergantung setup Anda
import { useSnackbar } from 'src/components/snackbar';
import FormPenjualan from './component/FormPenjualan';
import FormPembelian from './component/FormPembelian';

// utils
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function InputDataPajakPage() {
  const settings = useSettingsContext();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  // --- SOLUSI 1: Decode URL Component ---
  // Karena ID di URL mungkin "INV-00001%2F25", kita decode balik jadi "INV-00001/25"
  const id = params.id ? decodeURIComponent(params.id as string) : null;
  const isEdit = !!id;
  
  const [currentTab, setCurrentTab] = useState<string>('penjualan');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- FETCH DATA FOR EDIT ---
  const fetchTransaction = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Panggil API Detail (Controller findOne yang sudah Anda buat menerima string ID)
      const response = await axios.get(`${endpoints.transaction}/${encodeURIComponent(params.id as string)}`);
      const data = response.data;

      setTransactionData(data);
      
      // Auto-switch Tab sesuai tipe data dari database
      if (data.type) {
        setCurrentTab(data.type); // 'penjualan' atau 'pembelian'
      }

    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error);
      enqueueSnackbar('Transaksi tidak ditemukan atau terjadi kesalahan', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [id, enqueueSnackbar]);

  // Effect jalan saat komponen load jika ada ID
  useEffect(() => {
    if (isEdit) {
      fetchTransaction();
    }
  }, [fetchTransaction, isEdit]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string): void => {
    setCurrentTab(newValue);
  };

  // --- RENDER LOADING ---
  if (isEdit && isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
         <CircularProgress />
         <Typography sx={{ mt: 2 }}>Memuat data transaksi...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ p: 0, boxShadow: 3 }}>
        
        {/* Header Form */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {isEdit ? `Edit Transaksi: ${id}` : 'Input Data Pajak'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isEdit 
                        ? 'Perbarui data transaksi penjualan atau pembelian'
                        : 'Pilih tab Penjualan atau Pembelian untuk memasukkan data transaksi baru'
                    }
                </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Navigasi Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="Tab data pajak"
            // Opsional: Disable tab switch saat mode Edit agar user fokus
            // disabled={isEdit} 
          >
            <Tab 
                label="Input Penjualan" 
                value="penjualan" 
                id="tab-penjualan" 
                disabled={isEdit && currentTab !== 'penjualan'} // Kunci tab jika sedang edit
            />
            <Tab 
                label="Input Pembelian" 
                value="pembelian" 
                id="tab-pembelian" 
                disabled={isEdit && currentTab !== 'pembelian'} // Kunci tab jika sedang edit
            />
          </Tabs>
        </Box>

        {/* Konten Tab */}
        <Box sx={{ p: 4 }}>
          {/* Panel Tab Penjualan */}
          <Box
            role="tabpanel"
            hidden={currentTab !== 'penjualan'}
            aria-labelledby="tab-penjualan"
          >
            {currentTab === 'penjualan' && (
                <FormPenjualan 
                    isEdit={isEdit} 
                    currentData={transactionData} 
                />
            )}
          </Box>

          {/* Panel Tab Pembelian */}
          <Box
            role="tabpanel"
            hidden={currentTab !== 'pembelian'}
            aria-labelledby="tab-pembelian"
          >
             {currentTab === 'pembelian' && (
                <FormPembelian 
                    isEdit={isEdit} 
                    currentData={transactionData} 
                />
            )}
          </Box>
        </Box>
      </Card>
    </Container>
  );
}