import { buildApiUrl } from './apiBase'

export type MlRetrofitEstimate = {
  model: string
  predictedScope: 'basic' | 'standard' | 'comprehensive'
  predictedDamage: 'low' | 'medium' | 'high'
  predictedCostPerSqft: number
  predictedDurationWeeks: number
  confidence: number
  guidance: string[]
  guidanceDetailed?: Array<{
    priority: 'P1' | 'P2' | 'P3'
    action: string
    rationale: string
    estimatedImpact: string
  }>
  assumptions?: string[]
}

export const getMlRetrofitEstimate = async (payload: {
  structureType: string
  province: string
  city: string
  areaSqft: number
  severityScore: number
  affectedAreaPercent: number
  urgencyLevel: 'routine' | 'priority' | 'critical'
  laborDaily?: number
  materialIndex?: number
  logisticsIndex?: number
  defectProfile?: Partial<Record<'crack' | 'spalling' | 'corrosion' | 'moisture' | 'deformation' | 'other', number>>
  imageQuality?: 'excellent' | 'good' | 'fair' | 'poor'
}): Promise<MlRetrofitEstimate> => {
  const response = await fetch(buildApiUrl('/api/ml/retrofit-estimate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const raw = await response.text()
  let body: MlRetrofitEstimate | { error?: string } | null = null

  try {
    body = JSON.parse(raw) as MlRetrofitEstimate | { error?: string }
  } catch {
    if (!response.ok) {
      throw new Error(`ML retrofit API returned non-JSON response (${response.status}).`)
    }
    throw new Error('ML retrofit API returned invalid JSON response.')
  }

  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? 'ML retrofit estimate failed')
  }

  return body as MlRetrofitEstimate
}
