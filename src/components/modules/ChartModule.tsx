// src/components/modules/ChartModule.tsx
'use client';

import React from 'react';
import { ChartModule as ChartModuleType } from '@/lib/types';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  Bar,
  Line,
  Pie,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  RadialBar
} from 'recharts';

interface ChartModuleProps {
  module: ChartModuleType;
  className?: string;
}

export default function ChartModule({ module, className }: ChartModuleProps) {
  // Helper function to render the appropriate chart type
  const renderChart = () => {
    switch (module.chart_type) {
      case 'bar':
        return (
          <BarChart data={module.data.datasets[0].data.map((value, index) => ({
            name: module.data.labels[index],
            value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="var(--chart-1)" />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={module.data.datasets[0].data.map((value, index) => ({
            name: module.data.labels[index],
            value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="var(--chart-1)" />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={module.data.datasets[0].data.map((value, index) => ({
                name: module.data.labels[index],
                value
              }))}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="var(--chart-1)"
              dataKey="value"
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart data={module.data.datasets[0].data.map((value, index) => ({
            subject: module.data.labels[index],
            value
          }))}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar
              name={module.data.datasets[0].label}
              dataKey="value"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.6}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        );

      // Default to bar chart
      default:
        return (
          <BarChart data={module.data.datasets[0].data.map((value, index) => ({
            name: module.data.labels[index],
            value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="var(--chart-1)" />
          </BarChart>
        );
    }
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-6">{module.title}</h2>
          )}

          <Card className="p-6">
            <ChartContainer
              config={{
                chart1: { color: 'var(--chart-1)' },
                chart2: { color: 'var(--chart-2)' },
                chart3: { color: 'var(--chart-3)' },
                chart4: { color: 'var(--chart-4)' },
                chart5: { color: 'var(--chart-5)' }
              }}
            >
              {renderChart()}
            </ChartContainer>
          </Card>
        </div>
      </div>
    </section>
  );
}