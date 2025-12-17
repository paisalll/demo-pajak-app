import { Helmet } from 'react-helmet-async';
// sections
import SixView from 'src/sections/customer/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Master: Customer</title>
      </Helmet>

      <SixView />
    </>
  );
}
