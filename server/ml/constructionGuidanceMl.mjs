const provinceHazardFactor = {
  Punjab: { flood: 1.08, earthquake: 1.02 },
  Sindh: { flood: 1.18, earthquake: 0.98 },
  Balochistan: { flood: 1.01, earthquake: 1.2 },
  KP: { flood: 1.11, earthquake: 1.16 },
  GB: { flood: 1.04, earthquake: 1.22 },
}

const structureDefaults = {
  'Masonry House': {
    materials: ['PCC 1:2:4 mix for plinth works', '10-12mm deformed steel bars', 'Cement-sand plaster with waterproof additive', 'Flood-resistant door/window frames', 'Bitumen damp-proof course'],
    baselineSafety: ['Use PPE: helmet, gloves, and safety boots at all times.', 'Block unsafe zones and post clear warning signs.', 'Verify curing and inspection checkpoints before load application.'],
  },
  'RC Frame': {
    materials: ['M25 concrete with controlled water-cement ratio', 'Fe500 grade reinforcement with proper laps', 'Column jacketing mortar (polymer modified)', 'Expansion and construction joint sealant', 'Protective anti-corrosion coating'],
    baselineSafety: ['Provide temporary shoring during retrofit operations.', 'Do not remove structural members without engineer sign-off.', 'Use calibrated torque and rebar spacing checks.'],
  },
  'School Block': {
    materials: ['Ductile detailing reinforcement kit', 'Masonry confinement bands', 'Anchor bolts for non-structural elements', 'Impact-resistant glazing film', 'Emergency route signage package'],
    baselineSafety: ['Isolate student-use areas during structural works.', 'Maintain two clear evacuation paths throughout construction.', 'Carry out daily toolbox safety talks with contractor teams.'],
  },
  'Bridge Approach': {
    materials: ['Riprap/gabion toe protection', 'Geotextile and geogrid layers', 'Subsurface drainage pipe with filter media', 'Joint restrainer hardware', 'Slope protection concrete blocks'],
    baselineSafety: ['Implement traffic diversion and night reflectors.', 'Stabilize embankment before heavy equipment entry.', 'Monitor approach settlement at every stage.'],
  },
}

const defaultStructure = structureDefaults['Masonry House']

const guidanceTemplates = {
  flood: [
    {
      title: 'Set Flood Design Level and Site Drainage',
      description:
        'Mark the local flood design level, set finished floor/plinth above it, and create positive drainage away from foundations.',
      keyChecks: ['Finished floor level marked on all corners', 'Minimum slope for site runoff provided', 'No stagnant water zones near foundation edge'],
      tags: ['all', 'flood', 'drainage'],
      baseScore: 0.96,
    },
    {
      title: 'Raise Plinth and Protect Foundation Edge',
      description:
        'Construct raised plinth with compacted fill and install toe/edge protection to limit erosion and undercutting.',
      keyChecks: ['Compaction done in layers', 'Toe protection completed before monsoon window', 'DPC placed continuously above plinth'],
      tags: ['all', 'flood', 'masonry', 'rc'],
      baseScore: 0.94,
    },
    {
      title: 'Seal Moisture Entry Paths',
      description:
        'Apply waterproofing and seal all wall-floor junctions, service penetrations, and vulnerable construction joints.',
      keyChecks: ['Wall-floor corners sealed', 'Service entry points sealed', 'Protective coating continuity checked'],
      tags: ['all', 'flood', 'moisture'],
      baseScore: 0.9,
    },
    {
      title: 'Elevate Critical Utilities and Access Paths',
      description:
        'Relocate electrical panels, backup power, and water pumps above flood level and keep access paths usable during waterlogging.',
      keyChecks: ['Electrical panel above design flood level', 'Backflow valve installed', 'Access path remains serviceable under heavy rain'],
      tags: ['all', 'flood', 'utilities'],
      baseScore: 0.92,
    },
    {
      title: 'Implement Flood-Ready Operation Protocol',
      description:
        'Create pre-flood inspection checklist, stock emergency repair kit, and define rapid post-flood safety assessment sequence.',
      keyChecks: ['Checklist posted onsite', 'Emergency kit inventory validated', 'Post-flood structural check workflow assigned'],
      tags: ['all', 'flood', 'ops'],
      baseScore: 0.88,
    },
  ],
  earthquake: [
    {
      title: 'Establish Lateral Load Path Continuity',
      description:
        'Verify and strengthen beam-column-wall continuity so seismic forces transfer safely to the foundation without weak links.',
      keyChecks: ['Critical joints identified and detailed', 'Continuous load path documented', 'No soft-story mechanism left unaddressed'],
      tags: ['all', 'earthquake', 'rc', 'school'],
      baseScore: 0.97,
    },
    {
      title: 'Confinement and Jacketing at Critical Members',
      description:
        'Apply confinement/jacketing to highly stressed columns, wall piers, and short columns to increase ductility.',
      keyChecks: ['Confinement spacing matches detail', 'Jacketing bond preparation completed', 'Member alignment verified after jacketing'],
      tags: ['all', 'earthquake', 'rc', 'school', 'bridge'],
      baseScore: 0.95,
    },
    {
      title: 'Anchor Non-Structural Components',
      description:
        'Secure parapets, ceilings, equipment, and utility lines to reduce falling hazards and life-safety risk during shaking.',
      keyChecks: ['Parapet anchorage completed', 'Ceiling and equipment anchors tested', 'Critical utility lines restrained'],
      tags: ['all', 'earthquake', 'safety'],
      baseScore: 0.91,
    },
    {
      title: 'Improve Foundation and Soil Interaction',
      description:
        'Address settlement-prone zones and reinforce foundation connections to improve response under cyclic loading.',
      keyChecks: ['Settlement-prone pockets treated', 'Foundation tie details installed', 'No open foundation cracks after intervention'],
      tags: ['all', 'earthquake', 'foundation'],
      baseScore: 0.9,
    },
    {
      title: 'Deploy Seismic QA and Rapid Safety Plan',
      description:
        'Run stage-wise QA for retrofit works and maintain a rapid post-event occupancy/safety assessment protocol.',
      keyChecks: ['Stage QA records signed', 'Post-event inspection team assigned', 'Occupancy decision criteria documented'],
      tags: ['all', 'earthquake', 'ops'],
      baseScore: 0.87,
    },
  ],
}

const structureTags = {
  'Masonry House': ['masonry'],
  'RC Frame': ['rc'],
  'School Block': ['school', 'rc'],
  'Bridge Approach': ['bridge'],
}

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toSvgDataUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

const hazardPalette = {
  flood: {
    bg1: '#dff2ff',
    bg2: '#cbe9ff',
    accent: '#1d6fb8',
    accentSoft: '#77acd8',
    text: '#0b2e4e',
  },
  earthquake: {
    bg1: '#ffe8df',
    bg2: '#ffd9ca',
    accent: '#b8542a',
    accentSoft: '#d88a65',
    text: '#4a1d0b',
  },
}

const buildStepSvg = ({ province, city, hazard, structureType, step, index }) => {
  const palette = hazardPalette[hazard] ?? hazardPalette.flood
  const title = `${index + 1}. ${step.title}`
  const subtitle = `${structureType} · ${city}, ${province}`

  const checks = (Array.isArray(step.keyChecks) ? step.keyChecks : []).slice(0, 2)
  const check1 = checks[0] ?? 'Validate field measurements before execution.'
  const check2 = checks[1] ?? 'Maintain supervisor QA sign-off at this stage.'

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768" viewBox="0 0 1024 768" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg1}"/>
      <stop offset="100%" stop-color="${palette.bg2}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1024" height="768" fill="url(#bg)"/>
  <rect x="44" y="42" width="936" height="100" rx="14" fill="#ffffff" opacity="0.88"/>
  <text x="72" y="92" font-family="Arial, Helvetica, sans-serif" font-size="35" font-weight="700" fill="${palette.text}">${escapeXml(title)}</text>
  <text x="72" y="126" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="${palette.accent}">${escapeXml(subtitle)}</text>

  <rect x="52" y="182" width="600" height="450" rx="16" fill="#ffffff" opacity="0.92"/>
  <rect x="682" y="182" width="292" height="450" rx="16" fill="#ffffff" opacity="0.92"/>

  <rect x="94" y="250" width="120" height="300" rx="10" fill="${palette.accentSoft}" opacity="0.65"/>
  <rect x="248" y="290" width="120" height="260" rx="10" fill="${palette.accentSoft}" opacity="0.65"/>
  <rect x="402" y="220" width="120" height="330" rx="10" fill="${palette.accent}" opacity="0.72"/>
  <path d="M94 560 L546 560" stroke="${palette.text}" stroke-width="8" stroke-linecap="round"/>

  <text x="706" y="244" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${palette.text}">Field Key Checks</text>
  <circle cx="712" cy="284" r="7" fill="${palette.accent}"/>
  <text x="730" y="292" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${palette.text}">${escapeXml(check1)}</text>
  <circle cx="712" cy="334" r="7" fill="${palette.accent}"/>
  <text x="730" y="342" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${palette.text}">${escapeXml(check2)}</text>

  <rect x="706" y="392" width="244" height="208" rx="12" fill="${palette.accent}" opacity="0.14"/>
  <text x="726" y="438" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="${palette.text}">Hazard Focus</text>
  <text x="726" y="470" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${palette.accent}">${escapeXml(hazard.toUpperCase())}</text>
  <text x="726" y="518" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${palette.text}">ML-generated construction</text>
  <text x="726" y="544" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${palette.text}">execution visual</text>
</svg>`

  return toSvgDataUrl(svg)
}

const scoreTemplate = ({ template, hazard, structureType, province }) => {
  const provinceFactor = provinceHazardFactor[province]?.[hazard] ?? 1
  const tags = structureTags[structureType] ?? []
  const structureBoost = tags.some((tag) => template.tags.includes(tag)) ? 0.07 : 0
  const hazardBoost = template.tags.includes(hazard) ? 0.08 : 0
  return template.baseScore * provinceFactor + structureBoost + hazardBoost
}

const selectTopSteps = ({ hazard, structureType, province }) => {
  const candidates = guidanceTemplates[hazard] ?? guidanceTemplates.flood
  return candidates
    .map((template) => ({
      ...template,
      score: scoreTemplate({ template, hazard, structureType, province }),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map(({ title, description, keyChecks }) => ({ title, description, keyChecks }))
}

const buildSummary = ({ province, city, hazard, structureType, steps }) => {
  const highPriority = steps[0]?.title ?? 'critical retrofit action'
  return `ML guidance generated for ${structureType} in ${city}, ${province} with ${hazard} focus. Prioritize ${highPriority.toLowerCase()} first, then execute remaining steps in sequence with site QA checks.`
}

export const generateConstructionGuidanceMl = ({ province, city, hazard, structureType }) => {
  const normalizedHazard = hazard === 'earthquake' ? 'earthquake' : 'flood'
  const normalizedStructure = structureDefaults[structureType] ? structureType : 'Masonry House'
  const structureProfile = structureDefaults[normalizedStructure] ?? defaultStructure

  const steps = selectTopSteps({
    hazard: normalizedHazard,
    structureType: normalizedStructure,
    province,
  })

  return {
    summary: buildSummary({
      province,
      city,
      hazard: normalizedHazard,
      structureType: normalizedStructure,
      steps,
    }),
    materials: structureProfile.materials,
    safety: structureProfile.baselineSafety,
    steps,
  }
}

export const generateGuidanceStepImagesMl = ({ province, city, hazard, structureType, steps }) => {
  const normalizedHazard = hazard === 'earthquake' ? 'earthquake' : 'flood'
  const selectedSteps = Array.isArray(steps) ? steps.slice(0, 5) : []

  return selectedSteps.map((step, index) => ({
    stepTitle: String(step?.title ?? `Step ${index + 1}`),
    prompt: `ML-rendered construction visual for ${structureType} in ${city}, ${province} (${normalizedHazard}) - ${String(step?.title ?? `Step ${index + 1}`)}`,
    imageDataUrl: buildStepSvg({
      province,
      city,
      hazard: normalizedHazard,
      structureType,
      step,
      index,
    }),
  }))
}