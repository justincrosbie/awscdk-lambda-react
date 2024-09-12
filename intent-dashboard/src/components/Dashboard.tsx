import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const { theme } = useTheme();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalIntents = categories.reduce((acc, cat) => acc + cat.count, 0);

  const topCategories = [...categories].sort((a, b) => b.count - a.count).slice(0, 5);
  const highestCategory = topCategories[0];
  const lowestCategory = [...categories].sort((a, b) => a.count - b.count)[0];

  const percentageBreakdown = [...categories]
    .map(cat => ({ ...cat, percentage: (cat.count / totalIntents) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  const pieChartOptions = {
    chart: {
      type: 'pie' as const,
      background: theme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
    },
    labels: categories.map(cat => cat.category),
    title: {
      text: 'Intent Distribution by Category (Pie Chart)',
      align: 'center' as const,
      style: {
        color: theme === 'dark' ? '#fff' : '#333',
      },
    },
    legend: {
      show: false,
    },
    theme: {
      mode: theme === 'dark' ? 'dark' as const : 'light' as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
  };

  const pieChartSeries = categories.map(cat => cat.count);

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const cardBorderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Total Intents Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor}`}>
          <CardBody>
            <Typography variant="h5" className={`mb-4 ${textColor}`}>
              Total Intents
            </Typography>
            <Typography variant="h1" className={`text-6xl font-bold ${textColor}`}>
              {totalIntents}
            </Typography>
          </CardBody>
        </Card>

        {/* Top Categories Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor}`}>
          <CardBody>
            <Typography variant="h5" className={`mb-4 ${textColor}`}>
              Top Categories
            </Typography>
            <ul className="list-disc ml-6">
              {topCategories.map(cat => (
                <li key={cat.category} className={textColor}>
                  {cat.category}: {cat.count} intents
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Pie Chart Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor} h-auto min-h-[24rem]`}>
        <CardBody className="w-full h-full flex justify-center items-center">
            <Chart
            options={pieChartOptions}
            series={pieChartSeries}
            type="pie"
            height={400}
            width={400}
            />
        </CardBody>
        </Card>

        {/* Percentage Breakdown Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor} h-auto min-h-[24rem]`}>
        <CardBody>
            <Typography variant="h5" className={`mb-4 ${textColor}`}>
            Percentage Breakdown
            </Typography>
            <div className="overflow-y-auto max-h-72">
            <table className={`min-w-full text-left ${textColor}`}>
                <thead>
                <tr>
                    <th className="py-1 px-4">Intent</th>
                    <th className="py-1 px-4 text-right">Percentage</th>
                </tr>
                </thead>
                <tbody>
                {percentageBreakdown.map((cat) => (
                    <tr key={cat.category}>
                    <td className="py-1 px-4">{cat.category}</td>
                    <td className="py-1 px-4 text-right">{cat.percentage.toFixed(2)}%</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </CardBody>
        </Card>

        {/* Highest Category Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor}`}>
          <CardBody>
            <Typography variant="h5" className={`mb-4 ${textColor}`}>
              Highest Category
            </Typography>
            <Typography variant="h2" className={`text-4xl font-bold ${textColor}`}>
              {highestCategory?.category}
            </Typography>
            <br/>
            <Typography variant="h6" className={textColor}>
              {highestCategory?.count} intents
            </Typography>
          </CardBody>
        </Card>

        {/* Lowest Category Card */}
        <Card className={`shadow-lg rounded-lg p-4 ${cardBgColor} border ${cardBorderColor}`}>
          <CardBody>
            <Typography variant="h5" className={`mb-4 ${textColor}`}>
              Lowest Category
            </Typography>
            <Typography variant="h2" className={`text-4xl font-bold ${textColor}`}>
              {lowestCategory?.category}
            </Typography>
            <br/>
            <Typography variant="h6" className={textColor}>
              {lowestCategory?.count} intents
            </Typography>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;