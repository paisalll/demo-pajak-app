import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, TextField, Box, Paper } from '@mui/material';

// Props validation
RHFAutocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  onAddNew: PropTypes.func, // Opsional: Jika ada fungsi ini, tombol "Tambah" akan muncul
  addNewLabel: PropTypes.string, // Opsional: Teks untuk tombol tambah
};

interface RHFAutocompleteProps {
  name: string;
  label?: string;
  options: Array<{ value: string | number; label: string } | string>;
  onAddNew?: () => void;
  addNewLabel?: string;
  [key: string]: any;
}

export default function RHFAutocomplete({ name, label, options, onAddNew, addNewLabel = 'Tambah Baru', ...other }: RHFAutocompleteProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          options={options}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                    isOptionEqualToValue={(option, value) => {
                if (!value) return false;
                
                if (typeof value === 'string') {
                    return typeof option === 'string' ? option === value : option.value === value;
                }

                return typeof option === 'string' ? option === value.value : option.value === value.value;
            }}
          onChange={(_, newValue) => {
             console.log('RHFAutocomplete onChange newValue:', newValue);
             
             if (!newValue) {
               field.onChange('');
             } else if (typeof newValue === 'string' || typeof newValue === 'number') {
               field.onChange(newValue);
             } else {
               field.onChange(newValue.value);
             }
          }}
          value={options.find((v) => (typeof v === 'string' ? v === field.value : v.value === field.value)) || null}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={`Pilih ${label}...`}
              error={!!error}
              helperText={error?.message}
              fullWidth
            />
          )}
          PaperComponent={({ children, ...paperProps }) => (
            <Paper {...paperProps} sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 3 }}>
              {children}
              {onAddNew && (
                <Box
                  sx={{ 
                    p: 1, 
                    borderTop: '1px solid #eee', 
                    cursor: 'pointer', 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onAddNew()}
                >
                  + {addNewLabel}
                </Box>
              )}
            </Paper>
          )}
          {...other}
        />
      )}
    />
  );
}