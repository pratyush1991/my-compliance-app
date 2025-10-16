import { Geography } from './types';
import type { GeographyValue, Standard } from './types';

export const GEOGRAPHY_STANDARDS_MAP: Record<GeographyValue, Standard[]> = {
  [Geography.US]: [
    { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
    { id: 'fda_21_cfr_part_11', name: 'FDA 21 CFR Part 11', description: 'FDA regulations on electronic records and signatures' },
    { id: 'hitech', name: 'HITECH Act', description: 'Health Information Technology for Economic and Clinical Health Act' },
  ],
  [Geography.LATAM]: [
    { id: 'lgpd', name: 'LGPD (Brazil)', description: 'Lei Geral de Proteção de Dados' },
    { id: 'anmat', name: 'ANMAT (Argentina)', description: 'Regulations for medical devices and drugs' },
  ],
  [Geography.EMEA]: [
    { id: 'gdpr', name: 'GDPR', description: 'General Data Protection Regulation' },
    { id: 'mdr', name: 'MDR', description: 'Medical Device Regulation (EU) 2017/745' },
    { id: 'ivdr', name: 'IVDR', description: 'In Vitro Diagnostic Regulation (EU) 2017/746' },
  ],
  [Geography.JAPAC]: [
    { id: 'appi', name: 'APPI (Japan)', description: 'Act on the Protection of Personal Information' },
    { id: 'tga', name: 'TGA (Australia)', description: 'Therapeutic Goods Administration regulations' },
    { id: 'pdpd', name: 'PDPD (India)', description: 'Personal Data Protection Draft' },
  ],
};
