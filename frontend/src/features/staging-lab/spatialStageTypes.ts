/**
 * Spatial Stage & Living Blueprint Contracts
 * สัญญาข้อมูลและประเภทตัวแปรสำหรับระบบผืนเวที แผนที่พิมพ์เขียว และพิกัดเชิงพื้นที่
 */

export type WorldEra = 'ancient' | 'contemporary' | 'cyber_noir'

export type WorldBiome = 'mountain_forest' | 'urban_city' | 'coastal_sea'

export type TimeOfDay = 'afternoon' | 'golden_hour' | 'twilight' | 'midnight'

export type WeatherCondition = 'clear' | 'foggy' | 'heavy_rain_storm' | 'snow'

export interface CoordinatePoint {
  x: number // เปอร์เซ็นต์พิกัด 0 - 100%
  y: number
}

export interface SpatialZone {
  id: string
  name: string
  type: 'indoor' | 'semi_outdoor' | 'outdoor'
  isRestricted?: boolean // โซนหวงห้าม (สีแดง) เช่น หอพักหญิง
  restrictionReason?: string
  bounds?: {
    x: number // เปอร์เซ็นต์
    y: number
    width: number
    height: number
  }
}

export type PropCategory = 'anchor' | 'tactile_item' | 'portal' | 'stair'

export type GlowAccentColor = 'amber' | 'white' | 'crimson' | 'cyan'

export interface SpatialProp {
  id: string
  name: string
  category: PropCategory
  coordinates: CoordinatePoint
  dimensionText?: string // เช่น "กว้าง 1.8 ม." หรือ "ขนาด 25 ซม."
  description: string
  glowColor?: GlowAccentColor
  targetFloor?: string // สำหรับบันได เช่น "2F"
  targetCellId?: string // สำหรับประตูเชื่อมห้อง
}

export interface StageCell {
  id: string
  name: string
  floorLevel: 'B1' | '1F' | '2F' | string
  blueprintImageUrl: string
  zones: SpatialZone[]
  props: SpatialProp[]
}

export interface StageCellCluster {
  clusterId: string
  name: string
  era: WorldEra
  biome: WorldBiome
  timeOfDay: TimeOfDay
  weather: WeatherCondition
  activeCellId: string
  cells: Record<string, StageCell>
  actorPins: {
    player: CoordinatePoint
    character: CoordinatePoint
  }
}

export interface LeanSpatialSnapshot {
  sceneName: string
  activeZoneName: string
  atmosphereSummary: string
  actorLocation: string
  playerLocation: string
  distanceMeters: number
  forbiddenBoundaryEncountered: boolean
  promptSnippet: string
}
