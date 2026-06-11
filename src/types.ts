export interface ToolStackItem {
  name: string;
  category: string;
  description: string;
  icon: string; // lucide icon name
}

export interface MetricRow {
  id: string;
  label: string;
  value: string;
  badge: string;
  trend: 'up' | 'down' | 'steady';
  details: string;
}

export interface PartnerLogo {
  name: string;
  industry: string;
  svgPath: string;
}

export interface PainPointCard {
  id: number;
  title: string;
  description: string;
  impact: string;
  solution: string;
}

export interface PipelineStep {
  number: number;
  title: string;
  tagline: string;
  description: string;
  hoverAccent: string;
}

export interface TimelineMilestone {
  year: string;
  operatives: string;
  milestone: string;
}

export interface ServiceVertical {
  id: 'roofing' | 'solar' | 'realestate' | 'webdev';
  title: string;
  tagline: string;
  heroTagline: string;
  campaignBlueprint: {
    title: string;
    description: string;
    tactics: string[];
  };
  termSpecifics: {
    label: string;
    items: string[];
  };
  primaryCta: string;
  accent: string;
  metrics: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarText: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}
