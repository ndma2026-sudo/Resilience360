import { buildApiTargets } from './apiBase'

export type DefectDetection = {
  type: 'crack' | 'spalling' | 'corrosion' | 'moisture' | 'deformation' | 'other'
  severity: 'low' | 'medium' | 'high'
  confidence: number
  location: string
  evidence: string
  retrofitAction: string
}

export type VisionAnalysisResult = {
  model: string
  analyzedAt: string
  summary: string
  imageQuality: {
    visibility: 'excellent' | 'good' | 'fair' | 'poor'
    notes: string
  }
  defects: DefectDetection[]
  costSignals?: {
    assessedDamageLevel: 'low' | 'medium' | 'high'
    recommendedScope: 'basic' | 'standard' | 'comprehensive'
    estimatedAffectedAreaPercent: number
    severityScore: number
    urgencyLevel: 'routine' | 'priority' | 'critical'
  }
  priorityActions: string[]
  retrofitPlan: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  safetyNote: string
}

export const analyzeBuildingWithVision = async (payload: {
  image: File
  structureType: string
  province: string
  location: string
  riskProfile: string
}): Promise<VisionAnalysisResult> => {
  const formData = new FormData()
  formData.append('image', payload.image)
  formData.append('structureType', payload.structureType)
  formData.append('province', payload.province)
  formData.append('location', payload.location)
  formData.append('riskProfile', payload.riskProfile)

  const targets = buildApiTargets('/api/vision/analyze')
  let lastError: Error | null = null

  for (const target of targets) {
    try {
      const response = await fetch(target, {
        method: 'POST',
        body: formData,
      })

      const raw = await response.text()
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
      const isJsonResponse = contentType.includes('application/json')

      if ((response.status === 404 || response.status === 405) && !isJsonResponse) {
        lastError = new Error(`Vision route unavailable on ${target} (${response.status})`)
        continue
      }

      if (!isJsonResponse) {
        lastError = new Error(`Vision API returned non-JSON response (${response.status}) from ${target}.`)
        continue
      }

      let body: VisionAnalysisResult | { error?: string } | null = null

      try {
        body = JSON.parse(raw) as VisionAnalysisResult | { error?: string }
      } catch {
        lastError = new Error(response.ok ? 'Vision API returned invalid JSON response.' : `Vision API returned non-JSON response (${response.status}).`)
        continue
      }

      if (!response.ok) {
        throw new Error((body as { error?: string }).error ?? 'Vision analysis failed')
      }

      return body as VisionAnalysisResult
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Vision API request failed')
    }
  }

  throw lastError ?? new Error('Vision API request failed')
}
