// src/components/templates/TryggveLandingTemplate.tsx
'use client';

import React from 'react';
import { Page } from '@/lib/types/contentTypes';
import { TryggveLandingData } from '@/lib/types/tryggveLandingTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import TryggveHeroSection from '@/components/tryggve/TryggveHeroSection';
import TryggveTargetAudienceSection from '@/components/tryggve/TryggveTargetAudienceSection';
import TryggveTextPanel from '@/components/tryggve/TryggveTextPanel';
import TryggveProblemSection from '@/components/tryggve/TryggveProblemSection';
import TryggveSellingCards from '@/components/tryggve/TryggveSellingCards';
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
    title: 'Se potentialen i skolans sårbara barn',
    subtitle: 'Förstå, möt och inkludera barn med komplexa behov.',
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
    title: 'Från vilsenhet till att leda Steget Före',
    description: 'Våra onlineseminarier riktar sig till dig som är verksam i skolans värld och vill:',
    points: [
      'Förstå och stötta elever med ett utmanande beteende',
      'Få ett gemensamt språk för att prata om beteende, utveckling och lärande',
      'Skapa ett relationellt och proaktivt förhållnings- och tillvägagångssätt',
      'Förebygga behovet av medicinsk behandling genom att agera tidigt',
      'Få "bukt med problematiskt beteende" och istället se och förstå otryggheten',
    ],
    testimonials: [
      {
        quote: 'Eran kurs har gett oss ett gemensamt språk. Vi har börjat prata om att knyta an, och kan sätta ord på att vi har barn i våra klasser som ännu inte är elever.',
        author: 'Lärare',
        role: 'Norrtälje',
      },
      {
        quote: 'Barn är som dom är av en anledning, vi behöver möta dom med vuxnas klokhet och förstå att det pedagogiskt går att göra nåt!',
        author: 'Skolledare',
        role: 'Haninge',
      },
    ],
  },
  textPanel: {
    title: 'Varför Tryggve?',
    content: '<p>Varför gör det utagerande barnet som det gör? Förstår du det så vet du också att bestraffningar och konsekvenstrappor i sig inte är en lyckad pedagogisk lösning.</p><p>Steget före handlar om att förstå och utveckla pedagogiska lösningar för att sårbara barn ska komma till rätta i skolan.</p>',
  },
  problem: {
    title: 'De sårbara barnen är många. De är framtiden vi riskerar att förlora.',
    description: '',
    statistics: [
      {
        value: '1/3',
        label: 'av eleverna lämnar gymnasiet utan examen',
      },
      {
        value: '1/4',
        label: 'av dessa elever står utan jobb eller utbildning fem år senare',
      },
      {
        value: '16 miljoner kr',
        label: 'kostar varje liv i utanförskap',
      },
    ],
    closingText: 'Bakom dessa siffror finns barn som hade kunnat lyckas – om vi förstått dem och agerat i tid.',
  },
  sellingCards: {
    title: 'Vad får du med Tryggve?',
    description: 'Fyra nyckelområden som gör skillnad',
    cards: [
      {
        image: 'https://cms.stegetfore.nu/wp-content/uploads/2025/05/hoodie.svg',
        title: 'Förståelse',
        description: 'Lär dig se bakom beteendet och förstå barnets behov',
      },
      {
        image: 'https://cms.stegetfore.nu/wp-content/uploads/2025/05/bli-sedd.svg',
        title: 'Verktyg',
        description: 'Konkreta metoder för klassrummet som fungerar',
      },
      {
        image: 'https://cms.stegetfore.nu/wp-content/uploads/2025/05/kollegialt-samtal.svg',
        title: 'Stöd',
        description: 'Ett nätverk av kollegor som delar dina utmaningar',
      },
      {
        image: 'https://cms.stegetfore.nu/wp-content/uploads/2025/05/korridor-snackar.svg',
        title: 'Resultat',
        description: 'Beprövade metoder som leder till verklig förändring',
      },
    ],
  },
  solution: {
    title: 'En forskningsförankrad modell som gör skillnad i klassrummet',
    description: 'Tryggve bygger på anknytningsteori och pedagogisk psykologi. Den hjälper dig med:',
    features: [
      {
        icon: '',
        title: 'Att bygga broar',
        description: 'Mellan det pedagogiska och medicinska perspektivet',
      },
      {
        icon: '',
        title: 'Hållbara lösningar',
        description: 'Utgår från relationell och jag-strukturerande pedagogik',
      },
      {
        icon: '',
        title: 'Konkreta verktyg',
        description: 'Ger dig praktiska metoder för skolvardagen',
      },
    ],
  },
  course: {
    title: 'Kursen: "Se potentialen i skolans sårbara barn"',
    description: 'Under kursen får du:',
    benefits: [
      'Förståelse för bakomliggande orsaker till utmanande beteenden',
      'Pedagogiska strategier för att bygga den avgörande relationen',
      'Pedagogiska strategier för att möta "sårbara barn" med adekvata förväntningar och verksamma pedagogiska lösningar',
      'Ett skolrelaterat språk för personlig utveckling',
      'En modell som kan implementeras direkt i skolans vardag',
      'Bok och material så du kan omsätta kursen i praktiken på din skola',
    ],
    ctaButton: {
      text: 'Anmäl intresse för nästa kursstart',
      url: '#contact',
      style: 'primary',
    },
  },
  contactForm: {
    title: 'Intresseanmälan till Tryggve-kursen "Steget Före"',
    subtitle: 'Fyll i dina uppgifter så skickar vi information om nästa kursstart Vt-26 och hur du kan delta.',
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

        {/* Text Panel (Optional) */}
        {data.textPanel && (
          <TryggveTextPanel 
            title={data.textPanel.title}
            content={data.textPanel.content}
          />
        )}

        {/* Problem Section */}
        <TryggveProblemSection data={data.problem} />

        {/* Selling Cards (Optional) */}
        {data.sellingCards && (
          <TryggveSellingCards 
            title={data.sellingCards.title}
            description={data.sellingCards.description}
            cards={data.sellingCards.cards}
          />
        )}

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
