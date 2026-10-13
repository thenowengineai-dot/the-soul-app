import type { SandboxTelemetry } from '../types'

export type CartridgeId = 'card1' | 'card2' | 'card3' | string

export interface BaseCartridgeCardProps {
  isActive: boolean
  onActivate: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

export interface BaseHudLensProps {
  telemetry?: SandboxTelemetry | null
  visibleRows?: Record<string, boolean>
}

export interface CartridgeMetadata {
  id: CartridgeId
  name: string
  subtitle: string
  accentColor: string
  dotColorClass: string
}
