// components/homepage/StatsSection.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  id: number;
  value: string;
  label: string;
  icon?: string;
}

interface StatsSectionProps {
  stats: Stat[];
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

export default function StatsSection({
  stats,
  title = "Vårt arbete i siffror",
  subtitle = "Att vi är stolta är bara förnamnet. Bakom varje siffra finns ett barn.",
  backgroundColor = "bg-muted/30"
}: StatsSectionProps) {
  // Default icons if not provided
  const defaultIcons = [
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`, // Activity
    `<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>`, // Award
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>`, // Box
    `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`, // Clock
  ];

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className="container px-4 md:px-6 mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{
            // Golden ratio - each column is approximately 1.618 times wider than it is tall
            gridTemplateRows: 'minmax(0, 1fr)',
            gridAutoRows: 'minmax(0, 1fr)'
          }}
        >
          {stats.map((stat, index) => (
            <Card
              key={stat.id}
              className="border-0 shadow-md bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all"
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: stat.icon || defaultIcons[index % defaultIcons.length] }}
                  />
                </div>

                {/* Count with golden ratio division */}
                <div className="mb-2 relative">
                  <span className="text-4xl font-bold">{stat.value}</span>
                  {/* Decorative underline using golden ratio */}
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary h-1 rounded-full"
                    style={{ width: 'calc(100% / 1.618)' }} // Golden ratio
                  ></div>
                </div>

                {/* Label */}
                <p className="text-lg text-muted-foreground mt-3">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}