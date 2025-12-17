import { Helmet } from 'react-helmet-async';
// sections
import FiveView from 'src/sections/vendor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Master: Vendor</title>
      </Helmet>

      <FiveView />
    </>
  );
}
