export interface MaterialHub {
  id: string;
  name: string;
  location: string;
  district: string;
  coordinates: [number, number];
  capacity: number; // homes that can be reconstructed
  status: 'ready' | 'moderate' | 'critical';
  stockPercentage: number;
  damagePercentage: number;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  opening: number;
  received: number;
  issued: number;
  closing: number;
  damaged: number;
  percentageRemaining: number;
}

export interface HubInventory {
  hubId: string;
  hubName: string;
  materials: Material[];
  lastUpdated: string;
}

export interface IssuanceRequest {
  id: string;
  requestNumber: string;
  pdmaOffice: string;
  district: string;
  assessmentType: string;
  requestedMaterials: { materialId: string; materialName: string; quantity: number }[];
  status: 'pending' | 'approved' | 'dispatched' | 'completed' | 'rejected';
  requestDate: string;
  approvalDate?: string;
  dispatchDate?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface DamageReport {
  id: string;
  hubId: string;
  hubName: string;
  materialId: string;
  materialName: string;
  damagedCount: number;
  totalCount: number;
  reason: string;
  reportDate: string;
  photos?: string[];
  financialLoss: number;
  urgencyLevel: 'high' | 'medium' | 'low';
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  startDate: string;
  capacity: number;
  enrolled: number;
  topics: string[];
}

export interface Partner {
  id: string;
  name: string;
  type: 'CSR' | 'NGO' | 'Government' | 'International';
  contribution: string;
  logo?: string;
}

// Mock Data
export const mockHubs: MaterialHub[] = [
  {
    id: 'gb1',
    name: 'Gilgit Material Hub',
    location: 'Gilgit',
    district: 'Gilgit-Baltistan',
    coordinates: [35.9208, 74.3080],
    capacity: 200,
    status: 'ready',
    stockPercentage: 92,
    damagePercentage: 2,
  },
  {
    id: 'mzg1',
    name: 'Muzaffargarh Material Hub',
    location: 'Muzaffargarh',
    district: 'Muzaffargarh',
    coordinates: [30.0704, 71.1932],
    capacity: 200,
    status: 'moderate',
    stockPercentage: 68,
    damagePercentage: 12,
  },
  {
    id: 'sukkur1',
    name: 'Sukkur Material Hub',
    location: 'Sukkur',
    district: 'Sukkur',
    coordinates: [27.7052, 68.8574],
    capacity: 200,
    status: 'critical',
    stockPercentage: 54,
    damagePercentage: 18,
  },
];

export const mockInventory: HubInventory[] = [
  {
    hubId: 'gb1',
    hubName: 'Gilgit Material Hub',
    lastUpdated: '2026-02-15',
    materials: [
      { id: 'm1', name: 'Bamboo Poles', unit: 'pieces', opening: 5000, received: 1000, issued: 800, closing: 5200, damaged: 100, percentageRemaining: 92 },
      { id: 'm2', name: 'EPS Panels', unit: 'panels', opening: 3000, received: 500, issued: 300, closing: 3200, damaged: 50, percentageRemaining: 94 },
      { id: 'm3', name: 'CGI Sheets', unit: 'sheets', opening: 4000, received: 800, issued: 600, closing: 4200, damaged: 80, percentageRemaining: 93 },
      { id: 'm4', name: 'Chick Mats', unit: 'mats', opening: 2500, received: 400, issued: 250, closing: 2650, damaged: 60, percentageRemaining: 95 },
      { id: 'm5', name: 'Tarpaulin', unit: 'rolls', opening: 1800, received: 300, issued: 200, closing: 1900, damaged: 40, percentageRemaining: 93 },
    ],
  },
  {
    hubId: 'mzg1',
    hubName: 'Muzaffargarh Material Hub',
    lastUpdated: '2026-02-15',
    materials: [
      { id: 'm1', name: 'Bamboo Poles', unit: 'pieces', opening: 4500, received: 500, issued: 1200, closing: 3800, damaged: 450, percentageRemaining: 68 },
      { id: 'm2', name: 'EPS Panels', unit: 'panels', opening: 2800, received: 300, issued: 800, closing: 2300, damaged: 200, percentageRemaining: 70 },
      { id: 'm3', name: 'CGI Sheets', unit: 'sheets', opening: 3800, received: 400, issued: 900, closing: 3300, damaged: 250, percentageRemaining: 72 },
      { id: 'm4', name: 'Chick Mats', unit: 'mats', opening: 2200, received: 200, issued: 600, closing: 1800, damaged: 150, percentageRemaining: 69 },
      { id: 'm5', name: 'Tarpaulin', unit: 'rolls', opening: 1600, received: 150, issued: 450, closing: 1300, damaged: 100, percentageRemaining: 65 },
    ],
  },
  {
    hubId: 'sukkur1',
    hubName: 'Sukkur Material Hub',
    lastUpdated: '2026-02-15',
    materials: [
      { id: 'm1', name: 'Bamboo Poles', unit: 'pieces', opening: 4000, received: 300, issued: 1500, closing: 2800, damaged: 600, percentageRemaining: 54 },
      { id: 'm2', name: 'EPS Panels', unit: 'panels', opening: 2500, received: 200, issued: 1000, closing: 1700, damaged: 400, percentageRemaining: 56 },
      { id: 'm3', name: 'CGI Sheets', unit: 'sheets', opening: 3500, received: 250, issued: 1200, closing: 2550, damaged: 500, percentageRemaining: 58 },
      { id: 'm4', name: 'Chick Mats', unit: 'mats', opening: 2000, received: 150, issued: 800, closing: 1350, damaged: 350, percentageRemaining: 52 },
      { id: 'm5', name: 'Tarpaulin', unit: 'rolls', opening: 1500, received: 100, issued: 600, closing: 1000, damaged: 200, percentageRemaining: 50 },
    ],
  },
];

export const mockIssuanceRequests: IssuanceRequest[] = [
  {
    id: 'req1',
    requestNumber: 'PDMA/GB/2026/001',
    pdmaOffice: 'PDMA Gilgit-Baltistan',
    district: 'Ghizer',
    assessmentType: 'Flood Assessment',
    requestedMaterials: [
      { materialId: 'm1', materialName: 'Bamboo Poles', quantity: 500 },
      { materialId: 'm3', materialName: 'CGI Sheets', quantity: 300 },
    ],
    status: 'approved',
    requestDate: '2026-02-10',
    approvalDate: '2026-02-12',
    urgency: 'high',
  },
  {
    id: 'req2',
    requestNumber: 'PDMA/MZG/2026/015',
    pdmaOffice: 'PDMA Punjab',
    district: 'Muzaffargarh',
    assessmentType: 'Earthquake Relief',
    requestedMaterials: [
      { materialId: 'm2', materialName: 'EPS Panels', quantity: 400 },
      { materialId: 'm4', materialName: 'Chick Mats', quantity: 250 },
    ],
    status: 'pending',
    requestDate: '2026-02-20',
    urgency: 'medium',
  },
  {
    id: 'req3',
    requestNumber: 'PDMA/SKR/2026/008',
    pdmaOffice: 'PDMA Sindh',
    district: 'Sukkur',
    assessmentType: 'Monsoon Damage',
    requestedMaterials: [
      { materialId: 'm1', materialName: 'Bamboo Poles', quantity: 800 },
      { materialId: 'm5', materialName: 'Tarpaulin', quantity: 200 },
    ],
    status: 'dispatched',
    requestDate: '2026-02-05',
    approvalDate: '2026-02-08',
    dispatchDate: '2026-02-15',
    urgency: 'high',
  },
];

export const mockDamageReports: DamageReport[] = [
  {
    id: 'dmg1',
    hubId: 'mzg1',
    hubName: 'Muzaffargarh Material Hub',
    materialId: 'm1',
    materialName: 'Bamboo Poles',
    damagedCount: 450,
    totalCount: 5000,
    reason: 'Deterioration due to humidity and poor storage conditions',
    reportDate: '2026-02-15',
    financialLoss: 45000,
    urgencyLevel: 'high',
  },
  {
    id: 'dmg2',
    hubId: 'sukkur1',
    hubName: 'Sukkur Material Hub',
    materialId: 'm4',
    materialName: 'Chick Mats',
    damagedCount: 350,
    totalCount: 2000,
    reason: 'Water damage and pest infestation',
    reportDate: '2026-02-14',
    financialLoss: 28000,
    urgencyLevel: 'high',
  },
  {
    id: 'dmg3',
    hubId: 'sukkur1',
    hubName: 'Sukkur Material Hub',
    materialId: 'm1',
    materialName: 'Bamboo Poles',
    damagedCount: 600,
    totalCount: 4000,
    reason: 'Termite infestation and weathering',
    reportDate: '2026-02-13',
    financialLoss: 60000,
    urgencyLevel: 'high',
  },
];

export const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: 'tr1',
    title: 'Bamboo Frame Installation Training',
    description: 'Comprehensive training on proper bamboo frame construction techniques for disaster-resilient housing.',
    duration: '3 days',
    location: 'Gilgit Material Hub',
    startDate: '2026-03-05',
    capacity: 30,
    enrolled: 18,
    topics: ['Bamboo selection', 'Frame assembly', 'Foundation preparation', 'Structural integrity'],
  },
  {
    id: 'tr2',
    title: 'EPS Panel Fitting Workshop',
    description: 'Hands-on workshop for installing EPS panels in bamboo structures.',
    duration: '2 days',
    location: 'Muzaffargarh Material Hub',
    startDate: '2026-03-12',
    capacity: 25,
    enrolled: 22,
    topics: ['Panel sizing', 'Installation methods', 'Insulation techniques', 'Quality control'],
  },
  {
    id: 'tr3',
    title: 'CGI Sheet Roofing Certification',
    description: 'Professional certification program for CGI sheet roofing installation.',
    duration: '4 days',
    location: 'Sukkur Material Hub',
    startDate: '2026-03-18',
    capacity: 20,
    enrolled: 15,
    topics: ['Roof design', 'Sheet installation', 'Weatherproofing', 'Safety measures'],
  },
  {
    id: 'tr4',
    title: 'Complete Disaster-Resilient Housing',
    description: 'Full course covering all aspects of building disaster-resilient structures.',
    duration: '7 days',
    location: 'All Hubs (Rotating)',
    startDate: '2026-04-01',
    capacity: 50,
    enrolled: 12,
    topics: ['Site assessment', 'Material selection', 'Construction techniques', 'Maintenance'],
  },
];

export const mockPartners: Partner[] = [
  {
    id: 'p1',
    name: 'National Disaster Management Authority (NDMA)',
    type: 'Government',
    contribution: 'Primary coordination and funding',
  },
  {
    id: 'p2',
    name: 'Provincial Disaster Management Authorities',
    type: 'Government',
    contribution: 'Regional coordination and assessment',
  },
  {
    id: 'p3',
    name: 'World Bank',
    type: 'International',
    contribution: 'Financial support and technical expertise',
  },
  {
    id: 'p4',
    name: 'UNDP Pakistan',
    type: 'International',
    contribution: 'Capacity building and training programs',
  },
  {
    id: 'p5',
    name: 'Local CSR Partners',
    type: 'CSR',
    contribution: 'Material donations and logistics support',
  },
];
