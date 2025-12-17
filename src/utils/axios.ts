import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  console.log(HOST_API);
  
  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/chat',
  kanban: '/kanban',
  calendar: '/calendar',
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    register: '/auth/register',
  },
  transaction: '/transactions',
  users: '/users',
  master: {
    coa: {
      root: '/master/coa',
    },
    ppn: {
      root: '/master/ppn',
    },
    pph: {
      root: '/master/pph',
    },
    company: {
      root: '/master/company',
    },
    partners: {
      root: '/master/partners',
    },
  },
  mail: {
    list: '/mail/list',
    details: '/mail/details',
    labels: '/mail/labels',
  },
  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },
  product: {
    list: '/product/list',
    details: '/product/details',
    search: '/product/search',
  },
};
