// useMasterData.ts
import { useState, useEffect } from 'react';
import axios, { endpoints } from 'src/utils/axios';

export default function useMasterData() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [coaOptions, setCoaOptions] = useState<any[]>([]);
  const [ppnOptions, setPpnOptions] = useState<any[]>([]);
  const [pphOptions, setPphOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        // Request Paralel ke Backend NestJS Anda
        const [resPartners, resCompany, resCoa, resPpn, resPph] = await Promise.all([
          axios.get(endpoints.master.partners.root),
          axios.get(endpoints.master.company.root),
          axios.get(endpoints.master.coa.root),
          axios.get(endpoints.master.ppn.root),
          axios.get(endpoints.master.pph.root)
        ]);

        // 1. Mapping Vendor
        const vendorData = resPartners.data.map((item: any) => ({
          label: item.name || item.nama_partner, 
          value: item.id_partner 
        }));
        setVendors(vendorData);

        // 1. Mapping Vendor
        const companyData = resCompany.data.map((item: any) => ({
          label: item.name || item.nama_perusahaan, 
          value: item.id_company 
        }));
        setCompanies(companyData);

        // 2. Mapping COA (Chart of Accounts)
        const coaData = resCoa.data.map((item: any) => ({
          label: `${item.id_coa} - ${item.nama_akun}`, 
          value: item.id_coa 
        }));
        setCoaOptions(coaData);

        // 3. Mapping PPN
        const ppnData = resPpn.data.map((item: any) => ({
          label: item.label,
          value: item.id_ppn,
          rate: Number(item.rate) 
        }));
        setPpnOptions(ppnData);

        // 4. Mapping PPh
        const pphData = resPph.data.map((item: any) => ({
          label: item.label,
          value: item.id_pph,
          rate: Number(item.rate) 
        }));
        setPphOptions(pphData);

      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  return {
    vendors,
    setVendors, // Diexport jika butuh update manual (misal add new vendor)
    coaOptions,
    ppnOptions,
    pphOptions,
    companies,
    setCompanies,
    isLoading
  };
}