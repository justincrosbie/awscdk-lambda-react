import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";

interface Intent {
  intent: string;
  count: number;
}

const Dashboard: React.FC = () => {
  const [intents, setIntents] = useState<Intent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://afqdwe6avh.execute-api.us-east-1.amazonaws.com/prod/intents');
        setIntents(response.data.normalized_intents);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar' as const,
    },
    xaxis: {
      categories: intents.map(intent => intent.intent),
    },
  };

  const series = [
    {
      name: 'Count',
      data: intents.map(intent => intent.count),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-6 w-full">
        <CardHeader color="blue" className="relative h-56">
          <Typography variant="h3" color="white">
            Intent Distribution
          </Typography>
        </CardHeader>
        <CardBody>
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={350}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;