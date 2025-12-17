import { Helmet } from 'react-helmet-async';
// sections
import CoaListView from 'src/sections/three/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: COA</title>
      </Helmet>

      <CoaListView />
    </>
  );
}
