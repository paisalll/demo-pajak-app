import { Helmet } from 'react-helmet-async';
// sections
import TaxView from 'src/sections/tax/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Master: PPN & PPh</title>
      </Helmet>

      <TaxView />
    </>
  );
}
