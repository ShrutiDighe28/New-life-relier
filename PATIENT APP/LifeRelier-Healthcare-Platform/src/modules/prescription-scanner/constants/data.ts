import { ShieldCheck, Zap, Pill } from 'lucide-react-native';
import { FeatureCard, SecurityCardProps, HeroProps } from '../types';

export const HERO_DATA: HeroProps = {
  title: 'Smart AI Analysis',
  subtitle: 'Instant insights and medicine details from your prescription',
};

export const SUPPORTED_FORMATS_TEXT = 'Supported formats: JPG, PNG, PDF';

export const FEATURE_CARDS_DATA: FeatureCard[] = [
  {
    id: 'f1',
    title: 'Fast Extraction',
    description: 'Advanced AI extracts text from your prescriptions instantly.',
    icon: Zap,
    capabilities: ['ocr'],
  },
  {
    id: 'f2',
    title: 'Medicine Insights',
    description: 'Get detailed information, interactions, and usage instructions.',
    icon: Pill,
    capabilities: ['nlp'],
  },
];

export const SECURITY_CARD_DATA: SecurityCardProps = {
  title: '100% Secure & Private',
  description: 'Your medical data is encrypted end-to-end and strictly HIPAA compliant.',
  hipaaCompliant: true,
  endToEndEncryption: true,
};
