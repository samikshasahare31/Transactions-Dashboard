import React, { useState } from 'react';
import Table from './components/Table';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';

function App() {
  const [selectedMonth, setSelectedMonth] = useState('03'); // Default to March

  return (
    <div className='m-1'>
      <h1 className='text-center mb-4'>Transactions Dashboard</h1>
      <Table selectedMonth={selectedMonth} onPageChange={setSelectedMonth} />
      <Statistics selectedMonth={selectedMonth} />
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
}

export default App;
