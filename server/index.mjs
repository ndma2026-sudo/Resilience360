import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'
import { predictRetrofitMl } from './ml/retrofitMlModel.mjs'

dotenv.config()

const app = express()
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } })
const port = Number(process.env.VISION_API_PORT ?? 8787)
const model = process.env.OPENAI_VISION_MODEL ?? 'gpt-4.1-mini'
const hasKey = Boolean(process.env.OPENAI_API_KEY)

const openai = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const extractJson = (rawText) => {
  if (!rawText) {
    throw new Error('Empty model response')
  }

  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : rawText
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Could not parse structured JSON response')
  }

  return JSON.parse(candidate.slice(start, end + 1))
}

const safeArray = (value) => (Array.isArray(value) ? value : [])

app.get('/health', (_req, res) => {
  res.json({ ok: true, hasVisionKey: hasKey, model })
})

app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
  if (!openai) {
    res.status(503).json({
      error:
        'OpenAI key missing. Set OPENAI_API_KEY in your environment to enable deep vision analysis.',
    })
    return
  }

  if (!req.file) {
    res.status(400).json({ error: 'Image file is required.' })
    return
  }

  try {
    const structureType = String(req.body.structureType ?? 'Unknown')
    const province = String(req.body.province ?? 'Unknown')
    const location = String(req.body.location ?? `${province}, Pakistan`)
    const riskProfile = String(req.body.riskProfile ?? 'Unknown')

    const imageBase64 = req.file.buffer.toString('base64')
    const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a structural engineer and disaster retrofit specialist. Analyze the building image for visible defects and produce strict JSON only.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                `Analyze this building image deeply for: cracks, spalling zones, corrosion signs, moisture damage, deformation, and vulnerable details. Context: structureType=${structureType}, province=${province}, location=${location}, hazardProfile=${riskProfile}. Return JSON with this exact schema:\n{\n  "summary": string,\n  "imageQuality": { "visibility": "excellent|good|fair|poor", "notes": string },\n  "defects": [\n    {\n      "type": "crack|spalling|corrosion|moisture|deformation|other",\n      "severity": "low|medium|high",\n      "confidence": number,\n      "location": string,\n      "evidence": string,\n      "retrofitAction": string\n    }\n  ],\n  "costSignals": {\n    "assessedDamageLevel": "low|medium|high",\n    "recommendedScope": "basic|standard|comprehensive",\n    "estimatedAffectedAreaPercent": number,\n    "severityScore": number,\n    "urgencyLevel": "routine|priority|critical"\n  },\n  "priorityActions": string[],\n  "retrofitPlan": {\n    "immediate": string[],\n    "shortTerm": string[],\n    "longTerm": string[]\n  },\n  "safetyNote": string\n}. Constraints: estimatedAffectedAreaPercent must be between 5 and 100, severityScore between 0 and 100, and confidence values between 0 and 1. Use evidence from visible defects only and factor local Pakistan construction/labor context in recommendedScope and urgencyLevel.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const parsed = extractJson(text)

    res.json({
      model,
      analyzedAt: new Date().toISOString(),
      ...parsed,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vision analysis failed.'
    res.status(500).json({ error: message })
  }
})

app.post('/api/ml/retrofit-estimate', (req, res) => {
  try {
    const structureType = String(req.body.structureType ?? 'Masonry House')
    const province = String(req.body.province ?? 'Punjab')
    const city = String(req.body.city ?? '')
    const areaSqft = Number(req.body.areaSqft ?? 1200)
    const severityScore = Number(req.body.severityScore ?? 40)
    const affectedAreaPercent = Number(req.body.affectedAreaPercent ?? 25)
    const urgencyLevel = String(req.body.urgencyLevel ?? 'priority')
    const laborDaily = req.body.laborDaily !== undefined ? Number(req.body.laborDaily) : undefined
    const materialIndex = req.body.materialIndex !== undefined ? Number(req.body.materialIndex) : undefined
    const logisticsIndex = req.body.logisticsIndex !== undefined ? Number(req.body.logisticsIndex) : undefined
    const defectProfile = req.body.defectProfile ?? {}
    const imageQuality = String(req.body.imageQuality ?? 'good')

    const prediction = predictRetrofitMl({
      structureType,
      province,
      city,
      areaSqft,
      severityScore,
      affectedAreaPercent,
      urgencyLevel,
      laborDaily,
      materialIndex,
      logisticsIndex,
      defectProfile,
      imageQuality,
    })

    res.json(prediction)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ML estimate failed.'
    res.status(500).json({ error: message })
  }
})

app.post('/api/guidance/construction', async (req, res) => {
  if (!openai) {
    res.status(503).json({
      error: 'OpenAI key missing. Set OPENAI_API_KEY to enable AI construction guidance.',
    })
    return
  }

  try {
    const province = String(req.body.province ?? 'Punjab')
    const city = String(req.body.city ?? 'Lahore')
    const hazard = String(req.body.hazard ?? 'flood')
    const structureType = String(req.body.structureType ?? 'Masonry House')

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a senior disaster-resilient construction engineer. Return strict JSON only, practical for Pakistan field implementation.',
        },
        {
          role: 'user',
          content:
            `Create construction guidance for ${structureType} in ${city}, ${province}, Pakistan for ${hazard} resilience. Return JSON schema:\n{\n  "summary": string,\n  "materials": string[],\n  "safety": string[],\n  "steps": [\n    {\n      "title": string,\n      "description": string,\n      "keyChecks": string[]\n    }\n  ]\n}. Constraints: 4 to 6 steps, each step must be implementation-ready and sequenced.`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const parsed = extractJson(text)

    res.json({
      summary: String(parsed.summary ?? ''),
      materials: safeArray(parsed.materials).map((item) => String(item)),
      safety: safeArray(parsed.safety).map((item) => String(item)),
      steps: safeArray(parsed.steps)
        .map((step) => ({
          title: String(step?.title ?? ''),
          description: String(step?.description ?? ''),
          keyChecks: safeArray(step?.keyChecks).map((item) => String(item)),
        }))
        .filter((step) => step.title && step.description),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Construction guidance generation failed.'
    res.status(500).json({ error: message })
  }
})

app.post('/api/guidance/step-images', async (req, res) => {
  if (!openai) {
    res.status(503).json({
      error: 'OpenAI key missing. Set OPENAI_API_KEY to enable AI step image generation.',
    })
    return
  }

  try {
    const province = String(req.body.province ?? 'Punjab')
    const city = String(req.body.city ?? 'Lahore')
    const hazard = String(req.body.hazard ?? 'flood')
    const structureType = String(req.body.structureType ?? 'Masonry House')
    const steps = safeArray(req.body.steps).slice(0, 4)

    const images = []

    for (const step of steps) {
      const stepTitle = String(step?.title ?? 'Construction Step')
      const stepDescription = String(step?.description ?? '')
      const prompt = `Technical construction illustration for ${structureType} in ${city}, ${province}, Pakistan. Hazard focus: ${hazard}. Step: ${stepTitle}. Details: ${stepDescription}. Show realistic field workers, materials, and clear sequence visuals.`

      const generated = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
      })

      const b64 = generated.data?.[0]?.b64_json
      if (!b64) continue

      images.push({
        stepTitle,
        prompt,
        imageDataUrl: `data:image/png;base64,${b64}`,
      })
    }

    res.json({ images })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Step image generation failed.'
    res.status(500).json({ error: message })
  }
})

app.post('/api/models/resilience-catalog', async (req, res) => {
  if (!openai) {
    res.status(503).json({
      error: 'OpenAI key missing. Set OPENAI_API_KEY to enable AI infra model catalog.',
    })
    return
  }

  try {
    const country = String(req.body.country ?? 'Pakistan')
    const province = String(req.body.province ?? 'National')

    const modelSpecs = [
      {
        id: 'flood-housing-cluster',
        title: 'Elevated Flood-Resilient Housing Cluster',
        description:
          'Cluster housing model with raised plinth, drainage channels, and protected lifeline utilities for riverine and urban flood zones.',
        features: [
          'Raised plinth and flood-compatible ground floor',
          'Perimeter drainage and sump-pump with backflow control',
          'Elevated electrical and water utility routing',
        ],
        advantagesPakistan: [
          'Reduces recurring flood repair burden in Sindh and South Punjab',
          'Improves post-flood re-occupancy speed for low-income communities',
          'Supports PDMA/municipal flood mitigation investments',
        ],
      },
      {
        id: 'seismic-school-block',
        title: 'Ductile Seismic School Block Retrofit Model',
        description:
          'School safety retrofit with column jacketing, confinement detailing, and non-structural anchorage to protect students in high seismic zones.',
        features: [
          'Column/beam jacketing at critical bays',
          'Masonry confinement and out-of-plane restraint',
          'Secured parapets, ceilings, and service systems',
        ],
        advantagesPakistan: [
          'Cuts collapse risk in KP and GB school infrastructure',
          'Improves continuity of education after earthquakes',
          'Aligns with phased public-sector retrofit budgeting',
        ],
      },
      {
        id: 'bridge-approach-protection',
        title: 'Bridge Approach and Embankment Resilience Model',
        description:
          'Transport resilience model combining embankment stabilization, seismic restraint components, and high-flow erosion protection.',
        features: [
          'Toe protection and sub-surface drainage',
          'Joint restrainers and bearing upgrade package',
          'Scour-resistant slope treatment and monitoring',
        ],
        advantagesPakistan: [
          'Reduces road cut-offs during flood and seismic events',
          'Protects strategic trade and evacuation corridors',
          'Lowers lifecycle maintenance costs for NHA/provincial roads',
        ],
      },
      {
        id: 'community-shelter-hub',
        title: 'Community Shelter + Early Warning Hub Model',
        description:
          'Multi-hazard community center with structural hardening, emergency stock nodes, and integrated warning communication interfaces.',
        features: [
          'Wind/seismic-resistant shelter core',
          'Emergency power, water, and communication stack',
          'Accessible evacuation and medical triage layout',
        ],
        advantagesPakistan: [
          'Strengthens last-mile preparedness in hazard-prone districts',
          'Improves coordination for district emergency response',
          'Provides dual-use public utility in normal times',
        ],
      },
    ]

    const models = []

    for (const spec of modelSpecs) {
      const prompt = `Photorealistic infrastructure visualization for ${spec.title} in ${country} (${province}). Show realistic construction context, local materials, climate-appropriate design, and civil engineering details. No text overlays.`
      const imageResult = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
      })

      const imageBase64 = imageResult.data?.[0]?.b64_json
      if (!imageBase64) continue

      models.push({
        ...spec,
        imageDataUrl: `data:image/png;base64,${imageBase64}`,
      })
    }

    res.json({ models })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Infra model generation failed.'
    res.status(500).json({ error: message })
  }
})

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error && req.path.startsWith('/api/')) {
    res.status(400).json({ error: 'Invalid JSON payload.' })
    return
  }
  next(error)
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' })
})

app.listen(port, () => {
  console.log(`Vision API running on http://localhost:${port}`)
})
