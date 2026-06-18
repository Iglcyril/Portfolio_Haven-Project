import type { Report, User, EmergencyContact } from '../types'

// ─── Mock current user (student) ─────────────────────────────────────────────

export const MOCK_STUDENT: User = {
  id: 'usr_001',
  fullName: 'Lucas Moreau',
  email: 'lucas.moreau@lycee-haven.fr',
  portal: 'student',
  establishmentName: 'Lycée Victor Hugo',
  className: 'Terminale B',
  avatarInitials: 'LM',
}

// ─── Mock reports ─────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt_001',
    caseNumber: 'HVN-042',
    title: 'Harcèlement verbal répété',
    description:
      'Des élèves de ma classe me font des remarques blessantes quotidiennement depuis plusieurs semaines, notamment sur mon apparence et mes résultats scolaires. Les faits se déroulent principalement pendant les intercours et à la cantine.',
    category: 'Harcèlement verbal',
    severity: 'high',
    status: 'active',
    anonymityLevel: 'semi',
    progressPercent: 65,
    createdAt: '2026-06-01T09:14:00Z',
    updatedAt: '2026-06-15T14:30:00Z',
    referentName: 'Mme Sophie Martin',
    timeline: [
      {
        id: 't1',
        date: '2026-06-01T09:14:00Z',
        label: 'Signalement reçu',
        description: 'Votre signalement a été enregistré sous le numéro HVN-042.',
        actor: 'system',
      },
      {
        id: 't2',
        date: '2026-06-02T10:00:00Z',
        label: 'Prise en charge',
        description: 'Votre dossier a été assigné à Mme Sophie Martin, référente harcèlement.',
        actor: 'referent',
      },
      {
        id: 't3',
        date: '2026-06-08T14:22:00Z',
        label: 'Enquête en cours',
        description:
          'Des entretiens ont été menés avec les témoins identifiés. Une réunion de médiation est planifiée.',
        actor: 'referent',
      },
      {
        id: 't4',
        date: '2026-06-15T14:30:00Z',
        label: 'Mise à jour',
        description:
          'La médiation a eu lieu. Un suivi hebdomadaire est mis en place. Prochain point le 22 juin.',
        actor: 'referent',
      },
    ],
  },
  {
    id: 'rpt_002',
    caseNumber: 'HVN-038',
    title: 'Exclusion du groupe de classe',
    description:
      'Je suis systématiquement exclu des activités de groupe et des projets collectifs depuis la rentrée. Mes camarades refusent de travailler avec moi sans raison apparente.',
    category: 'Exclusion sociale',
    severity: 'medium',
    status: 'active',
    anonymityLevel: 'anonymous',
    progressPercent: 30,
    createdAt: '2026-05-20T11:05:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
    referentName: 'M. Thomas Berger',
    timeline: [
      {
        id: 't1',
        date: '2026-05-20T11:05:00Z',
        label: 'Signalement reçu',
        description: 'Votre signalement a été enregistré sous le numéro HVN-038.',
        actor: 'system',
      },
      {
        id: 't2',
        date: '2026-05-22T09:30:00Z',
        label: 'Prise en charge',
        description: 'Dossier assigné à M. Thomas Berger.',
        actor: 'referent',
      },
      {
        id: 't3',
        date: '2026-06-10T09:00:00Z',
        label: 'Analyse en cours',
        description: "Observation de la dynamique de classe en cours. Résultats attendus d'ici fin juin.",
        actor: 'referent',
      },
    ],
  },
  {
    id: 'rpt_003',
    caseNumber: 'HVN-029',
    title: 'Messages offensants sur les réseaux',
    description:
      'Des captures d\'écran de messages me concernant, diffusés sur un groupe privé, m\'ont été transmises par un camarade. Les messages comportaient des insultes et de la moquerie.',
    category: 'Cyberharcèlement',
    severity: 'medium',
    status: 'resolved',
    anonymityLevel: 'visible',
    progressPercent: 100,
    createdAt: '2026-04-10T16:45:00Z',
    updatedAt: '2026-05-15T11:20:00Z',
    referentName: 'Mme Sophie Martin',
    timeline: [
      {
        id: 't1',
        date: '2026-04-10T16:45:00Z',
        label: 'Signalement reçu',
        description: 'Votre signalement a été enregistré sous le numéro HVN-029.',
        actor: 'system',
      },
      {
        id: 't2',
        date: '2026-04-11T08:00:00Z',
        label: 'Prise en charge',
        description: 'Dossier assigné à Mme Sophie Martin.',
        actor: 'referent',
      },
      {
        id: 't3',
        date: '2026-04-18T14:00:00Z',
        label: 'Convocation',
        description: "Les élèves concernés ont été convoqués. Les captures d'écran ont été documentées.",
        actor: 'referent',
      },
      {
        id: 't4',
        date: '2026-05-02T10:30:00Z',
        label: 'Sanction disciplinaire',
        description: 'Une sanction disciplinaire a été prononcée. Le groupe a été supprimé.',
        actor: 'referent',
      },
      {
        id: 't5',
        date: '2026-05-15T11:20:00Z',
        label: 'Dossier résolu',
        description: 'Aucun nouvel incident signalé. Dossier clôturé avec suivi mensuel.',
        actor: 'system',
      },
    ],
  },
  {
    id: 'rpt_004',
    caseNumber: 'HVN-018',
    title: 'Bousculades répétées',
    description:
      'Bousculades intentionnelles dans les couloirs et à la sortie des cours par un groupe d\'élèves.',
    category: 'Violence physique',
    severity: 'low',
    status: 'archived',
    anonymityLevel: 'semi',
    progressPercent: 100,
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-03-20T16:00:00Z',
    referentName: 'M. Thomas Berger',
    timeline: [
      {
        id: 't1',
        date: '2026-02-14T08:30:00Z',
        label: 'Signalement reçu',
        description: 'Votre signalement a été enregistré sous le numéro HVN-018.',
        actor: 'system',
      },
      {
        id: 't2',
        date: '2026-02-15T09:00:00Z',
        label: 'Prise en charge',
        description: 'Dossier assigné à M. Thomas Berger.',
        actor: 'referent',
      },
      {
        id: 't3',
        date: '2026-02-28T14:00:00Z',
        label: 'Résolu',
        description: "Entretien avec les élèves concernés. L'incident ne s'est pas reproduit.",
        actor: 'referent',
      },
      {
        id: 't4',
        date: '2026-03-20T16:00:00Z',
        label: 'Archivé',
        description: 'Dossier archivé après 30 jours sans nouvel incident.',
        actor: 'system',
      },
    ],
  },
]

// ─── Emergency contacts ───────────────────────────────────────────────────────

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { number: '3020', label: 'Non au harcèlement', description: 'Harcèlement scolaire', color: '#2EAB7B' },
  { number: '3114', label: 'Prévention suicide', description: 'Numéro national', color: '#8ED4BF' },
  { number: '119', label: 'Enfance en danger', description: 'Allô enfance en danger', color: '#00A176' },
  { number: '15', label: 'SAMU', description: 'Urgence médicale', color: '#FF6B6B' },
  { number: '17', label: 'Police', description: 'Urgence sécurité', color: '#4A90D9' },
  { number: '18', label: 'Pompiers', description: 'Urgence incendie', color: '#FF8C42' },
]

// ─── Service functions (swap with real API calls later) ───────────────────────

export const getStudentReports = (): Promise<Report[]> =>
  Promise.resolve(MOCK_REPORTS)

export const getReportById = (id: string): Promise<Report | undefined> =>
  Promise.resolve(MOCK_REPORTS.find(r => r.id === id))

export const getCurrentStudent = (): Promise<User> =>
  Promise.resolve(MOCK_STUDENT)
