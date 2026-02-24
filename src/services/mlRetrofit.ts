import { buildApiTargets } from './apiBase'

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
  equipmentIndex?: number
  logisticsIndex?: number
  defectProfile?: Partial<Record<'crack' | 'spalling' | 'corrosion' | 'moisture' | 'deformation' | 'other', number>>
  imageQuality?: 'excellent' | 'good' | 'fair' | 'poor'
}): Promise<MlRetrofitEstimate> => {
  const targets = buildApiTargets('/api/ml/retrofit-estimate')
  let lastError: Error | null = null

  for (const target of targets) {
    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const raw = await response.text()
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
      const isJsonResponse = contentType.includes('application/json')

      if ((response.status === 404 || response.status === 405) && !isJsonResponse) {
        lastError = new Error(`ML retrofit route unavailable on ${target} (${response.status})`)
        continue
      }

      if (!isJsonResponse) {
        lastError = new Error(`ML retrofit API returned non-JSON response (${response.status}) from ${target}.`)
        continue
      }

      let body: MlRetrofitEstimate | { error?: string } | null = null

      try {
        body = JSON.parse(raw) as MlRetrofitEstimate | { error?: string }
      } catch {
        lastError = new Error(response.ok ? 'ML retrofit API returned invalid JSON response.' : `ML retrofit API returned non-JSON response (${response.status}).`)
        continue
      }

      if (!response.ok) {
        throw new Error((body as { error?: string }).error ?? 'ML retrofit estimate failed')
      }

      return body as MlRetrofitEstimate
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('ML retrofit API request failed')
    }
  }

  throw lastError ?? new Error('ML retrofit API request failed')
}
