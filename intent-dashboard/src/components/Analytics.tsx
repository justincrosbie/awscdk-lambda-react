import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useData } from '../hooks/useData'; // Assuming you have a useData hook
import { useTheme } from '../contexts/ThemeContext';

const Analytics: React.FC = () => {
  const { data, loading, error } = useData(); // This should return your csv_data object
  const { theme, colors } = useTheme();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Process the data: Count category occurrences
  const categoryCounts = data.reduce((acc: Record<string, number>, intentObj) => {
    acc[intentObj.category] = (acc[intentObj.category] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for chart
  const categories = Object.keys(categoryCounts);
  const counts = Object.values(categoryCounts);

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      background: theme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: theme === 'dark' ? '#fff' : '#333',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Count',
        style: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
      },
    },
    title: {
      text: 'Intent Distribution by Category',
      align: 'center' as const,
      style: {
        color: theme === 'dark' ? '#fff' : '#333',
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + " intents";
        }
      }
    },
    theme: {
      mode: theme === 'dark' ? 'dark' as const : 'light' as const,
    },
  };

  const series = [
    {
      name: 'Intents',
      data: counts,
    },
  ];

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const cardBorderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="w-full" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Chart Card that fills the width */}
      <Card className={`w-full shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor} mb-6`}
      style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <CardBody>
          <Typography variant="h4" className={`${textColor} mb-4`}>
            Intent Distribution
          </Typography>
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={500}
            width="100%" // Ensure the chart takes the full width of the container
          />
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card className={`w-full shadow-lg rounded-lg ${cardBgColor} border ${cardBorderColor}`}
      style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <CardBody>
          <Typography variant="h5" className={`${textColor} mb-4`}>
            Intent Data
          </Typography>
          <div className="overflow-x-auto">
            <table className={`min-w-full text-left ${textColor}`}>
              <thead>
                <tr>
                  <th className="py-1 px-4">Intent</th>
                  <th className="py-1 px-4">Category</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.intent}>
                    <td className="py-1 px-4">{row.intent}</td>
                    <td className="py-1 px-4">{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Analytics;