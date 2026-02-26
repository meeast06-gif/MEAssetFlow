"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, PieChart as PieChartIcon } from "lucide-react";

import { Asset } from "@/lib/definitions";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  assets: Asset[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {data.type}
            </span>
            <span className="font-bold text-muted-foreground">
              {formatCurrency(data.value)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export default function SummaryCards({ assets }: SummaryCardsProps) {
  const { totalValue, distribution } = useMemo(() => {
    const total = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const distMap = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + asset.currentValue;
      return acc;
    }, {} as Record<string, number>);
    
    const distArray = Object.entries(distMap).map(([type, value]) => ({
      type,
      value,
    })).sort((a, b) => b.value - a.value);

    return { totalValue: total, distribution: distArray };
  }, [assets]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Asset Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Total value across {assets.length} assets
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Asset Distribution</CardTitle>
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconSize={8}
                        wrapperStyle={{
                            fontSize: '12px',
                            lineHeight: '20px'
                        }}
                    />
                    <Pie
                        data={distribution}
                        dataKey="value"
                        nameKey="type"
                        cx="35%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                    {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            ) : (
                <div className="flex h-[140px] items-center justify-center text-sm text-muted-foreground">
                    No assets to display.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
