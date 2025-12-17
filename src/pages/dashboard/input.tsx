import { Helmet } from 'react-helmet-async';
// sections
import TwoView from 'src/sections/two/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Input Transaksi</title>
      </Helmet>

      <TwoView />
    </>
  );
}
