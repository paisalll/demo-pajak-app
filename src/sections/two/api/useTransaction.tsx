import { useState } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

// --- TIPE DATA (Harus sama persis dengan Backend DTO) ---

export interface ProductItem {
  nama_produk: string;
  deskripsi?: string;
  qty: number;
  harga_satuan: number; // DPP per item
}

export interface TransactionPayload {
  id_company?: string;
  tanggal_pencatatan: Date | string;
  tanggal_invoice: Date | string;
  tanggal_jatuh_tempo: Date | string;
  no_invoice: string;
  no_faktur: string;
  type: 'penjualan' | 'pembelian';
  id_partner?: string;
  id_akun_debit: string;
  id_akun_kredit: string;
  
  // Array Produk (Penting!)
  products: ProductItem[];

  // Pajak (Optional ID)
  id_ppn_fk?: number;
  id_pph_fk?: number;
}

export default function useCreateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const createTransaction = async (payload: TransactionPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      // Pastikan endpoint di axios.ts Anda mengarah ke '/transactions'
      const response = await axios.post(endpoints.transaction, payload);
      return response.data; // Return data jika sukses
    } catch (err: any) {
      console.error('Gagal membuat transaksi:', err);
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan transaksi';
      setError(errMsg);
      enqueueSnackbar(errMsg, { variant: 'error' });
      throw err; // Lempar error agar bisa di-catch di component form
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (payload: TransactionPayload, id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Pastikan endpoint di axios.ts Anda mengarah ke '/transactions'
      const response = await axios.patch(`${endpoints.transaction}/${id}`, payload);
      return response.data; // Return data jika sukses
    } catch (err: any) {
      console.error('Gagal membuat transaksi:', err);
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan transaksi';
      setError(errMsg);
      enqueueSnackbar(errMsg, { variant: 'error' });
      throw err; // Lempar error agar bisa di-catch di component form
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createTransaction, 
    updateTransaction,
    isLoading, 
    error 
  };
}