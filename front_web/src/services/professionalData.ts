import type { User, TeamMember, ProReport } from '../types'

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_DIRECTOR: User = {
  id: 'usr_dir01',
  fullName: 'Patrick Duval',
  email: 'p.duval@lycee-victor-hugo.fr',
  portal: 'professional',
  establishmentName: 'Lycée Victor Hugo',
  avatarInitials: 'PD',
}

export const MOCK_REFERENT: User = {
  id: 'usr_ref01',
  fullName: 'Sophie Martin',
  email: 's.martin@lycee-victor-hugo.fr',
  portal: 'professional',
  establishmentName: 'Lycée Victor Hugo',
  avatarInitials: 'SM',
}

// ─── Team members ─────────────────────────────────────────────────────────────

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm_01',
    fullName: 'Sophie Martin',
    firstName: 'Sophie',
    lastName: 'Martin',
    avatarInitials: 'SM',
    role: 'cpe',
    roleLabel: 'CPE',
    jobTitle: "Conseillère Principale d'Éducation",
    phone: '01 23 45 67 90',
    email: 's.martin@lycee-victor-hugo.fr',
    activeCount: 2,
    resolvedCount: 11,
  },
  {
    id: 'tm_02',
    fullName: 'Thomas Berger',
    firstName: 'Thomas',
    lastName: 'Berger',
    avatarInitials: 'TB',
    role: 'teacher',
    roleLabel: 'Professeur·e',
    jobTitle: 'Professeur de Lettres',
    phone: '01 23 45 67 91',
    email: 't.berger@lycee-victor-hugo.fr',
    activeCount: 1,
    resolvedCount: 7,
  },
  {
    id: 'tm_03',
    fullName: 'Claire Rousseau',
    firstName: 'Claire',
    lastName: 'Rousseau',
    avatarInitials: 'CR',
    role: 'socialWorker',
    roleLabel: 'Assistant·e Social·e',
    jobTitle: 'Assistante Sociale Scolaire',
    phone: '01 23 45 67 92',
    email: 'c.rousseau@lycee-victor-hugo.fr',
    activeCount: 1,
    resolvedCount: 5,
  },
  {
    id: 'tm_04',
    fullName: 'Jean Dupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    avatarInitials: 'JD',
    role: 'nurse',
    roleLabel: 'Infirmier·ère',
    jobTitle: 'Infirmier Scolaire',
    phone: '01 23 45 67 93',
    email: 'j.dupont@lycee-victor-hugo.fr',
    activeCount: 0,
    resolvedCount: 4,
  },
  {
    id: 'tm_05',
    fullName: 'Marie Leblanc',
    firstName: 'Marie',
    lastName: 'Leblanc',
    avatarInitials: 'ML',
    role: 'aed',
    roleLabel: 'AED',
    jobTitle: "Assistant·e d'Éducation",
    phone: '01 23 45 67 94',
    email: 'm.leblanc@lycee-victor-hugo.fr',
    activeCount: 0,
    resolvedCount: 3,
  },
]

// ─── Reports ──────────────────────────────────────────────────────────────────

export const MOCK_PRO_REPORTS: ProReport[] = [
  {
    id: 'pr_001',
    caseNumber: 'HVN-042',
    title: 'Harcèlement verbal répété en classe',
    description: "Signalement anonyme concernant des moqueries quotidiennes visant un élève de Terminale B sur son apparence et ses résultats scolaires.",
    category: 'Harcèlement verbal',
    severity: 'high',
    status: 'active',
    anonymityLevel: 'semi',
    anonLevel: 'Semi-anonyme',
    progressPercent: 65,
    progressStage: 2,
    createdAt: '2026-06-01T09:14:00Z',
    updatedAt: '2026-06-15T14:30:00Z',
    assignedTo: 'Sophie Martin',
    studentClass: 'Terminale B',
    referentName: 'Sophie Martin',
    timeline: [
      { id: 't1', date: '2026-06-01T09:14:00Z', label: 'Signalement reçu', description: 'Enregistré dans Haven.', actor: 'system' },
      { id: 't2', date: '2026-06-02T10:00:00Z', label: 'Prise en charge', description: 'Assigné à Sophie Martin.', actor: 'referent' },
      { id: 't3', date: '2026-06-08T14:22:00Z', label: 'Enquête en cours', description: 'Entretiens avec les témoins.', actor: 'referent' },
      { id: 't4', date: '2026-06-15T14:30:00Z', label: 'Médiation réalisée', description: 'Médiation planifiée et tenue. Suivi hebdomadaire.', actor: 'referent' },
    ],
    events: [
      { id: 'e1', type: 'Entretien', comment: 'Entretien avec la victime, témoignages recueillis.', createdAt: '2026-06-08T14:22:00Z', actor: 'Sophie Martin' },
      { id: 'e2', type: 'Médiation', comment: 'Séance de médiation entre les parties.', createdAt: '2026-06-15T14:30:00Z', actor: 'Sophie Martin' },
    ],
  },
  {
    id: 'pr_002',
    caseNumber: 'HVN-038',
    title: 'Exclusion sociale au sein du groupe classe',
    description: "Un élève de 4ème A est systématiquement exclu des activités de groupe depuis la rentrée.",
    category: 'Exclusion sociale',
    severity: 'medium',
    status: 'active',
    anonymityLevel: 'anonymous',
    anonLevel: 'Anonyme',
    progressPercent: 30,
    progressStage: 1,
    createdAt: '2026-05-20T11:05:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
    assignedTo: 'Thomas Berger',
    studentClass: '4ème A',
    referentName: 'Thomas Berger',
    timeline: [
      { id: 't1', date: '2026-05-20T11:05:00Z', label: 'Signalement reçu', description: 'Enregistré dans Haven.', actor: 'system' },
      { id: 't2', date: '2026-05-22T09:30:00Z', label: 'Prise en charge', description: 'Assigné à Thomas Berger.', actor: 'referent' },
      { id: 't3', date: '2026-06-10T09:00:00Z', label: 'Analyse en cours', description: 'Observation de la dynamique de classe.', actor: 'referent' },
    ],
    events: [
      { id: 'e1', type: 'Observation', comment: 'Observation en classe, dynamique de groupe analysée.', createdAt: '2026-06-10T09:00:00Z', actor: 'Thomas Berger' },
    ],
  },
  {
    id: 'pr_003',
    caseNumber: 'HVN-035',
    title: 'Intimidation dans les couloirs',
    description: "Signalement d'intimidations répétées dans les couloirs entre les cours par un groupe d'élèves de 3ème.",
    category: 'Violence physique',
    severity: undefined,
    status: 'active',
    anonymityLevel: 'anonymous',
    anonLevel: 'Anonyme',
    progressPercent: 10,
    progressStage: 0,
    createdAt: '2026-06-16T08:30:00Z',
    updatedAt: '2026-06-16T08:30:00Z',
    assignedTo: undefined,
    studentClass: '3ème B',
    referentName: undefined,
    timeline: [
      { id: 't1', date: '2026-06-16T08:30:00Z', label: 'Signalement reçu', description: 'En attente d\'attribution.', actor: 'system' },
    ],
    events: [],
  },
  {
    id: 'pr_004',
    caseNumber: 'HVN-031',
    title: 'Cyberharcèlement sur réseau social',
    description: "Des captures d'écran montrant des messages offensants envoyés à une élève sur Instagram ont été transmises.",
    category: 'Cyberharcèlement',
    severity: undefined,
    status: 'active',
    anonymityLevel: 'visible',
    anonLevel: 'Visible',
    progressPercent: 10,
    progressStage: 0,
    createdAt: '2026-06-14T15:00:00Z',
    updatedAt: '2026-06-14T15:00:00Z',
    assignedTo: undefined,
    studentClass: '2nde C',
    referentName: undefined,
    timeline: [
      { id: 't1', date: '2026-06-14T15:00:00Z', label: 'Signalement reçu', description: 'En attente d\'attribution.', actor: 'system' },
    ],
    events: [],
  },
  {
    id: 'pr_005',
    caseNumber: 'HVN-029',
    title: 'Messages offensants sur groupe WhatsApp',
    description: "Diffusion de messages à caractère offensant et photos non consenties dans un groupe de classe.",
    category: 'Cyberharcèlement',
    severity: 'medium',
    status: 'resolved',
    anonymityLevel: 'visible',
    anonLevel: 'Visible',
    progressPercent: 100,
    progressStage: 3,
    createdAt: '2026-04-10T16:45:00Z',
    updatedAt: '2026-05-15T11:20:00Z',
    assignedTo: 'Sophie Martin',
    studentClass: 'Terminale A',
    referentName: 'Sophie Martin',
    timeline: [
      { id: 't1', date: '2026-04-10T16:45:00Z', label: 'Signalement reçu', description: 'Enregistré.', actor: 'system' },
      { id: 't2', date: '2026-04-11T08:00:00Z', label: 'Prise en charge', description: 'Assigné à Sophie Martin.', actor: 'referent' },
      { id: 't3', date: '2026-04-18T14:00:00Z', label: 'Convocation', description: 'Élèves convoqués.', actor: 'referent' },
      { id: 't4', date: '2026-05-02T10:30:00Z', label: 'Sanction', description: 'Sanction disciplinaire prononcée.', actor: 'referent' },
      { id: 't5', date: '2026-05-15T11:20:00Z', label: 'Résolu', description: 'Dossier clôturé.', actor: 'system' },
    ],
    events: [
      { id: 'e1', type: 'Convocation', comment: 'Convocation des élèves impliqués.', createdAt: '2026-04-18T14:00:00Z', actor: 'Sophie Martin' },
      { id: 'e2', type: 'Sanction', comment: 'Conseil de discipline. Groupe supprimé.', createdAt: '2026-05-02T10:30:00Z', actor: 'Sophie Martin' },
    ],
  },
  {
    id: 'pr_006',
    caseNumber: 'HVN-024',
    title: 'Pression et menaces entre pairs',
    description: "Signalement de pressions exercées sur un élève pour lui soutirer de l'argent.",
    category: 'Violence psychologique',
    severity: 'medium',
    status: 'resolved',
    anonymityLevel: 'anonymous',
    anonLevel: 'Anonyme',
    progressPercent: 100,
    progressStage: 3,
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-04-02T16:00:00Z',
    assignedTo: 'Claire Rousseau',
    studentClass: '1ère S',
    referentName: 'Claire Rousseau',
    timeline: [
      { id: 't1', date: '2026-03-05T10:00:00Z', label: 'Signalement reçu', description: 'Enregistré.', actor: 'system' },
      { id: 't2', date: '2026-03-06T09:00:00Z', label: 'Prise en charge', description: 'Assigné à Claire Rousseau.', actor: 'referent' },
      { id: 't3', date: '2026-04-02T16:00:00Z', label: 'Résolu', description: 'Situation réglée par médiation.', actor: 'referent' },
    ],
    events: [
      { id: 'e1', type: 'Médiation', comment: 'Rencontre avec les parties concernées.', createdAt: '2026-04-02T16:00:00Z', actor: 'Claire Rousseau' },
    ],
  },
  {
    id: 'pr_007',
    caseNumber: 'HVN-018',
    title: 'Rumeurs diffamatoires',
    description: "Propagation de rumeurs sur les réseaux et dans l'établissement visant une élève de 2nde.",
    category: 'Harcèlement verbal',
    severity: 'low',
    status: 'archived',
    anonymityLevel: 'semi',
    anonLevel: 'Semi-anonyme',
    progressPercent: 100,
    progressStage: 3,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-28T11:00:00Z',
    assignedTo: 'Thomas Berger',
    studentClass: '2nde A',
    referentName: 'Thomas Berger',
    timeline: [
      { id: 't1', date: '2026-01-15T09:00:00Z', label: 'Signalement reçu', description: 'Enregistré.', actor: 'system' },
      { id: 't2', date: '2026-02-28T11:00:00Z', label: 'Archivé', description: 'Dossier archivé après résolution.', actor: 'system' },
    ],
    events: [],
  },
  {
    id: 'pr_008',
    caseNumber: 'HVN-012',
    title: 'Exclusion d\'activités sportives',
    description: "Un élève rapporte être régulièrement exclu par ses camarades lors des cours d'EPS.",
    category: 'Exclusion sociale',
    severity: 'low',
    status: 'archived',
    anonymityLevel: 'anonymous',
    anonLevel: 'Anonyme',
    progressPercent: 100,
    progressStage: 3,
    createdAt: '2025-12-02T14:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    assignedTo: 'Marie Leblanc',
    studentClass: '5ème C',
    referentName: 'Marie Leblanc',
    timeline: [
      { id: 't1', date: '2025-12-02T14:00:00Z', label: 'Signalement reçu', description: 'Enregistré.', actor: 'system' },
      { id: 't2', date: '2026-01-20T10:00:00Z', label: 'Archivé', description: 'Résolu et archivé.', actor: 'system' },
    ],
    events: [],
  },
]

// ─── Statistics ───────────────────────────────────────────────────────────────

export const MOCK_STATS = {
  // Reports per week (last 8 weeks)
  weekly: [
    { label: 'S-7', total: 1, high: 1, medium: 0, low: 0 },
    { label: 'S-6', total: 2, high: 1, medium: 1, low: 0 },
    { label: 'S-5', total: 0, high: 0, medium: 0, low: 0 },
    { label: 'S-4', total: 3, high: 2, medium: 1, low: 0 },
    { label: 'S-3', total: 1, high: 0, medium: 1, low: 0 },
    { label: 'S-2', total: 2, high: 1, medium: 0, low: 1 },
    { label: 'S-1', total: 1, high: 0, medium: 1, low: 0 },
    { label: 'S0',  total: 3, high: 2, medium: 1, low: 0 },
  ],
  // Reports per month (last 6 months)
  monthly: [
    { label: 'Jan.',  total: 3, high: 1, medium: 1, low: 1 },
    { label: 'Fév.',  total: 2, high: 1, medium: 1, low: 0 },
    { label: 'Mar.',  total: 4, high: 2, medium: 1, low: 1 },
    { label: 'Avr.',  total: 3, high: 1, medium: 2, low: 0 },
    { label: 'Mai',   total: 5, high: 2, medium: 2, low: 1 },
    { label: 'Juin',  total: 4, high: 3, medium: 1, low: 0 },
  ],
  // Reports per year (last 3 years)
  yearly: [
    { label: '2024', total: 28, high: 10, medium: 12, low: 6 },
    { label: '2025', total: 34, high: 14, medium: 13, low: 7 },
    { label: '2026', total: 21, high: 9,  medium: 9,  low: 3 },
  ],
  // Severity breakdown
  bySeverity: [
    { name: 'Élevé',  value: 33, color: '#C0392B' },
    { name: 'Moyen',  value: 44, color: '#E67E22' },
    { name: 'Faible', value: 23, color: '#2EAB7B' },
  ],
  // By académie/rectorat
  byAcademie: [
    { name: 'Paris',           rectorat: 'Rectorat de Paris',           total: 312 },
    { name: 'Versailles',      rectorat: 'Rectorat de Versailles',      total: 278 },
    { name: 'Créteil',         rectorat: 'Rectorat de Créteil',         total: 245 },
    { name: 'Lyon',            rectorat: 'Rectorat de Lyon',            total: 198 },
    { name: 'Aix-Marseille',   rectorat: "Rectorat d'Aix-Marseille",   total: 187 },
    { name: 'Bordeaux',        rectorat: 'Rectorat de Bordeaux',        total: 156 },
    { name: 'Lille',           rectorat: 'Rectorat de Lille',           total: 144 },
    { name: 'Nantes',          rectorat: 'Rectorat de Nantes',          total: 132 },
    { name: 'Toulouse',        rectorat: 'Rectorat de Toulouse',        total: 121 },
    { name: 'Strasbourg',      rectorat: 'Rectorat de Strasbourg',      total: 98  },
  ],
}

// ─── Service functions ────────────────────────────────────────────────────────

export const getProReports = (): Promise<ProReport[]> =>
  Promise.resolve(MOCK_PRO_REPORTS)

export const getTeamMembers = (): Promise<TeamMember[]> =>
  Promise.resolve(MOCK_TEAM)

export const getDirector = (): Promise<User> =>
  Promise.resolve(MOCK_DIRECTOR)

export const getReferentUser = (): Promise<User> =>
  Promise.resolve(MOCK_REFERENT)

export const getStats = () =>
  Promise.resolve(MOCK_STATS)

export const ROLE_LABELS: Record<string, string> = {
  director:    'Directeur·rice',
  cpe:         'CPE',
  nurse:       'Infirmier·ère',
  aed:         'AED',
  teacher:     'Professeur·e',
  socialWorker: 'Assistant·e Social·e',
  other:       'Autre',
}

export const EVENT_TYPES = [
  'Entretien',
  'Médiation',
  'Convocation',
  'Observation',
  'Sanction',
  'Signalement interne',
  'Autre',
]

export const EVENT_COLORS: Record<string, string> = {
  'Entretien':         '#2EAB7B',
  'Médiation':         '#8ED4BF',
  'Convocation':       '#E67E22',
  'Observation':       '#3498DB',
  'Sanction':          '#C0392B',
  'Signalement interne': '#9B59B6',
  'Autre':             '#7F8C8D',
}
