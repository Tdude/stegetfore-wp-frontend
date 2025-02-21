// src/components/templates/FullWidthTemplate.tsx
export default function FullWidthTemplate({ page }: { page: Page }) {
  return (
    <TemplateTransitionWrapper>
      <article className="w-full">
        <h1
          className="text-4xl font-bold mb-4 text-center"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
        <div
          className="prose max-w-none px-4"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </article>
    </TemplateTransitionWrapper>
  );
}