import type { Severity } from '../../../types'
import { SEVERITY_COLOR, SEVERITY_LABEL } from '../../../constants/severity'

export function SeverityBadge({ severity }: { severity?: Severity }) {
  const key = severity ?? 'none'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      color: SEVERITY_COLOR[key],
      background: `${SEVERITY_COLOR[key]}22`,
      borderRadius: 6, padding: '2px 7px',
      letterSpacing: '0.04em',
      border: key === 'none' ? `1px dashed ${SEVERITY_COLOR[key]}` : 'none',
    }}>
      {SEVERITY_LABEL[key]}
    </span>
  )
}
