
import React from 'react';

const Workspace: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <aside className="sidebar w-full md:w-64 bg-card p-4">
        <h2 className="text-lg font-semibold mb-4">Workspace</h2>
        {/* Add workspace navigation links here */}
      </aside>
      <main className="main-content flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome to your workspace</h1>
        {/* Add workspace content here */}
      </main>
    </div>
  );
};

export default Workspace;
