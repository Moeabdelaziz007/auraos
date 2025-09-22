import React from 'react';

const layoutStyle = {
  display: 'grid',
  gridTemplateColumns: '200px 1fr 300px',
  height: '100vh',
  width: '100vw',
};

const sidebarStyle = {
  borderRight: '1px solid #ccc',
  padding: '1rem',
  backgroundColor: '#f8f9fa',
};

const mainAreaStyle = {
  padding: '1rem',
  overflowY: 'auto',
};

const aiSidebarStyle = {
  borderLeft: '1px solid #ccc',
  padding: '1rem',
  backgroundColor: '#f8f9fa',
};

export default function MainLayout({ children }) {
  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <h3>AuraOS Hubs</h3>
        <nav>
          <ul>
            <li>Home</li>
            <li>Travel</li>
            <li>Food</li>
            <li>Shop</li>
            <li>Notes</li>
          </ul>
        </nav>
      </aside>
      <main style={mainAreaStyle}>
        {children}
      </main>
      <aside style={aiSidebarStyle}>
        <h4>AI Assistant</h4>
        <p>Contextual actions will appear here.</p>
      </aside>
    </div>
  );
}
