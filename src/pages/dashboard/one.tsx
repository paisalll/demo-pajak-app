import { Helmet } from 'react-helmet-async';
// sections
import {OverviewAppView} from 'src/sections/one/app/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: One</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
