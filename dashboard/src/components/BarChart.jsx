import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({});

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/bar-chart', {
        params: { month: selectedMonth },
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  useEffect(() => {
    fetchBarChartData();
  }, [selectedMonth]);

  const data = {
    labels: Object.keys(chartData),
    datasets: [
      {
        label: 'Number of Items',
        data: Object.values(chartData),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className='m-3'>
      <h3>Bar Chart</h3>
      <Bar data={data} />
    </div>
  );
};

export default BarChart;
