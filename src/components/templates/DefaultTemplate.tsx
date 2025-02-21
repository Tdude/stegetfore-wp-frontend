// src/components/templates/DefaultTemplate.tsx
import { Page } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';

export default function DefaultTemplate({ page }: { page: Page }) {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <TemplateTransitionWrapper>
      <article className="max-w-3xl mx-auto">
        {featuredImage && (
          <img
            src={featuredImage}
            alt={page.title.rendered}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}

        <h1
          className="text-4xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </article>
    </TemplateTransitionWrapper>
  );
}