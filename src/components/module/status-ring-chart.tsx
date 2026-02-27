'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface StatusRingChartProps {
  data: {
    total: number;
    assign: number;
    decom: number;
    dispose: number;
    inspection: number;
    servicing: number;
  };
}

const chartConfig = [
  { name: 'Total Asset', key: 'total', color: '#007FFF' }, // Electric Blue
  { name: 'Assign', key: 'assign', color: '#50C878' }, // Emerald Green
  { name: 'Decom', key: 'decom', color: '#708090' }, // Slate Grey
  { name: 'Dispose', key: 'dispose', color: '#E0115F' }, // Ruby Red
  { name: 'Inspection', key: 'inspection', color: '#FFBF00' }, // Amber Orange
  { name: 'Servicing', key: 'servicing', color: '#9966CC' }, // Amethyst Purple
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {name}
          </span>
          <span className="font-bold text-foreground">
            {value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function StatusRingChart({ data }: StatusRingChartProps) {
  const chartData = chartConfig.map(item => ({
    name: item.name,
    value: data[item.key as keyof typeof data],
    color: item.color,
  })).filter(item => item.value > 0);

  return (
    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
      <CardHeader>
        <CardTitle>Asset Overview</CardTitle>
        <CardDescription>A visual breakdown of asset statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="40%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No asset data to display in chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
