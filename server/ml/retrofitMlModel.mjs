const structureCode = { 'Masonry House': 0, 'RC Frame': 1, 'School Block': 2, 'Bridge Approach': 3 }
const provinceCode = { Punjab: 0, Sindh: 1, Balochistan: 2, KP: 3, GB: 4 }

const provinceHazardFactor = {
  Punjab: 1.06,
  Sindh: 1.1,
  Balochistan: 1.14,
  KP: 1.16,
  GB: 1.2,
}

const structureBase = {
  'Masonry House': { baseRate: 520, baseDuration: 5 },
  'RC Frame': { baseRate: 640, baseDuration: 7 },
  'School Block': { baseRate: 720, baseDuration: 12 },
  'Bridge Approach': { baseRate: 960, baseDuration: 10 },
}

const deriveEquipmentIndex = ({ materialIndex = 1, logisticsIndex = 1 }) => {
  const derived = materialIndex * 0.4 + logisticsIndex * 0.6
  return Math.max(0.95, Math.min(1.35, Number(derived.toFixed(2))))
}

const cityProfiles = {
  Punjab: {
    Lahore: { laborDaily: 3200, materialIndex: 1.1, logisticsIndex: 1.02 },
    Rawalpindi: { laborDaily: 3050, materialIndex: 1.08, logisticsIndex: 1.03 },
    Faisalabad: { laborDaily: 2800, materialIndex: 1.03, logisticsIndex: 1.01 },
    Multan: { laborDaily: 2750, materialIndex: 1.02, logisticsIndex: 1.01 },
  },
  Sindh: {
    Karachi: { laborDaily: 3500, materialIndex: 1.16, logisticsIndex: 1.04 },
    Hyderabad: { laborDaily: 2900, materialIndex: 1.07, logisticsIndex: 1.03 },
    Sukkur: { laborDaily: 2850, materialIndex: 1.05, logisticsIndex: 1.04 },
  },
  Balochistan: {
    Quetta: { laborDaily: 3150, materialIndex: 1.12, logisticsIndex: 1.12 },
    Gwadar: { laborDaily: 3300, materialIndex: 1.17, logisticsIndex: 1.18 },
    Turbat: { laborDaily: 3000, materialIndex: 1.1, logisticsIndex: 1.15 },
  },
  KP: {
    Peshawar: { laborDaily: 3050, materialIndex: 1.09, logisticsIndex: 1.08 },
    Mardan: { laborDaily: 2850, materialIndex: 1.04, logisticsIndex: 1.06 },
    Swat: { laborDaily: 2950, materialIndex: 1.07, logisticsIndex: 1.11 },
  },
  GB: {
    Gilgit: { laborDaily: 3250, materialIndex: 1.15, logisticsIndex: 1.2 },
    Skardu: { laborDaily: 3350, materialIndex: 1.18, logisticsIndex: 1.23 },
    Hunza: { laborDaily: 3320, materialIndex: 1.17, logisticsIndex: 1.24 },
  },
}

const inferCityTier = (city = '') => {
  const value = city.trim().toLowerCase()
  if (!value) return 1
  if (/karachi|lahore|islamabad|rawalpindi|peshawar|quetta/.test(value)) return 2
  if (/gilgit|skardu|chitral|hunza/.test(value)) return 3
  return 1.5
}

const buildSyntheticHistoricalCases = () => {
  const rows = []
  const severityBands = [35, 55, 75]
  const areaBands = [22, 36, 48]
  const urgencyBands = [45, 63, 82]

  for (const [province, cities] of Object.entries(cityProfiles)) {
    for (const [city, cityRate] of Object.entries(cities)) {
      for (const [structureType, structure] of Object.entries(structureBase)) {
        for (let index = 0; index < severityBands.length; index += 1) {
          const severity = severityBands[index]
          const affectedArea = areaBands[index]
          const urgency = urgencyBands[index]
          const scope = severity >= 70 ? 'comprehensive' : severity >= 50 ? 'standard' : 'basic'
          const damage = severity >= 70 ? 'high' : severity >= 50 ? 'medium' : 'low'
          const laborFactor = cityRate.laborDaily / 2600
          const equipmentIndex = deriveEquipmentIndex(cityRate)
          const locationMultiplier = laborFactor * 0.38 + cityRate.materialIndex * 0.34 + equipmentIndex * 0.18 + cityRate.logisticsIndex * 0.1
          const scopeMultiplier = scope === 'comprehensive' ? 1.42 : scope === 'standard' ? 1.18 : 0.98
          const severityMultiplier = 0.86 + severity / 150
          const riskMultiplier = provinceHazardFactor[province] ?? 1

          const costPerSqft =
            structure.baseRate * locationMultiplier * scopeMultiplier * severityMultiplier * riskMultiplier
          const durationWeeks = Math.round(
            structure.baseDuration * (scope === 'comprehensive' ? 1.55 : scope === 'standard' ? 1.2 : 0.9) * (0.9 + urgency / 130),
          )

          rows.push({
            structureType,
            province,
            city,
            cityTier: inferCityTier(city),
            severity,
            affectedArea,
            urgency,
            area: structureType === 'School Block' ? 5200 : structureType === 'Bridge Approach' ? 2600 : structureType === 'RC Frame' ? 2200 : 1200,
            costPerSqft,
            durationWeeks,
            scope,
            damage,
          })
        }
      }
    }
  }
  return rows
}

const featureFor = (sample) => [
  structureCode[sample.structureType] ?? 0,
  provinceCode[sample.province] ?? 0,
  sample.cityTier,
  sample.severity,
  sample.affectedArea,
  sample.urgency,
  Math.log(Math.max(200, sample.area)),
]

const syntheticTrainingSet = buildSyntheticHistoricalCases()
let trainingSet = [...syntheticTrainingSet]
let featureMin = []
let featureMax = []

const rebuildTrainingStats = () => {
  if (trainingSet.length === 0) {
    trainingSet = [...syntheticTrainingSet]
  }

  const allFeatures = trainingSet.map(featureFor)
  featureMin = allFeatures[0].map((_, index) => Math.min(...allFeatures.map((row) => row[index])))
  featureMax = allFeatures[0].map((_, index) => Math.max(...allFeatures.map((row) => row[index])))
}

const mapUrgencyToScore = (urgencyLevel) => {
  if (urgencyLevel === 'critical') return 85
  if (urgencyLevel === 'priority') return 62
  return 38
}

const mapUserTrainingSample = (sample) => {
  const structureType = String(sample.structureType ?? 'Masonry House')
  const province = String(sample.province ?? 'Punjab')
  const city = String(sample.city ?? '')

  if (!structureBase[structureType]) return null

  const base = structureBase[structureType]
  const severity = Math.max(0, Math.min(100, Number(sample.severityScore) || 40))
  const affectedArea = Math.max(5, Math.min(100, Number(sample.affectedAreaPercent) || 25))
  const urgency = mapUrgencyToScore(String(sample.urgencyLevel ?? 'priority'))
  const area = Math.max(200, Math.min(200000, Number(sample.areaSqft) || 1200))
  const cityRate = cityProfiles[province]?.[city] ?? { laborDaily: 2600, materialIndex: 1, logisticsIndex: 1 }

  const laborDaily = Number(sample.laborDaily) || cityRate.laborDaily
  const materialIndex = Number(sample.materialIndex) || cityRate.materialIndex
  const logisticsIndex = Number(sample.logisticsIndex) || cityRate.logisticsIndex
  const equipmentIndex = Number(sample.equipmentIndex) || deriveEquipmentIndex({ materialIndex, logisticsIndex })

  const laborFactor = Math.max(0.85, Math.min(1.5, laborDaily / 2600))
  const materialFactor = Math.max(0.9, Math.min(1.4, materialIndex))
  const logisticsFactor = Math.max(0.9, Math.min(1.4, logisticsIndex))
  const equipmentFactor = Math.max(0.9, Math.min(1.4, equipmentIndex))
  const locationMultiplier = laborFactor * 0.38 + materialFactor * 0.34 + equipmentFactor * 0.18 + logisticsFactor * 0.1

  const scope = severity >= 70 ? 'comprehensive' : severity >= 50 ? 'standard' : 'basic'
  const damage = severity >= 70 ? 'high' : severity >= 50 ? 'medium' : 'low'
  const scopeMultiplier = scope === 'comprehensive' ? 1.42 : scope === 'standard' ? 1.18 : 0.98
  const severityMultiplier = 0.86 + severity / 150
  const riskMultiplier = provinceHazardFactor[province] ?? 1
  const costPerSqft = base.baseRate * locationMultiplier * scopeMultiplier * severityMultiplier * riskMultiplier
  const durationWeeks = Math.max(
    2,
    Math.round(base.baseDuration * (scope === 'comprehensive' ? 1.55 : scope === 'standard' ? 1.2 : 0.9) * (0.9 + urgency / 130)),
  )

  return {
    structureType,
    province,
    city,
    cityTier: inferCityTier(city),
    severity,
    affectedArea,
    urgency,
    area,
    costPerSqft,
    durationWeeks,
    scope,
    damage,
  }
}

export const retrainRetrofitMlModel = (samples = []) => {
  const userRows = samples.map(mapUserTrainingSample).filter(Boolean)
  trainingSet = [...syntheticTrainingSet, ...userRows]
  rebuildTrainingStats()

  return {
    message: 'ML retrofit model updated with training data.',
    syntheticRows: syntheticTrainingSet.length,
    userRows: userRows.length,
    totalRows: trainingSet.length,
    modelVersion: `R360-kNN-v2+u${userRows.length}`,
  }
}

rebuildTrainingStats()

const normalize = (vector) =>
  vector.map((value, index) => {
    const min = featureMin[index]
    const max = featureMax[index]
    if (max === min) return 0
    return (value - min) / (max - min)
  })

const distance = (left, right) => {
  let sum = 0
  for (let index = 0; index < left.length; index += 1) {
    const diff = left[index] - right[index]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

const weightedVote = (items, key) => {
  const tally = new Map()
  for (const item of items) {
    const label = item.sample[key]
    const score = (tally.get(label) ?? 0) + item.weight
    tally.set(label, score)
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

const weightedAverage = (items, key) => {
  let weightedSum = 0
  let totalWeight = 0
  for (const item of items) {
    weightedSum += item.sample[key] * item.weight
    totalWeight += item.weight
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

const generateDetailedGuidance = ({ predictedScope, predictedDamage, defectProfile, province }) => {
  const actions = []

  if ((defectProfile.crack ?? 0) > 0 || predictedDamage === 'high') {
    actions.push({
      priority: 'P1',
      action: 'Stitch and inject major cracks with epoxy/grout before global strengthening.',
      rationale: 'Open structural cracks accelerate stiffness loss and collapse risk under seismic loading.',
      estimatedImpact: 'Reduces immediate failure risk by stabilizing primary load paths.',
    })
  }

  if ((defectProfile.corrosion ?? 0) > 0 || (defectProfile.spalling ?? 0) > 0) {
    actions.push({
      priority: 'P1',
      action: 'Remove delaminated concrete, passivate steel, and apply polymer-modified repair mortar.',
      rationale: 'Corrosion and spalling reduce section capacity and bond strength.',
      estimatedImpact: 'Improves durability and restores member capacity for retrofit overlays.',
    })
  }

  if ((defectProfile.moisture ?? 0) > 0 || province === 'Sindh') {
    actions.push({
      priority: 'P2',
      action: 'Install damp-proofing, drainage correction, and waterproof protective coatings.',
      rationale: 'Moisture ingress drives reinforcement corrosion and masonry deterioration.',
      estimatedImpact: 'Lowers long-term maintenance cost and avoids repeated patch failures.',
    })
  }

  if ((defectProfile.deformation ?? 0) > 0 || predictedScope === 'comprehensive') {
    actions.push({
      priority: 'P1',
      action: 'Add lateral-load system upgrades (jacketing/shear walls/bracing) with ductile detailing.',
      rationale: 'Visible deformation often indicates inadequate lateral resistance.',
      estimatedImpact: 'Substantial reduction in seismic drift and life-safety risk.',
    })
  }

  actions.push({
    priority: 'P3',
    action: 'Implement staged QA/QC with engineer sign-off after each intervention package.',
    rationale: 'Execution quality controls retrofit performance as much as design choice.',
    estimatedImpact: 'Improves expected performance reliability of retrofit investments.',
  })

  return actions.slice(0, 5)
}

export const predictRetrofitMl = ({
  structureType,
  province,
  city,
  areaSqft,
  severityScore,
  affectedAreaPercent,
  urgencyLevel,
  laborDaily,
  materialIndex,
  equipmentIndex,
  logisticsIndex,
  defectProfile,
  imageQuality,
}) => {
  const urgencyScore = urgencyLevel === 'critical' ? 85 : urgencyLevel === 'priority' ? 62 : 38
  const sample = {
    structureType,
    province,
    cityTier: inferCityTier(city),
    severity: Math.max(0, Math.min(100, Number(severityScore) || 40)),
    affectedArea: Math.max(5, Math.min(100, Number(affectedAreaPercent) || 25)),
    urgency: urgencyScore,
    area: Math.max(200, Math.min(200000, Number(areaSqft) || 1200)),
  }

  const sampleVector = normalize(featureFor(sample))

  const neighbors = trainingSet
    .map((row) => {
      const vector = normalize(featureFor(row))
      const dist = distance(sampleVector, vector)
      return {
        sample: row,
        dist,
        weight: 1 / (dist + 0.03),
      }
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)

  const predictedCostPerSqft = weightedAverage(neighbors, 'costPerSqft')
  const predictedDuration = weightedAverage(neighbors, 'durationWeeks')
  const predictedScope = weightedVote(neighbors, 'scope')
  const predictedDamage = weightedVote(neighbors, 'damage')

  const meanDistance = neighbors.reduce((sum, row) => sum + row.dist, 0) / neighbors.length
  const qualityPenalty = imageQuality === 'poor' ? 0.12 : imageQuality === 'fair' ? 0.07 : imageQuality === 'excellent' ? -0.02 : 0
  const confidence = Math.max(0.45, Math.min(0.95, 1 - meanDistance / 1.8 - qualityPenalty))

  const laborFactor = laborDaily ? Math.max(0.85, Math.min(1.5, laborDaily / 2600)) : 1
  const materialFactor = materialIndex ? Math.max(0.9, Math.min(1.4, materialIndex)) : 1
  const logisticsFactor = logisticsIndex ? Math.max(0.9, Math.min(1.4, logisticsIndex)) : 1
  const equipmentFactor = equipmentIndex
    ? Math.max(0.9, Math.min(1.4, equipmentIndex))
    : deriveEquipmentIndex({ materialIndex: materialFactor, logisticsIndex: logisticsFactor })
  const locationMultiplier = laborFactor * 0.38 + materialFactor * 0.34 + equipmentFactor * 0.18 + logisticsFactor * 0.1

  const guidance = [
    predictedScope === 'comprehensive'
      ? 'Adopt full structural retrofit package with staged execution.'
      : predictedScope === 'standard'
        ? 'Use targeted structural upgrades for critical members.'
        : 'Use localized defect repair and preventive strengthening.',
    predictedDamage === 'high'
      ? 'Prioritize life-safety interventions before cosmetic repairs.'
      : predictedDamage === 'medium'
        ? 'Sequence repairs zone-wise to reduce operational disruption.'
        : 'Run preventive retrofit with waterproofing and joint strengthening.',
  ]

  const guidanceDetailed = generateDetailedGuidance({
    predictedScope,
    predictedDamage,
    defectProfile: defectProfile ?? {},
    province,
  })

  return {
    model: 'R360-kNN-v2',
    predictedScope,
    predictedDamage,
    predictedCostPerSqft: Math.max(250, Math.min(1800, predictedCostPerSqft * locationMultiplier)),
    predictedDurationWeeks: Math.max(2, Math.round(predictedDuration)),
    confidence,
    guidance,
    guidanceDetailed,
    assumptions: [
      'Model is calibrated with Pakistan location rate profiles (labor, material, equipment, logistics) and synthetic historical retrofit cases.',
      'Guidance confidence depends on image quality and defect visibility.',
    ],
  }
}
