// src/app/[slug]/not-found.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Friendly phrases for 404 page
const notFoundTitles = [
  "Gravitationsfel upptäckt",
  "Sidan försvann i rymden",
  "Ingen kontakt med moderskeppet",
  "Fel kurs. Testa igen.",
  "Du har flutit iväg",
  "Sidan finns inte i denna galax",
  "Mission Failed Successfully",
];

const notFoundPhrases = [
  "Vi skickar en räddningssond (och kaffe).",
  "Inga kattungar kom till skada, men sidan är borta.",
  "Du är nu mer vilse än vår astronaut. Tryck på hemknappen.",
  "Sidan försvann i ett svart hål. Vi petar med en pinne.",
  "Testa att skaka lite på skärmen – ibland funkar det.",
  "Har du testat starta om?",
  "Försök igen senare (eller skicka choklad).",
  "Sidan är på vift. Vi letar...",
];

const notFoundButtons = [
  "Startsidan",
  "Startknappen",
  "Försök igen",
  "Skicka choklad",
  "Starta om",
  "Rädda mig!",
  "Rädda dig!",
  "DO NOT TOUCH",
  "Återställ gravitation",
];

function getRandomFrom<T>(arr: T[], fallback?: T): T {
  if (!arr || arr.length === 0) return fallback as T;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function NotFound() {
    return (
        <article className="max-w-6xl flex flex-col items-center mx-auto px-4 my-2">
            <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg">
              <Image
                src="/images/astronaut.svg"
                alt="404"
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1024px"
                priority={true}
                className="object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold mb-12">404 - {getRandomFrom(notFoundTitles)}</h1>
            <p className="text-gray-600 mb-8">{getRandomFrom(notFoundPhrases)}</p>
            <Link href="/start" className="inline-block">
              <Button variant="primary" size="md" className="px-4 py-1">
                {getRandomFrom(notFoundButtons)}
              </Button>
            </Link>
          </article>
    );
}



