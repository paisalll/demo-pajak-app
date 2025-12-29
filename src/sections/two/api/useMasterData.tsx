import { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import axios, { endpoints } from 'src/utils/axios';

export default function useMasterData() {
  const [coa, setCoa] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [coaOptions, setCoaOptions] = useState<any[]>([]);
  const [ppnOptions, setPpnOptions] = useState<any[]>([]);
  const [pphOptions, setPphOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Definisikan fungsi fetch menggunakan useCallback
  const fetchMasterData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [resPartners, resCompany, resCoa, resPpn, resPph] = await Promise.all([
        axios.get(endpoints.master.partners.root),
        axios.get(endpoints.master.company.root),
        axios.get(endpoints.master.coa.root),
        axios.get(endpoints.master.ppn.root),
        axios.get(endpoints.master.pph.root)
      ]);

      // 1. Mapping Partner
      const partnerData = resPartners.data.map((item: any) => ({
        label: item.name || item.nama_partner, 
        value: item.id_partner 
      }));
      setPartners(partnerData);

      // 2. Mapping Company (Vendor/Internal)
      const companyData = resCompany.data.map((item: any) => ({
        label: item.name || item.nama_perusahaan, 
        value: item.id_company 
      }));
      setCompanies(companyData);

      // 3. Mapping COA
      const coaData = resCoa.data.map((item: any) => ({
        label: `${item.id_coa} - ${item.nama_akun}`, 
        value: item.id_coa 
      }));
      setCoaOptions(coaData);
      setCoa(resCoa.data);

      // 4. Mapping PPN
      const ppnData = resPpn.data.map((item: any) => ({
        label: item.label,
        value: item.id_ppn,
        rate: Number(item.rate) 
      }));
      setPpnOptions(ppnData);

      // 5. Mapping PPh
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
  }, []); // Dependency kosong: fungsi ini tidak bergantung pada state luar

  // 3. Panggil fetch saat pertama kali mount (useEffect)
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return {
    partners,
    setPartners,
    companies,
    setCompanies,
    coaOptions,
    ppnOptions,
    pphOptions,
    coa,
    
    // 4. EXPORT FUNGSI ASLINYA
    fetchMasterData, // Ini yang akan dipakai untuk refetch
    
    isLoading
  };
}