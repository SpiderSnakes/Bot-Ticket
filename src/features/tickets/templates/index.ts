import { V2MessageOptions } from '../../../componentsV2/builder.js';
import { buildEclipseTemplate } from './eclipse.js';
import { buildEtudiantTemplate } from './etudiant.js';
import { buildTechniqueTemplate } from './technique.js';
import { buildQuestionsTemplate } from './questions.js';
import { buildPostulerTemplate } from './postuler.js';
import { buildAutresTemplate } from './autres.js';

type TemplateBuilder = () => V2MessageOptions;

const templates: Record<string, TemplateBuilder> = {
  eclipse_auto: buildEclipseTemplate,
  etudiant_auto: buildEtudiantTemplate,
  technique_auto: buildTechniqueTemplate,
  questions_auto: buildQuestionsTemplate,
  postuler_auto: buildPostulerTemplate,
  autres_auto: buildAutresTemplate,
};

/**
 * Récupère un template automatique par son ID
 */
export function getAutoTemplate(templateId: string): V2MessageOptions | null {
  const builder = templates[templateId];
  
  if (!builder) {
    return null;
  }

  return builder();
}

/**
 * Liste tous les templates disponibles
 */
export function getAllTemplateIds(): string[] {
  return Object.keys(templates);
}

