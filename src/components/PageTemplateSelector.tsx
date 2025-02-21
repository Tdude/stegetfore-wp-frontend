// src/components/PageTemplateSelector.tsx
import { AnimatePresence } from 'framer-motion';
import { Page, PageTemplate } from '@/lib/types';
import DefaultTemplate from './templates/DefaultTemplate';
import FullWidthTemplate from './templates/FullWidthTemplate';
import SidebarTemplate from './templates/SidebarTemplate';

export default function PageTemplateSelector({ page }: { page: Page }) {
  const template = page.meta?._wp_page_template;

  return (
    <AnimatePresence mode="wait">
      {(() => {
        switch (template) {
          case PageTemplate.FULL_WIDTH:
            return <FullWidthTemplate key="full-width" page={page} />;
          case PageTemplate.SIDEBAR:
            return <SidebarTemplate key="sidebar" page={page} />;
          case undefined:
          case '':
          case PageTemplate.DEFAULT:
          default:
            return <DefaultTemplate key="default" page={page} />;
        }
      })()}
    </AnimatePresence>
  );
}