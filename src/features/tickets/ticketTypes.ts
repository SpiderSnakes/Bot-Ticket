export type TicketTypeId =
  | 'eclipse'
  | 'etudiant'
  | 'technique'
  | 'questions'
  | 'postuler'
  | 'autres';

export interface TicketType {
  id: TicketTypeId;
  label: string;
  description: string;
  channelPrefix: string;
  emoji: string;
  autoTemplateId: string;
}

export const TICKET_TYPES: TicketType[] = [
  {
    id: 'eclipse',
    label: 'Activer Eclipse',
    description: 'Activation ou vérification Eclipse',
    channelPrefix: 'eclipse',
    emoji: '🌙',
    autoTemplateId: 'eclipse_auto',
  },
  {
    id: 'etudiant',
    label: 'Réduction étudiante',
    description: 'Demande de réduction pour étudiants',
    channelPrefix: 'etudiant',
    emoji: '🎓',
    autoTemplateId: 'etudiant_auto',
  },
  {
    id: 'technique',
    label: 'Problèmes techniques',
    description: 'Signaler un bug ou problème technique',
    channelPrefix: 'tech',
    emoji: '🔧',
    autoTemplateId: 'technique_auto',
  },
  {
    id: 'questions',
    label: 'Questions',
    description: 'Poser une question générale',
    channelPrefix: 'question',
    emoji: '❓',
    autoTemplateId: 'questions_auto',
  },
  {
    id: 'postuler',
    label: 'Postuler',
    description: 'Candidature pour rejoindre l\'équipe',
    channelPrefix: 'candidature',
    emoji: '📝',
    autoTemplateId: 'postuler_auto',
  },
  {
    id: 'autres',
    label: 'Autres',
    description: 'Autre sujet non listé',
    channelPrefix: 'autre',
    emoji: '📋',
    autoTemplateId: 'autres_auto',
  },
];

/**
 * Récupère un type de ticket par son ID
 */
export function getTicketTypeById(id: TicketTypeId): TicketType | undefined {
  return TICKET_TYPES.find((type) => type.id === id);
}

/**
 * Récupère un type de ticket par son préfixe de salon
 */
export function getTicketTypeByPrefix(prefix: string): TicketType | undefined {
  return TICKET_TYPES.find((type) => type.channelPrefix === prefix);
}

