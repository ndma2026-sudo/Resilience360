import { buildApiUrl } from './apiBase'

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

  const response = await fetch(buildApiUrl('/api/vision/analyze'), {
    method: 'POST',
    body: formData,
  })

  const raw = await response.text()
  let body: VisionAnalysisResult | { error?: string } | null = null

  try {
    body = JSON.parse(raw) as VisionAnalysisResult | { error?: string }
  } catch {
    if (!response.ok) {
      throw new Error(`Vision API returned non-JSON response (${response.status}).`)
    }
    throw new Error('Vision API returned invalid JSON response.')
  }

  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? 'Vision analysis failed')
  }

  return body as VisionAnalysisResult
}
