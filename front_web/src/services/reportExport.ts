import type { ProReport } from '../types'
import { formatDate } from '../utils/dateFormatting'

const C_DARK    = '#102F2B'
const C_PRIMARY = '#2EAB7B'
const C_MUTED   = '#5C7A68'
const C_BORDER  = '#C8D8D2'

const SEVERITY_LABELS: Record<string, string> = {
  high:   'ÉLEVÉ',
  medium: 'MOYEN',
  low:    'FAIBLE',
}

const STAGE_LABELS = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU'] as const

// ─── Point d'entrée public ────────────────────────────────────────────────────

export async function exportReportPDF(report: ProReport): Promise<void> {
  const { jsPDF } = await import('jspdf')

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PW   = 210
  const M    = 18
  const CW   = PW - M * 2  // 174 mm
  let y      = 0

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > 272) { doc.addPage(); y = 20 }
  }

  const sectionTitle = (label: string) => {
    newPageIfNeeded(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(C_PRIMARY)
    doc.text(label, M, y)
    y += 6
  }

  const row = (label: string, value: string) => {
    newPageIfNeeded(8)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(C_MUTED)
    doc.text(label, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(C_DARK)
    doc.text(value, M + 46, y)
    y += 6.5
  }

  const hairline = () => {
    newPageIfNeeded(10)
    doc.setDrawColor(C_BORDER)
    doc.setLineWidth(0.2)
    doc.line(M, y, PW - M, y)
    y += 8
  }

  // ─── En-tête ───────────────────────────────────────────────────────────────

  doc.setFillColor(C_DARK)
  doc.rect(0, 0, PW, 38, 'F')

  doc.setFillColor(C_PRIMARY)
  doc.rect(0, 34, PW, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor('#FFFFFF')
  doc.text('HAVEN', M, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor('#AACCBB')
  doc.text('DOCUMENT CONFIDENTIEL', PW - M, 12, { align: 'right' })
  doc.text('Rapport de signalement archivé', PW - M, 18, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor('#C8E8D8')
  doc.text('Sécurité scolaire · Plateforme de signalement', M, 28)

  y = 50

  // ─── Numéro + titre ────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(C_MUTED)
  doc.text(report.caseNumber, M, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(C_DARK)
  const titleLines = doc.splitTextToSize(report.title, CW)
  doc.text(titleLines, M, y)
  y += titleLines.length * 7 + 6

  doc.setDrawColor(C_PRIMARY)
  doc.setLineWidth(0.5)
  doc.line(M, y, M + 40, y)
  y += 10

  // ─── Informations du dossier ───────────────────────────────────────────────

  sectionTitle('INFORMATIONS DU DOSSIER')
  row('Statut :', 'ARCHIVÉ')
  row('Catégorie :', report.title)
  row('Sévérité :', SEVERITY_LABELS[report.severity ?? 'low'] ?? '—')
  row('Anonymat :', report.anonLevel)
  row('Référent assigné :', report.assignedTo ?? 'Non assigné')
  row('Avancement :', STAGE_LABELS[report.progressStage] ?? '—')
  if (report.studentClass) row('Classe :', report.studentClass)
  if (report.studentName && report.anonymityLevel !== 'anonymous') row('Identité :', report.studentName)
  row('Déposé le :', formatDate(report.createdAt))
  row('Archivé le :', formatDate(report.updatedAt))

  hairline()

  // ─── Déclaration initiale ──────────────────────────────────────────────────

  if (report.description) {
    sectionTitle('DÉCLARATION INITIALE')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(C_DARK)
    const descLines = doc.splitTextToSize(report.description, CW)
    newPageIfNeeded(descLines.length * 5.5 + 12)
    doc.text(descLines, M, y)
    y += descLines.length * 5.5 + 6
    hairline()
  }

  // ─── Chronologie des actions ───────────────────────────────────────────────

  type TimelineItem =
    | { kind: 'system'; date: string; label: string; description: string }
    | { kind: 'event';  date: string; type: string; comment?: string; actor: string }

  const items: TimelineItem[] = [
    ...report.timeline.map(e => ({
      kind:        'system' as const,
      date:        e.date,
      label:       e.label,
      description: e.description,
    })),
    ...report.events.map(e => ({
      kind:    'event' as const,
      date:    e.createdAt,
      type:    e.type,
      comment: e.comment,
      actor:   e.actor,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (items.length > 0) {
    sectionTitle('CHRONOLOGIE DES ACTIONS')

    for (const item of items) {
      newPageIfNeeded(24)

      // Puce
      doc.setFillColor(C_PRIMARY)
      doc.circle(M + 1.5, y - 1, 1.5, 'F')

      if (item.kind === 'system') {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(C_DARK)
        doc.text(item.label, M + 8, y)
        y += 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(C_MUTED)
        doc.text(formatDate(item.date), M + 8, y)
        y += 5

        if (item.description) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(10)
          doc.setTextColor(C_DARK)
          const lines = doc.splitTextToSize(item.description, CW - 10)
          doc.text(lines, M + 8, y)
          y += lines.length * 5 + 5
        } else {
          y += 3
        }
      } else {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(C_PRIMARY)
        doc.text(item.type, M + 8, y)
        y += 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(C_MUTED)
        doc.text(`${formatDate(item.date)} — ${item.actor}`, M + 8, y)
        y += 5

        if (item.comment) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(10)
          doc.setTextColor(C_DARK)
          const lines = doc.splitTextToSize(item.comment, CW - 10)
          doc.text(lines, M + 8, y)
          y += lines.length * 5 + 4
        } else {
          y += 3
        }
      }
    }
  }

  // ─── Pied de page sur toutes les pages ────────────────────────────────────

  const exportDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(C_BORDER)
    doc.text(
      `Haven · Document confidentiel · Exporté le ${exportDate}`,
      M, 292,
    )
    doc.text(`${p} / ${totalPages}`, PW - M, 292, { align: 'right' })
  }

  doc.save(`Haven-${report.caseNumber}.pdf`)
}
