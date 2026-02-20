import { buildApiTargets } from './apiBase'

export type InfraModel = {
  id: string
  title: string
  description: string
  features: string[]
  advantagesPakistan: string[]
  imageDataUrl: string
}

const postJsonWithFallback = async (path: string, payload: object): Promise<Response> => {
  const targets = buildApiTargets(path)
  let lastError: Error | null = null

  for (const target of targets) {
    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status !== 404) return response
      lastError = new Error(`Route not found on ${target}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network request failed')
    }
  }

  throw lastError ?? new Error('Infra model request failed')
}

const fallbackModelSpecs: Omit<InfraModel, 'imageDataUrl'>[] = [
  {
    id: 'flood-housing-cluster',
    title: 'Elevated Flood-Resilient Housing Cluster',
    description: 'Raised plinth housing with drainage and utility protection for flood-prone districts.',
    features: [
      'Raised plinth and flood-compatible lower storey',
      'Backflow prevention and pumped drainage',
      'Elevated power/water utility routing',
    ],
    advantagesPakistan: [
      'Reduces annual flood repair burden in Sindh and South Punjab',
      'Improves post-flood occupancy recovery',
      'Supports district-level resilience investments',
    ],
  },
  {
    id: 'seismic-school-retrofit',
    title: 'Ductile Seismic School Retrofit Model',
    description: 'School retrofit package using jacketing and confinement to improve life safety in seismic zones.',
    features: ['Column and beam strengthening', 'Masonry confinement and anchorage', 'Non-structural hazard control'],
    advantagesPakistan: [
      'Cuts collapse risk in KP and GB schools',
      'Improves service continuity after earthquakes',
      'Fits phased public retrofit funding',
    ],
  },
  {
    id: 'bridge-approach-protection',
    title: 'Bridge Approach Resilience Model',
    description: 'Embankment stabilization with scour and seismic protection for transport continuity.',
    features: ['Toe protection and subsurface drainage', 'Joint restrainers and bearing upgrades', 'Slope erosion control'],
    advantagesPakistan: [
      'Reduces emergency road closures',
      'Protects evacuation and trade routes',
      'Lowers maintenance lifecycle cost',
    ],
  },
  {
    id: 'community-shelter-hub',
    title: 'Community Shelter & Warning Hub Model',
    description: 'Multi-hazard shelter with hardened core and integrated warning/response support.',
    features: ['Resilient structural core', 'Emergency power/water/communications', 'Accessible evacuation layout'],
    advantagesPakistan: [
      'Strengthens last-mile readiness',
      'Improves district emergency coordination',
      'Provides useful public-space function year-round',
    ],
  },
]

const generateImagesFromGuidanceApi = async (payload: { country?: string; province?: string }) => {
  const imageResponse = await postJsonWithFallback('/api/guidance/step-images', {
    province: payload.province ?? 'Punjab',
    city: 'Lahore',
    hazard: 'flood',
    structureType: 'Resilient Infrastructure',
    steps: fallbackModelSpecs.map((item) => ({
      title: item.title,
      description: `${item.description} Context: ${payload.country ?? 'Pakistan'}, ${payload.province ?? 'National'}.`,
    })),
  })

  const imageBody = await parseJsonResponse<{ images: Array<{ stepTitle: string; imageDataUrl: string }> }>(
    imageResponse,
    'Infra model image generation failed',
  )

  return fallbackModelSpecs.map((item, index) => {
    const matched = imageBody.images.find((image) => image.stepTitle === item.title) ?? imageBody.images[index]
    return {
      ...item,
      imageDataUrl: matched?.imageDataUrl ?? '',
    }
  })
}

const parseJsonResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  const raw = await response.text()
  let body: T | { error?: string } | null = null

  try {
    body = JSON.parse(raw) as T | { error?: string }
  } catch {
    throw new Error(response.ok ? `${fallback}: invalid JSON response.` : `${fallback}: non-JSON response (${response.status}).`)
  }

  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? fallback)
  }

  return body as T
}

export const fetchResilienceInfraModels = async (payload: {
  country?: string
  province?: string
}): Promise<{ models: InfraModel[] }> => {
  try {
    const response = await postJsonWithFallback('/api/models/resilience-catalog', payload)
    return await parseJsonResponse<{ models: InfraModel[] }>(response, 'Infra model generation failed')
  } catch {
    const fallbackModels = await generateImagesFromGuidanceApi(payload)
    return { models: fallbackModels }
  }
}
