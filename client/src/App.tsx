
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from './lib/firebase';
import AllRoutes from './routes'; 

function App() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', { page_path: location.pathname });
  }, [location]);

  return <AllRoutes />;
}

export default App;
