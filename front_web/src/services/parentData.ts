import type { User, Child, ParentReport, EstablishmentContact } from '../types'

// ─── Mock parent user ─────────────────────────────────────────────────────────

export const MOCK_PARENT: User = {
  id: 'usr_p01',
  fullName: 'Marie Martin',
  email: 'marie.martin@email.fr',
  portal: 'parent',
  establishmentName: 'Lycée Victor Hugo',
  avatarInitials: 'MM',
}

// ─── Mock children ────────────────────────────────────────────────────────────

export const MOCK_CHILDREN: Child[] = [
  {
    id: 'child_001',
    firstName: 'Lucas',
    lastName: 'Martin',
    fullName: 'Lucas Martin',
    className: 'Terminale B',
    dateOfBirth: '2007-03-15',
    avatarInitials: 'LM',
  },
  {
    id: 'child_002',
    firstName: 'Emma',
    lastName: 'Martin',
    fullName: 'Emma Martin',
    className: '4ème A',
    dateOfBirth: '2010-09-22',
    avatarInitials: 'EM',
  },
]

// ─── Mock parent reports ──────────────────────────────────────────────────────

export const MOCK_PARENT_REPORTS: ParentReport[] = [
  {
    id: 'pr_001',
    childId: 'child_001',
    caseNumber: 'HVN-042',
    title: 'Harcèlement verbal répété',
    description:
      'Des élèves de la classe de votre enfant lui font des remarques blessantes quotidiennement depuis plusieurs semaines, notamment sur son apparence et ses résultats scolaires.',
    category: 'Harcèlement verbal',
    severity: 'high',
    status: 'active',
    anonymityLevel: 'semi',
    progressPercent: 65,
    createdAt: '2026-06-01T09:14:00Z',
    updatedAt: '2026-06-15T14:30:00Z',
    referentName: 'Mme Sophie Martin',
    timeline: [
      { id: 't1', date: '2026-06-01T09:14:00Z', label: 'Signalement reçu',   description: 'Le signalement HVN-042 a été enregistré.', actor: 'system' },
      { id: 't2', date: '2026-06-02T10:00:00Z', label: 'Prise en charge',    description: 'Dossier assigné à Mme Sophie Martin, référente harcèlement.', actor: 'referent' },
      { id: 't3', date: '2026-06-08T14:22:00Z', label: 'Enquête en cours',   description: 'Entretiens menés avec les témoins. Une médiation est planifiée.', actor: 'referent' },
      { id: 't4', date: '2026-06-15T14:30:00Z', label: 'Mise à jour',        description: 'La médiation a eu lieu. Suivi hebdomadaire mis en place.', actor: 'referent' },
    ],
  },
  {
    id: 'pr_002',
    childId: 'child_001',
    caseNumber: 'HVN-038',
    title: 'Exclusion du groupe de classe',
    description:
      'Votre enfant est systématiquement exclu des activités de groupe et des projets collectifs depuis la rentrée.',
    category: 'Exclusion sociale',
    severity: 'medium',
    status: 'active',
    anonymityLevel: 'anonymous',
    progressPercent: 30,
    createdAt: '2026-05-20T11:05:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
    referentName: 'M. Thomas Berger',
    timeline: [
      { id: 't1', date: '2026-05-20T11:05:00Z', label: 'Signalement reçu', description: 'Le signalement HVN-038 a été enregistré.', actor: 'system' },
      { id: 't2', date: '2026-05-22T09:30:00Z', label: 'Prise en charge',  description: 'Dossier assigné à M. Thomas Berger.', actor: 'referent' },
      { id: 't3', date: '2026-06-10T09:00:00Z', label: 'Analyse en cours', description: "Observation de la dynamique de classe en cours.", actor: 'referent' },
    ],
  },
  {
    id: 'pr_003',
    childId: 'child_002',
    caseNumber: 'HVN-029',
    title: 'Messages offensants sur les réseaux',
    description:
      'Des captures d\'écran de messages concernant votre enfant, diffusés sur un groupe privé, ont été transmises par un camarade.',
    category: 'Cyberharcèlement',
    severity: 'medium',
    status: 'resolved',
    anonymityLevel: 'visible',
    progressPercent: 100,
    createdAt: '2026-04-10T16:45:00Z',
    updatedAt: '2026-05-15T11:20:00Z',
    referentName: 'Mme Sophie Martin',
    timeline: [
      { id: 't1', date: '2026-04-10T16:45:00Z', label: 'Signalement reçu',    description: 'Le signalement HVN-029 a été enregistré.', actor: 'system' },
      { id: 't2', date: '2026-04-11T08:00:00Z', label: 'Prise en charge',     description: 'Dossier assigné à Mme Sophie Martin.', actor: 'referent' },
      { id: 't3', date: '2026-04-18T14:00:00Z', label: 'Convocation',         description: "Les élèves concernés ont été convoqués.", actor: 'referent' },
      { id: 't4', date: '2026-05-02T10:30:00Z', label: 'Sanction',            description: 'Sanction disciplinaire prononcée. Groupe supprimé.', actor: 'referent' },
      { id: 't5', date: '2026-05-15T11:20:00Z', label: 'Dossier résolu',      description: 'Aucun nouvel incident. Dossier clôturé.', actor: 'system' },
    ],
  },
]

// ─── Establishment contacts ───────────────────────────────────────────────────

export const ESTABLISHMENT_CONTACTS: EstablishmentContact[] = [
  { name: 'M. Patrick Duval',   role: 'director', phone: '01 23 45 67 89', initials: 'PD' },
  { name: 'Mme Sophie Martin',  role: 'referent', phone: '01 23 45 67 90', initials: 'SM' },
  { name: 'M. Thomas Berger',   role: 'referent', phone: '01 23 45 67 91', initials: 'TB' },
]

// ─── Service functions ────────────────────────────────────────────────────────

export const getParentChildren = (): Promise<Child[]> =>
  Promise.resolve(MOCK_CHILDREN)

export const getParentReports = (childId?: string): Promise<ParentReport[]> =>
  Promise.resolve(
    childId ? MOCK_PARENT_REPORTS.filter(r => r.childId === childId) : MOCK_PARENT_REPORTS
  )

export const getCurrentParent = (): Promise<User> =>
  Promise.resolve(MOCK_PARENT)
