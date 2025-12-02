import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

// @mui
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// components
import { RHFTextField } from 'src/components/hook-form'; // Sesuaikan import
import Iconify from 'src/components/iconify';

export default function ProdukDetail() {
  const { control, watch } = useFormContext(); // Ambil context dari parent

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const handleAdd = () => {
    append({
      nama_produk: '',
      deskripsi: '',
      qty: 1,
      harga_satuan: 0,
      sub_total: 0
    });
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.neutral' }}>
              <TableCell width="25%">Nama Produk</TableCell>
              <TableCell width="25%">Deskripsi</TableCell>
              <TableCell width="10%" align="center">Qty</TableCell>
              <TableCell width="20%">Harga Satuan</TableCell>
              <TableCell width="15%">Subtotal</TableCell>
              <TableCell width="5%"></TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {fields.map((item, index) => {
              // Kalkulasi live per baris untuk tampilan read-only subtotal
              const qty = watch(`products.${index}.qty`);
              const harga = watch(`products.${index}.harga_satuan`);
              const subTotal = (Number(qty) || 0) * (Number(harga) || 0);

              return (
                <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* Nama Produk */}
                  <TableCell>
                    <RHFTextField
                      size="small"
                      name={`products.${index}.nama_produk`}
                      placeholder="Contoh: Jasa Konsultasi"
                    />
                  </TableCell>

                  {/* Deskripsi */}
                  <TableCell>
                    <RHFTextField
                      size="small"
                      name={`products.${index}.deskripsi`}
                      placeholder="Keterangan..."
                    />
                  </TableCell>

                  {/* Qty */}
                  <TableCell>
                    <RHFTextField
                      size="small"
                      type="number"
                      name={`products.${index}.qty`}
                      InputProps={{ inputProps: { min: 1, style: { textAlign: 'center' } } }}
                    />
                  </TableCell>

                  {/* Harga Satuan */}
                  <TableCell>
                    <RHFTextField
                      size="small"
                      type="number"
                      name={`products.${index}.harga_satuan`}
                      InputProps={{ 
                        startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>Rp</Typography>,
                        inputProps: { min: 0 } 
                      }}
                    />
                  </TableCell>

                  {/* Subtotal (Read Only) */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      Rp {subTotal.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Delete Button */}
                  <TableCell>
                    <IconButton color="error" onClick={() => remove(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        size="small"
        startIcon={<Iconify icon="solar:add-circle-bold" />}
        onClick={handleAdd}
        sx={{ mt: 2 }}
      >
        Tambah Produk
      </Button>
    </>
  );
}