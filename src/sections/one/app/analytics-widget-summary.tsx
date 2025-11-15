// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CardProps } from '@mui/material/Card';
// theme
import { bgGradient } from 'src/theme/css';
// utils
import { fShortenNumber, fPercent } from 'src/utils/format-number';
// theme
import { ColorSchema } from 'src/theme/palette';
// components
import Iconify from 'src/components/iconify'; 
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts'; // Import tipe untuk TypeScript

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  icon: React.ReactNode;
  percent: number;
  chartData: number[];
  color?: ColorSchema;
}

export default function AnalyticsWidgetSummary({
  title,
  total,
  icon,
  percent,
  chartData,
  color = 'primary',
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  // --- KONFIGURASI CHART LANGSUNG DI SINI ---
  const chartOptions: ApexOptions = {
    chart: {
      sparkline: {
        enabled: true, // Ini kunci agar chart jadi mini (tanpa sumbu X/Y)
      },
    },
    stroke: {
      curve: 'smooth', // Garis melengkung halus
      width: 3,
    },
    colors: [theme.palette[color].main], // Warna garis mengikuti prop 'color'
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => '', // Hilangkan judul tooltip
        },
      },
      marker: {
        show: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
  };

  return (
    <Stack
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        p: 3,
        borderRadius: 2,
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      {/* Background Pattern (Opsional - Hapus jika gambar tidak muncul) */}
      <Box
        component="img"
        src="/assets/icons/patterns/pattern-01.png" 
        sx={{
            position: 'absolute',
            top: -20,
            left: -20,
            width: 140,
            height: 140,
            opacity: 0.08,
            color: `${color}.dark`,
            filter: 'grayscale(1)',
        }}
      />

      {/* BAGIAN ATAS: Ikon & Persentase */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3, zIndex: 1 }}>
        <Box sx={{ width: 64, height: 64 }}>{icon}</Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify 
            width={20}
            icon={percent >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'} 
            sx={{ color: percent >= 0 ? 'success.main' : 'error.main' }}
          />
          <Typography 
            variant="subtitle2" 
            sx={{ color: percent >= 0 ? 'success.main' : 'error.main' }}
          >
            {percent > 0 && '+'}
            {fPercent(percent)}
          </Typography>
        </Stack>
      </Stack>

      {/* BAGIAN BAWAH: Info Total & Chart */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ zIndex: 1 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.72, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h3">{fShortenNumber(total)}</Typography>
        </Box>

        <Box sx={{ width: 120, height: 80 }}>
          <ReactApexChart
            type="line"
            series={[{ data: chartData }]}
            options={chartOptions}
            width="100%"
            height={80}
          />
        </Box>
      </Stack>
    </Stack>
  );
}