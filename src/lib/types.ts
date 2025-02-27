import * as React from "react";

// Obsverktyget
export interface FormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

export interface MenuItem {
  ID: number;
  id?: number; // Added for compatibility
  title: string;
  url: string;
  slug: string;
  target: string;
  children?: MenuItem[];
}

export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
}

export interface Post {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_image_url?: string | null;
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: [
      {
        source_url: string;
      }
    ];
  };
  template?: string;
}

export interface Page {
  id?: number;
  slug?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  template?: string;
  chartData?: {
    segments: number[];
  } | null;
}

export interface LocalPage {
  chartData: { segments: number[] } | undefined | null;
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  slug: string;
  template?: string;
  featured_image_url?: string | null;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        width: number;
        height: number;
        sizes?: {
          [key: string]: {
            source_url: string;
            width: number;
            height: number;
          };
        };
      };
    }>;
  };
  evaluationId?: string;
}

export interface HomepageData {
  featured_posts: Post[];
  categories: Record<number, { id: number; name: string; slug: string }>;
  [key: string]: unknown;
}

export interface WPCF7Form {
  id: number;
  title: string;
  properties: {
    form: string;
    mail: {
      subject: string;
      sender: string;
      body: string;
      recipient: string;
      additional_headers: string;
      attachments: string;
      use_html: boolean;
      exclude_blank: boolean;
    };
  };
}

export interface WPCF7SubmissionResponse {
  status:
    | "mail_sent"
    | "mail_failed"
    | "validation_failed"
    | "spam"
    | "aborted"
    | "unaccepted_terms";
  message: string;
  postedData?: Record<string, string>;
  invalidFields?: Array<{
    field: string;
    message: string;
  }>;
  into?: string;
}

export enum PageTemplate {
  DEFAULT = "default",
  HOMEPAGE = "templates/homepage.php",
  FULL_WIDTH = "templates/full-width.php",
  SIDEBAR = "templates/sidebar.php",
  LANDING = "templates/landing.php",
  EVALUATION = "templates/evaluation.php",
  CIRCLE_CHART = "templates/circle-chart.php",
  CONTACT = "templates/contact",
}

export interface PageTemplateSelectorProps<T = HomepageData> {
  page: LocalPage & {
    type?: string;
    template?: string;
    id?: number;
    slug?: string;
    title?: { rendered: string };
  };
  isHomePage?: boolean; // New prop to force homepage template
  homepageData?: T; // Generic type with default
}

// Types for saving evaluation
//interface SaveResponse {
//  success: boolean;
//  id: number;
//  message: string;
//}
//
//interface LoadedData {
//  id: number;
//  formData: FormData;
//  last_updated: string;
//}

export interface LocalFormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

export interface SubSectionProps {
  title: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    stage: "ej" | "trans" | "full";
  }>;
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionKey: keyof FormData;
  fieldName: string;
  calculateProgress: (section: keyof FormData, field: string) => number;
}

export interface ProgressBarProps {
  value: number;
  type: "section" | "total";
  stage?: "ej" | "trans" | "full";
}

// Initial form state
export const initialFormState: LocalFormData = {
  anknytning: {
    narvaro: "",
    dialog1: "",
    dialog2: "",
    blick: "",
    beroring: "",
    konflikt: "",
    fortroende: "",
    comments: {},
  },
  ansvar: {
    impulskontroll: "",
    forberedd: "",
    fokus: "",
    turtagning: "",
    instruktion: "",
    arbeta_sjalv: "",
    tid: "",
    comments: {},
  },
};

export interface HomepageTemplateProps {
  page: Page;
  homepage?: HomepageData;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
