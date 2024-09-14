import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../contexts/ThemeContext';

// Function to generate a color palette
const generateColorPalette = (numColors: number, saturation = 70, lightness = 60) => {
  return Array.from({ length: numColors }, (_, i) => 
    `hsl(${(i * 360) / numColors}, ${saturation}%, ${lightness}%)`
  );
};

const Dashboard: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const { theme, colors } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className={`animate-spin rounded-full h-32 w-32 border-b-2 border-${colors.primary}`}></div>
    </div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!categories || categories.length === 0) {
    return <p className="text-red-500">No categories data available.</p>;
  }

  const totalIntents = categories.reduce((acc, cat) => acc + (cat.count || 0), 0);

  const topCategories = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5);
  const highestCategory = topCategories[0];
  const lowestCategory = [...categories].sort((a, b) => (a.count || 0) - (b.count || 0))[0];

  const percentageBreakdown = [...categories]
    .map(cat => ({ ...cat, percentage: ((cat.count || 0) / totalIntents) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  const colorPalette = generateColorPalette(categories.length);

  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
    },
    labels: categories.map(cat => cat.category || 'Unknown'),
    title: {
      text: 'Intent Distribution by Category',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: colors.text,
      },
    },
    legend: {
      show: false,
    },
    theme: {
      mode: theme === 'dark' ? 'dark' : 'light',
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
          minAngleToShowLabel: 10
        },
      },
    },
    colors: colorPalette,
    tooltip: {
      y: {
        formatter: function(value: number) {
          const safeValue = isNaN(value) ? 0 : value;
          return `${safeValue} intents (${((safeValue / totalIntents) * 100).toFixed(1)}%)`;
        },
      },
    },
    dataLabels: {
      formatter: function(val: number, opts: any) {
        return opts.w.globals.labels[opts.seriesIndex] || 'Unknown';
      },
      style: {
        colors: [colors.text],
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        dataLabels: {
          enabled: false
        },
      }
    }]
  };

  const pieChartSeries = categories.map(cat => cat.count || 0);

  const CustomLegend: React.FC = () => (
    <div className={`overflow-y-auto max-h-72 mt-4 ${isMobile ? 'grid grid-cols-2 gap-2' : ''}`}>
      {categories.map((cat, index) => (
        <div key={cat.category} className="flex items-center mb-2">
          <div 
            className="w-4 h-4 mr-2 flex-shrink-0" 
            style={{ backgroundColor: colorPalette[index] }}
          ></div>
          <span style={{ color: colors.text }} className={isMobile ? 'text-sm' : ''}>
            {cat.category}: {cat.count} ({((cat.count || 0) / totalIntents * 100).toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full" style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Total Intents Card */}
        <Card className="shadow-lg rounded-lg p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: colors.text }}>
              Total Intents
            </Typography>
            <Typography variant="h1" className="text-6xl font-bold" style={{ color: colors.primary }}>
              {totalIntents}
            </Typography>
          </CardBody>
        </Card>

        {/* Top Categories Card */}
        <Card className="shadow-lg rounded-lg p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: colors.text }}>
              Top Categories
            </Typography>
            <ul className="list-disc ml-6">
              {topCategories.map((cat, index) => (
                <li key={cat.category} style={{ color: colors.text }}>
                  <span style={{ color: colorPalette[index] }}>{cat.category}</span>: {cat.count || 0} intents
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Pie Chart Card */}
        <Card className={`shadow-lg rounded-lg p-4 h-auto ${isMobile ? 'min-h-[24rem]' : ''}`} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody className="w-full h-full flex flex-col justify-center items-center">
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center w-full`}>
              <div className={isMobile ? 'w-full' : 'w-1/2'}>
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="pie"
                  height={isMobile ? 300 : 300}
                  width={isMobile ? '100%' : 300}
                />
              </div>
              <div className={isMobile ? 'w-full' : 'w-1/2'}>
                <CustomLegend />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Percentage Breakdown Card */}
        <Card className="shadow-lg rounded-lg p-4 h-auto min-h-[24rem]" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: colors.text }}>
              Percentage Breakdown
            </Typography>
            <div className="overflow-y-auto max-h-72">
              <table className="min-w-full text-left" style={{ color: colors.text }}>
                <thead>
                  <tr>
                    <th className="py-1 px-4">Intent</th>
                    <th className="py-1 px-4 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {percentageBreakdown.map((cat, index) => (
                    <tr key={cat.category}>
                      <td className="py-1 px-4" style={{ color: colorPalette[index] }}>{cat.category}</td>
                      <td className="py-1 px-4 text-right">{cat.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Highest Category Card */}
        <Card className="shadow-lg rounded-lg p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: colors.text }}>
              Highest Category
            </Typography>
            <Typography variant="h2" className="text-4xl font-bold" style={{ color: colorPalette[0] }}>
              {highestCategory?.category || 'N/A'}
            </Typography>
            <br/>
            <Typography variant="h6" style={{ color: colors.text }}>
              {highestCategory?.count || 0} intents
            </Typography>
          </CardBody>
        </Card>

        {/* Lowest Category Card */}
        <Card className="shadow-lg rounded-lg p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: colors.text }}>
              Lowest Category
            </Typography>
            <Typography variant="h2" className="text-4xl font-bold" style={{ color: colorPalette[colorPalette.length - 1] }}>
              {lowestCategory?.category || 'N/A'}
            </Typography>
            <br/>
            <Typography variant="h6" style={{ color: colors.text }}>
              {lowestCategory?.count || 0} intents
            </Typography>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;