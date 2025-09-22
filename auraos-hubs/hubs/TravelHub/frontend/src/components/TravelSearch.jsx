import React from 'react';

const searchFormStyle = {
  padding: '1rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fdfdfd',
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#1D85E3',
  color: 'white',
  cursor: 'pointer',
};

export default function TravelSearch() {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Find Your Next Flight</h3>
      <form style={searchFormStyle}>
        <input style={inputStyle} type="text" placeholder="From: City or Airport" />
        <input style={inputStyle} type="text" placeholder="To: City or Airport" />
        <input style={inputStyle} type="date" />
        <input style={inputStyle} type="number" placeholder="Travelers" min="1" />
        <button style={buttonStyle} type="submit">Search</button>
      </form>
    </div>
  );
}
