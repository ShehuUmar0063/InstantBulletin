
export interface ImageMetadata {
  url: string;
  scale: number;
  fit: 'cover' | 'contain';
  position: { x: number; y: number };
}

export interface EventPage {
  title?: string;
  content: string;
  images: ImageMetadata[];
}

export interface EventData {
  title: string;
  date: string;
  location: string;
  content: string; // Front page content
  highlights: string[];
  coverImage?: ImageMetadata;
  logo?: ImageMetadata;
  additionalPages: EventPage[];
}

export type FontFamily = 'serif' | 'sans';
export type TemplateId = 'classic' | 'modern' | 'magazine' | 'minimal' | 'executive' | 'gallery' | 'editorial' | 'corporate';

export interface BulletinConfig {
  primaryColor: string;
  fontFamily: FontFamily;
  templateId: TemplateId;
  pageCount: number;
}
