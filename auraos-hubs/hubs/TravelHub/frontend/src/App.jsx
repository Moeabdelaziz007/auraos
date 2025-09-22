import React from 'react';
import MainLayout from './components/MainLayout';
import TravelSearch from './components/TravelSearch';

function App() {
  return (
    <MainLayout>
      <TravelSearch />
      {/* Other Travel Hub components like results list will go here */}
    </MainLayout>
  );
}

export default App;
