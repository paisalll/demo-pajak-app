import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import SvgColor from 'src/components/svg-color';
// hooks
import { useAuthContext } from 'src/auth/hooks'; // <-- PASTIKAN IMPORT INI SESUAI LOKASI AUTH ANDA

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  // ... (kode icon sama seperti sebelumnya)
  dashboard: icon('ic_dashboard'),
  order: icon('ic_order'),
  banking: icon('ic_banking'),
  label: icon('ic_label'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  // 1. AMBIL ROLE USER
  const { user } = useAuthContext(); 
  // Jika template Anda pakai 'user?.role', sesuaikan. 
  // Pastikan role di user sesuai dengan string 'admin' atau 'user'.
  const currentRole = user?.role; 

  const data = useMemo(
    () => {
      // Definisi menu mentah
      const navConfig = [
        {
          subheader: 'overview Dashboard',
          items: [
            { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
            { title: 'Input', path: paths.dashboard.two, icon: ICONS.order },
            {
              title: 'COA',
              path: paths.dashboard.three,
              icon: ICONS.banking,
            },
            {
              title: 'Master',
              path: paths.dashboard.master.root,
              roles: ['admin'],
              icon: ICONS.label,
              children: [
                {
                  title: 'Users',
                  path: paths.dashboard.master.users,
                },
                {
                  title: 'Vendor',
                  path: paths.dashboard.master.vendor,
                },
                {
                  title: 'Customer',
                  path: paths.dashboard.master.customer,
                },
                                {
                  title: 'PPN & PPH',
                  path: paths.dashboard.master.tax,
                },
              ],
            },
          ],
        },
      ];

      // 2. LOGIKA FILTERING
      // Kita map setiap group (subheader), lalu filter items di dalamnya
      const filteredNav = navConfig.map((group) => ({
        ...group,
        items: group.items.filter((item: any) => {
          // Jika item punya properti 'roles', cek apakah role user saat ini ada di dalamnya
          if (item.roles && item.roles.length > 0) {
            return item.roles.includes(currentRole);
          }
          // Jika tidak ada properti 'roles', berarti menu ini untuk semua orang
          return true;
        }),
      }));

      return filteredNav;
    },
    [currentRole] // <-- Dependency array: hitung ulang jika role berubah
  );

  return data;
}