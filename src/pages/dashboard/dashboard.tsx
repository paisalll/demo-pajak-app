import { Helmet } from 'react-helmet-async';
import OverViewDashboard from 'src/sections/one/app/view/overview-app-view';
// sections
import ThreeView from 'src/sections/three/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: One</title>
      </Helmet>

      <OverViewDashboard />
    </>
  );
}
