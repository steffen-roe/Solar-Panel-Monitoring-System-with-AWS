import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './App.css';
import DropdownMenu from './DropdownMenu';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const chartRef = useRef(null); // Chart instance reference
  const canvasRef = useRef(null); // Canvas DOM reference

  const [range, setRange] = useState("day");
  const [type, setType] = useState("line");

  // Fetch data from the API
  const fetchData = async () => {
    try {
      setLoadingButton(true);
      const response = await axios.get(
        `https://1hebxmo6bj.execute-api.eu-central-1.amazonaws.com/dev/data?range=${range}`
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false); 
      setLoadingButton(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [range]);

  // Create or update the chart when data changes
  useEffect(() => {
    if (data.length > 0) {
      const canvas = canvasRef.current;

      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Prepare labels and datasets based on the range
      let labels = [];
      let powerData = [];
      let energyData = [];

      // Process the data based on range
      if (range === "day" || range.length === 8) {
        labels = data.map(({ time }) => time); // Time of day for 'day' range
        powerData = data.map(({ power }) => power); // Power for 'day' range
        energyData = data.map(({ energy }) => energy); // Energy for 'day' range
        setType("line");
      } else if (range === "7" || range == "30") {
        // Process the data differently for a 7-day range
        labels = data.map(({ date }) => date); // Use date for '7' range
        energyData = data.map(({ max_energy }) => max_energy); // Weekly energy data for '7' range
        setType("bar");
      }

      // Create the new chart instance

      if (type === "line") {
        chartRef.current = new Chart(canvas, {
          type: 'line', // Choose chart type based on range
          data: {
            labels,
            datasets: [
              {
                label: 'Power Output (W)',
                data: powerData,
                borderColor: '#FF6F00',
                backgroundColor: 'rgba(255, 111, 0, 0.2)',
                tension: 0.4, // Add tension for line chart, none for bar chart
                fill: false,
                yAxisID: 'y', // Associate with the left y-axis
                pointRadius: 0, 
                borderWidth: 4,
              },
              {
                label: 'Energy Generated (kWh)',
                data: energyData, 
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0, 123, 255, 0.2)', // Adjust color for bar chart
                tension: 0.4, // Add tension for line chart, none for bar chart
                fill: true, // Keep fill for both
                yAxisID: 'y1', // Associate with the right y-axis
                pointRadius: 0, // Remove points for bar chart
                borderWidth: 4,
              },
            ],
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#ffffff',
                  font: {
                    size: 14,
                  },
                  boxHeight: '0',
                },
                display: true,
                position: 'bottom',
                align: 'center',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time of Day', // Adjust title based on range
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0)',
                },
                ticks: {
                  maxTicksLimit: 10, // Adjust ticks for better visibility
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Power (W)',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                beginAtZero: true,
                position: 'left', // Ensure it's on the left side
              },
              y1: {
                title: {
                  display: true,
                  text: 'Energy (kWh)',
                },
                grid: {
                  drawOnChartArea: false, // Prevent grid lines for this axis
                },
                position: 'right', // Place on the right side
                beginAtZero: true,
              },
            },
          },
        });
      } else if (type == "bar") {
        chartRef.current = new Chart(canvas, {
          type: 'bar', // Choose chart type based on range
          data: {
            labels,
            datasets: [
              {
                label: 'Energy Generated (kWh)',
                data: energyData, 
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0, 123, 255, 0.7)', // Adjust color for bar chart
                tension: 0, // Add tension for line chart, none for bar chart
                fill: true, // Keep fill for both
                pointRadius: 0, // Remove points for bar chart
              },
            ],
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#ffffff',
                  font: {
                    size: 14,
                  },
                },
                display: true,
                position: 'bottom',
                align: 'center',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date', // Adjust title based on range
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0)',
                },
                ticks: {
                  maxTicksLimit: 7, // Adjust ticks for better visibility
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Energy (kWh)',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                position: 'left', // Place on the right side
                beginAtZero: true,
              },
            },
          },
        });
      }
      
    }
  }, [data, range]); // Re-run when 'data' or 'range' changes




  return (
    <div className="App">
      <h1>Solar Panel Dashboard</h1>
 
      {loading ? (
        <p>Loading data...</p>
      ) : (

        <div className="graph-container" style={{ width: '750px', height: '500px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0px', alignSelf: 'flex-start'}}>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12.5px', margin: '0' }}>
              <h1 style={{ color: 'rgba(255, 255, 255, 1)', margin: '0' }}>PV Output</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.3)', margin: '0' }}>Update interval: 5 minutes</p>
                
                <button onClick={fetchData} className="refresh-button">
                {loadingButton ? (<svg className='spin' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 32 32">
                  <path fill='#FF6F00' d="M 16 4 C 10.886719 4 6.617188 7.160156 4.875 11.625 L 6.71875 12.375 C 8.175781 8.640625 11.710938 6 16 6 C 19.242188 6 22.132813 7.589844 23.9375 10 L 20 10 L 20 12 L 27 12 L 27 5 L 25 5 L 25 8.09375 C 22.808594 5.582031 19.570313 4 16 4 Z M 25.28125 19.625 C 23.824219 23.359375 20.289063 26 16 26 C 12.722656 26 9.84375 24.386719 8.03125 22 L 12 22 L 12 20 L 5 20 L 5 27 L 7 27 L 7 23.90625 C 9.1875 26.386719 12.394531 28 16 28 C 21.113281 28 25.382813 24.839844 27.125 20.375 Z"></path>
                  </svg>)
                : (<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 32 32">
                  <path fill='#FF6F00' d="M 16 4 C 10.886719 4 6.617188 7.160156 4.875 11.625 L 6.71875 12.375 C 8.175781 8.640625 11.710938 6 16 6 C 19.242188 6 22.132813 7.589844 23.9375 10 L 20 10 L 20 12 L 27 12 L 27 5 L 25 5 L 25 8.09375 C 22.808594 5.582031 19.570313 4 16 4 Z M 25.28125 19.625 C 23.824219 23.359375 20.289063 26 16 26 C 12.722656 26 9.84375 24.386719 8.03125 22 L 12 22 L 12 20 L 5 20 L 5 27 L 7 27 L 7 23.90625 C 9.1875 26.386719 12.394531 28 16 28 C 21.113281 28 25.382813 24.839844 27.125 20.375 Z"></path>
                  </svg>
                )}
                </button>

              </div>
            </div>
            <div>
              <DropdownMenu range={range} setRange={setRange}/>
            </div>
          </div>

          <canvas ref={canvasRef} width= '750px' height= '425px' ></canvas>
        </div>
      )}
    </div>
  );
}

export default App;
