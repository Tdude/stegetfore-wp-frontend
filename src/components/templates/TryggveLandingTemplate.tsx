// src/components/templates/TryggveLandingTemplate.tsx
'use client';

import React from 'react';
import { Page } from '@/lib/types/contentTypes';
import { TryggveLandingData } from '@/lib/types/tryggveLandingTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import TryggveHeroSection from '@/components/tryggve/TryggveHeroSection';
import TryggveTargetAudienceSection from '@/components/tryggve/TryggveTargetAudienceSection';
import TryggveProblemSection from '@/components/tryggve/TryggveProblemSection';
import TryggveSolutionSection from '@/components/tryggve/TryggveSolutionSection';
import TryggveCourseSection from '@/components/tryggve/TryggveCourseSection';
import TryggveContactFormSection from '@/components/tryggve/TryggveContactFormSection';
import TryggveClosingSection from '@/components/tryggve/TryggveClosingSection';
import DebugPanel from '@/components/debug/DebugPanel';

interface TryggveLandingTemplateProps {
  page: Page;
  landingData?: TryggveLandingData;
}

// Default data based on the OpenAI output
const defaultLandingData: TryggveLandingData = {
  hero: {
    title: 'Bygg en skola där även de svårnådda barnen lyckas',
    subtitle: 'Tryggve är en forskningsförankrad modell som hjälper skolor att förstå, möta och inkludera barn med komplexa behov – innan de faller utanför.',
    backgroundImage: '/images/bubbelbarn-hero.png',
    backgroundColor: '#FFB800',
    buttons: [
      {
        text: 'Boka plats på kursen',
        url: '#contact',
        style: 'primary',
      },
      {
        text: 'Få mer information',
        url: '#course',
        style: 'secondary',
      },
    ],
  },
  targetAudience: {
    title: 'Den här kursen är för dig som leder en skola där alla barn ska få plats',
    description: 'Kursen riktar sig till rektorer, specialpedagoger och elevhälsoteam som vill:',
    points: [
      'Förstå och stötta elever som "inte passar in" i skolans mallar',
      'Få ett vetenskapligt grundat språk för att prata om beteende och lärande',
      'Skapa ett relationellt och förebyggande elevhälsoarbete',
      'Minska behovet av medicinska insatser genom att agera tidigare',
    ],
    testimonial: {
      quote: 'Tryggve gav oss ett gemensamt språk för att förstå eleverna bakom beteendena.',
      author: 'Specialpedagog',
      role: 'Göteborgs stad',
    },
  },
  problem: {
    title: 'De sårbara barnen är inte få. De är framtiden vi riskerar att förlora.',
    description: '',
    statistics: [
      {
        value: '1/3',
        label: 'av eleverna lämnar gymnasiet utan examen',
      },
      {
        value: '1/4',
        label: 'står utan jobb eller utbildning fem år senare',
      },
      {
        value: '16 miljoner kr',
        label: 'kostar varje liv i utanförskap',
      },
    ],
    closingText: 'Bakom dessa siffror finns barn som hade kunnat lyckas – om vi förstått dem i tid.',
  },
  solution: {
    title: 'En forskningsbaserad modell som gör skillnad i klassrummet',
    description: 'Tryggve bygger på anknytningsteori och pedagogisk psykologi. Den hjälper skolpersonal att:',
    features: [
      {
        icon: '',
        title: 'Bygger broar',
        description: 'Mellan medicinskt och pedagogiskt perspektiv',
      },
      {
        icon: '',
        title: 'Forskningsförankrad',
        description: 'Utvecklad med stöd av forskning och klinisk erfarenhet',
      },
      {
        icon: '',
        title: 'Konkreta verktyg',
        description: 'Ger praktiska metoder för skolvardagen',
      },
    ],
  },
  course: {
    title: 'Kursen: "Se potentialen i skolans bubbelbarn"',
    description: '',
    benefits: [
      'Förståelse för barns anknytningsmönster och deras betydelse i skolan',
      'Verktyg att bygga den avgörande relationen',
      'Strategier för att möta "bubbelbarn" med adekvata förväntningar',
      'En modell som kan implementeras direkt i skolans vardag',
    ],
    ctaButton: {
      text: 'Anmäl intresse för nästa kursstart',
      url: '#contact',
      style: 'primary',
    },
  },
  contactForm: {
    title: 'Intresseanmälan till Tryggve-kursen',
    subtitle: 'Fyll i dina uppgifter så skickar vi information om nästa kursstart och hur du kan delta.',
    successMessage: 'Tack! Vi kontaktar dig inom kort med mer information om kursen och hur ni kan ta första steget mot en mer relationell skola.',
    fields: [
      {
        name: 'your-name',
        label: 'Namn',
        type: 'text',
        required: true,
        placeholder: 'Ditt namn',
      },
      {
        name: 'your-email',
        label: 'E-post',
        type: 'email',
        required: true,
        placeholder: 'din@email.se',
      },
      {
        name: 'your-role',
        label: 'Roll / Skola',
        type: 'text',
        required: true,
        placeholder: 'T.ex. Rektor, Södra skolan',
      },
      {
        name: 'your-message',
        label: 'Meddelande',
        type: 'textarea',
        required: false,
        placeholder: 'Berätta gärna mer om era behov...',
      },
    ],
    submitButtonText: 'Skicka intresseanmälan',
  },
  closing: {
    quote: 'Tryggve hjälper skolor att se det osynliga – att förstå barnen bakom beteendena.',
    author: 'Utvecklingsteamet bakom Tryggve',
  },
};

export default function TryggveLandingTemplate({ 
  page, 
  landingData 
}: TryggveLandingTemplateProps) {
  // Use provided data or fall back to defaults
  const data = landingData || defaultLandingData;

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <TryggveHeroSection data={data.hero} />

        {/* Target Audience Section */}
        <TryggveTargetAudienceSection data={data.targetAudience} />

        {/* Problem Section */}
        <TryggveProblemSection data={data.problem} />

        {/* Solution Section */}
        <TryggveSolutionSection data={data.solution} />

        {/* Course Offer Section */}
        <TryggveCourseSection data={data.course} id="course" />

        {/* Contact Form Section */}
        <TryggveContactFormSection data={data.contactForm} id="contact" formId={748} />

        {/* Closing Section */}
        <TryggveClosingSection data={data.closing} />

        {/* Debug Panel */}
        <DebugPanel 
          title="Tryggve Landing Page Debug" 
          page={page}
          additionalData={{
            "Template": "TryggveLandingTemplate",
            "Sections": "7 sections",
            "Data Source": landingData ? "Custom" : "Default"
          }}
        />
      </div>
    </TemplateTransitionWrapper>
  );
}
