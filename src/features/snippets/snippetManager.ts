import { V2MessageOptions } from '../../componentsV2/builder.js';

export interface SnippetDefinition {
  id: string;
  label: string;
  description?: string;
  category: string;
  buildMessage: () => V2MessageOptions;
  plainText?: string; // Texte brut pour l'aperçu en bloc de code
}

// Import des définitions de snippets
import { eclipseBaseSnippet, eclipseRelanceSnippet } from './definitions/eclipse.js';
import { techniqueBaseSnippet, techniqueVerifSnippet } from './definitions/technique.js';
import { generalBaseSnippet, generalAttenteSnippet, generalCloturerSnippet } from './definitions/general.js';

// Registre des snippets
const snippets: SnippetDefinition[] = [
  // Eclipse
  eclipseBaseSnippet,
  eclipseRelanceSnippet,
  // Technique
  techniqueBaseSnippet,
  techniqueVerifSnippet,
  // Général
  generalBaseSnippet,
  generalAttenteSnippet,
  generalCloturerSnippet,
];

/**
 * Récupère un snippet par son ID
 */
export function getSnippetById(id: string): SnippetDefinition | undefined {
  return snippets.find((s) => s.id === id);
}

/**
 * Récupère tous les snippets
 */
export function getAllSnippets(): SnippetDefinition[] {
  return snippets;
}

/**
 * Récupère les snippets par catégorie
 */
export function getSnippetsByCategory(category: string): SnippetDefinition[] {
  return snippets.filter((s) => s.category === category);
}

/**
 * Liste toutes les catégories de snippets
 */
export function getAllCategories(): string[] {
  const categories = new Set(snippets.map((s) => s.category));
  return [...categories];
}

