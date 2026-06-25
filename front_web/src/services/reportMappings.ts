import type { ReportStatus, Severity, AnonymityLevel } from '../types'

export const CATEGORIE_LABELS: Record<string, string> = {
  harcelement_scolaire: 'Harcèlement scolaire',
  violence_physique:    'Violence physique',
  violence_verbale:     'Violence verbale',
  cyberharcelement:     'Cyberharcèlement',
  discrimination:       'Discrimination',
  mal_etre:             'Mal-être',
  autre:                'Signalement',
}

export const STATUS_MAP: Record<string, ReportStatus> = {
  EN_ATTENTE: 'active',
  EN_COURS:   'active',
  RESOLU:     'resolved',
  ARCHIVE:    'archived',
}

export const SEVERITY_MAP: Record<string, Severity> = {
  ELEVE: 'high',
  MOYEN: 'medium',
  BAS:   'low',
}

export const ANONYMITY_MAP: Record<string, AnonymityLevel> = {
  total:       'anonymous',
  partiel:     'semi',
  pas_anonyme: 'visible',
}
