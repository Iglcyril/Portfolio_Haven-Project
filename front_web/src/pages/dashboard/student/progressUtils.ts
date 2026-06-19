import type { Report } from '../../../types'

export function getStage(report: Report): number {
  if (report.status === 'resolved' || report.status === 'archived' || report.progressPercent >= 90) return 3
  if (report.progressPercent >= 60) return 2
  if (report.progressPercent >= 30) return 1
  return 0
}
