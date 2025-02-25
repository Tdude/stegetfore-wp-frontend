// components/LifeWheelChart.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActiveSegment {
  ring: number;
  segment: number;
}

type LifeWheelChartProps = {
  className?: string;
}


const hoverStyles = `
  path[data-ring="0"] {
    transform-origin: center;
    transform-box: fill-box;
    transition: all 0.2s ease;
  }
  path[data-ring="0"]:hover {
    transform: scale(1.2);
    stroke: #333;
    stroke-width: 2;
    z-index: 10;
  }
`;

const LifeWheelChart = ({
  className
}: LifeWheelChartProps) => {
  const [activeSegments, setActiveSegments] = useState<ActiveSegment[]>([]);
  const NUM_SEGMENTS = 8;
  const NUM_RINGS = 5;
  const RADIUS_STEP = 50;
  const STORAGE_KEY = "lifeWheelChartState";

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

  const getGreenTint = (ring: number): string => {
    const baseColor = 50;
    const tintStep = 35;
    return `rgb(${baseColor + tintStep * (NUM_RINGS - ring)},
                ${150 + tintStep * (NUM_RINGS - ring)},
                ${baseColor + tintStep * (NUM_RINGS - ring)})`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ): string => {
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

  const isSegmentActive = (ring: number, segment: number): boolean => {
    return activeSegments.some(s => s.ring === ring && s.segment === segment);
  };

  const handleSegmentClick = (clickedRing: number, segment: number) => {
    const isActive = isSegmentActive(clickedRing, segment);
    let newActiveSegments = [...activeSegments];

    if (clickedRing === 4) { // Outermost ring
      if (!isActive) {
        // Activate all rings in this segment
        for (let ring = 0; ring < NUM_RINGS; ring++) {
          if (!isSegmentActive(ring, segment)) {
            newActiveSegments.push({ ring, segment });
          }
        }
      } else {
        // Deactivate only this specific ring in this segment
        newActiveSegments = newActiveSegments.filter(s =>
          !(s.ring === clickedRing && s.segment === segment)
        );
      }
    } else if (clickedRing === 0) { // Innermost ring
      if (isActive) {
        // Deactivate all rings in this segment
        newActiveSegments = newActiveSegments.filter(s => s.segment !== segment);
      } else {
        // Only activate the innermost ring
        newActiveSegments.push({ ring: 0, segment });
      }
    } else { // Middle rings
      if (isActive) {
        // Deactivate this ring and all rings above it in the same segment
        newActiveSegments = newActiveSegments.filter(s =>
          !(s.segment === segment && s.ring >= clickedRing)
        );
      } else {
        // Activate this ring and all rings below it in the same segment
        for (let ring = 0; ring <= clickedRing; ring++) {
          if (!isSegmentActive(ring, segment)) {
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
    // Load saved state on component mount
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        setActiveSegments(JSON.parse(savedState));
      } catch (e) {
        console.error("Failed to parse saved chart state:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Add custom CSS for hover effect using a style tag
    const style = document.createElement('style');
    style.textContent = hoverStyles;
    document.head.appendChild(style);

    // Clean up function will remove the style element when component unmounts
    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const renderSegments = () => {
    const segments = [];

    for (let ring = 0; ring < NUM_RINGS; ring++) {
      const innerRadius = ring * RADIUS_STEP;
      const outerRadius = (ring + 1) * RADIUS_STEP;

      for (let seg = 0; seg < NUM_SEGMENTS; seg++) {
        const startAngle = (360 / NUM_SEGMENTS) * seg;
        const endAngle = (360 / NUM_SEGMENTS) * (seg + 1);
        const isActive = isSegmentActive(ring, seg);

        segments.push(
          <path
            key={`segment-${ring}-${seg}`}
            d={describeArc(0, 0, innerRadius, outerRadius, startAngle, endAngle)}
            fill={isActive ? getGreenTint(ring) : "white"}
            stroke="gray"
            strokeWidth={1}
            data-ring={ring}
            data-segment={seg}
            className="transition-all duration-200 ease-in-out cursor-pointer hover:opacity-90"
            onClick={() => handleSegmentClick(ring, seg)}
          />
        );
      }
    }

    return segments;
  };

  const handleSegmentHover = (event) => {
    const segment = event.target;
    if (segment.getAttribute('data-ring') === '0') {
      const svg = segment.closest('svg');
      if (svg) {
        svg.appendChild(segment);
      }
    }
  };

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
            textAnchor: "middle",
            dominantBaseline: "middle",
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${pos.x}px ${pos.y}px`,
          }}
        >
          {label}
        </text>
      );
    });
  };

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center p-6 space-y-6">
      <svg
          className="w-full max-w-2xl aspect-square border border-gray-200 bg-white"
          viewBox="-300 -300 600 600"
          preserveAspectRatio="xMidYMid meet"
          onMouseOver={handleSegmentHover}
        >
          <circle cx="0" cy="0" r="250" fill="white" stroke="gray" />
          {renderSegments()}
          {renderLabels()}
        </svg>
        <Button
          onClick={resetChart}
          variant="default"
          className="w-32"
        >
          Nollställ
        </Button>
      </CardContent>
    </Card>
  );
};

export default LifeWheelChart;