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
  { name: 'Assign', key: 'assign', color: '#50C878' }, // Emerald Green
  { name: 'Decom', key: 'decom', color: '#708090' }, // Slate Grey
  { name: 'Dispose', key: 'dispose', color: '#E0115F' }, // Ruby Red
  { name: 'Inspection', key: 'inspection', color: '#FFBF00' }, // Amber Orange
  { name: 'Servicing', key: 'servicing', color: '#9966CC' }, // Amethyst Purple
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const displayName = data.payload.name || data.name;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {displayName}
          </span>
          <span className="font-bold text-foreground">
            {data.value}
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
  
  const totalAssetsData = [{ name: 'Total Assets', value: data.total }];

  const totalStatusValues = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
      <CardHeader>
        <CardTitle>Asset Overview</CardTitle>
        <CardDescription>A visual breakdown of asset statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.total > 0 ? (
          <div className="relative h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '20px' }}
                  payload={chartData.map(item => ({
                    value: `${item.name} (${item.value})`,
                    type: 'circle',
                    id: item.name,
                    color: item.color,
                  }))}
                />
                {/* Outer Ring: Total Assets */}
                <Pie
                  data={totalAssetsData}
                  dataKey="value"
                  cx="40%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={90}
                  startAngle={90}
                  endAngle={450}
                  isAnimationActive={false}
                >
                   <Cell fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
                </Pie>
                {/* Inner Ring: Status Breakdown */}
                {totalStatusValues > 0 && (
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                    </Pie>
                )}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-sm text-muted-foreground">Total Assets</div>
              <div className="text-3xl font-bold">{data.total}</div>
            </div>
          </div>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No asset data to display in chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
