// components/LivshjuletCHart.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplateTransitionWrapper from './TemplateTransitionWrapper';

interface ActiveSegment {
  ring: number;
  segment: number;
}

type CircleChartTemplateProps = {
  className?: string;
}

const CircleChartTemplate = ({
  className
}: CircleChartTemplateProps) => {
    const [activeSegments, setActiveSegments] = useState<ActiveSegment[]>([]);
  const NUM_SEGMENTS = 8;
  const NUM_RINGS = 5;
  const RADIUS_STEP = 50;
  const STORAGE_KEY = "donutChartState";

  const segmentLabels = [
    "Ekonomi",
    "Fysisk omgivning",
    "Kärlek",
    "Nöjen/fritid",
    "Arbete",
    "Relationer",
    "Hälsa",
    "Egen utveckling",
  ];

  const getGreenTint = (ring) => {
    const baseColor = 50;
    const tintStep = 35;
    return `rgb(${baseColor + tintStep * (NUM_RINGS - ring)},
                ${150 + tintStep * (NUM_RINGS - ring)},
                ${baseColor + tintStep * (NUM_RINGS - ring)})`;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const handleSegmentClick = (clickedRing, segment) => {
    const isActive = activeSegments.some(s =>
      s.ring === clickedRing && s.segment === segment
    );

    let newActiveSegments = [...activeSegments];

    if (clickedRing === 4) { // Outermost ring
      if (!isActive) {
        // Activate all rings in this segment
        for (let ring = 0; ring < NUM_RINGS; ring++) {
          newActiveSegments.push({ ring, segment });
        }
      } else {
        // Deactivate all rings in this segment
        newActiveSegments = newActiveSegments.filter(s => s.segment !== segment);
      }
    } else if (clickedRing === 0) { // Innermost ring
      if (!isActive) {
        newActiveSegments.push({ ring: 0, segment });
      } else {
        newActiveSegments = newActiveSegments.filter(s =>
          !(s.segment === segment)
        );
      }
    } else { // Middle rings
      if (isActive) {
        newActiveSegments = newActiveSegments.filter(s =>
          !(s.segment === segment && s.ring >= clickedRing)
        );
      } else {
        for (let ring = 0; ring <= clickedRing; ring++) {
          if (!newActiveSegments.some(s => s.ring === ring && s.segment === segment)) {
            newActiveSegments.push({ ring, segment });
          }
        }
      }
    }

    setActiveSegments(newActiveSegments);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newActiveSegments));
  };

  const resetChart = () => {
    setActiveSegments([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      setActiveSegments(JSON.parse(savedState));
    }
  }, []);

  const renderLabels = () => {
    return segmentLabels.map((label, index) => {
      const angle = (360 / NUM_SEGMENTS) * index + 360 / NUM_SEGMENTS / 2;
      const labelRadius = 280;
      const pos = polarToCartesian(0, 0, labelRadius, angle);

      let rotation = angle;
      if (angle > 90 && angle < 270) {
        rotation += 180;
      }

      return (
        <text
          key={`label-${index}`}
          x={pos.x}
          y={pos.y}
          className="text-sm font-sans text-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${pos.x}px ${pos.y}px`,
          }}
        >
          {label}
        </text>
      );
    });
  };

  const renderSegments = () => {
    const segments = [];

    for (let ring = 0; ring < NUM_RINGS; ring++) {
      const innerRadius = ring * RADIUS_STEP;
      const outerRadius = (ring + 1) * RADIUS_STEP;

      for (let seg = 0; seg < NUM_SEGMENTS; seg++) {
        const startAngle = (360 / NUM_SEGMENTS) * seg;
        const endAngle = (360 / NUM_SEGMENTS) * (seg + 1);

        const isActive = activeSegments.some(s =>
          s.ring === ring && s.segment === seg
        );

        segments.push(
          <path
            key={`segment-${ring}-${seg}`}
            d={describeArc(0, 0, innerRadius, outerRadius, startAngle, endAngle)}
            fill={isActive ? getGreenTint(ring) : "white"}
            stroke="gray"
            className={`
              transition-all duration-200 ease-in-out cursor-pointer
              hover:opacity-90 ${ring === 0 ? 'hover:scale-110' : ''}
            `}
            onClick={() => handleSegmentClick(ring, seg)}
            style={{
              transformOrigin: 'center',
              transformBox: 'fill-box'
            }}
          />
        );
      }
    }

    return segments;
  };

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center space-y-6">
        <svg
          className="w-full max-w-2xl aspect-square"
          viewBox="-300 -300 600 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ... your SVG content */}
        </svg>

        <Button
          onClick={resetChart}
          variant="outline"
          className="w-32"
        >
          Återställ
        </Button>
      </CardContent>
    </Card>
  );
};

export default CircleChartTemplate;