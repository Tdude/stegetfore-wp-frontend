// src/lib/types.ts

export interface MenuItem {
  ID: number;
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
  template?: string;
  featured_image_url?: string | null;
  categories: number[];
}

export interface Page {
  chartData: { segments: number[] } | undefined;
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
