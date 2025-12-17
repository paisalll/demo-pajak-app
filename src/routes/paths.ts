// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    one: `${ROOTS.DASHBOARD}`,
    two: `${ROOTS.DASHBOARD}/input`,
    detail: (id: string) => `${ROOTS.DASHBOARD}/input/detail/${id}`,
    three: `${ROOTS.DASHBOARD}/coa`,
    master: {
      root: `${ROOTS.DASHBOARD}/master`,
      users: `${ROOTS.DASHBOARD}/master/users`,
      vendor: `${ROOTS.DASHBOARD}/master/vendor`,
      customer: `${ROOTS.DASHBOARD}/master/customer`,
      tax: `${ROOTS.DASHBOARD}/master/tax`,
    },
  },
};
