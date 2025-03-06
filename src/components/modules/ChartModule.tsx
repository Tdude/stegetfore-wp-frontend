// src/components/modules/ChartModule.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { ChartModule as ChartModuleType } from '@/lib/types';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import Chart from 'chart.js/auto';

interface ChartModuleProps {
  module: ChartModuleType;
  className?: string;
}

export default function ChartModule({ module, className }: ChartModuleProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Create and update chart
  useEffect(() => {
    if (!chartRef.current || !module.data) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: module.chart_type,
      data: module.data,
      options: module.options || {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!module.title,
            text: module.title || '',
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [module]);

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-6">{module.title}</h2>
          )}

          <Card className="p-6">
            <div className="w-full aspect-[16/9]">
              <canvas ref={chartRef} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}