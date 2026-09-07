import type { CSSProperties } from 'react'

export interface CharacterCreator {
  name: string
  avatar?: string
  subscribers?: string
  isFollowed?: boolean
  totalInteractions?: string
}

export interface CharacterStat {
  key: string
  label: string
  subLabel: string
  value: number
}

export interface CharacterEvent {
  id: string | number
  title: string
  location: string
  isUnlocked: boolean
  image: string
  chapter?: string
}

export interface Character {
  id: number | string
  name: string
  quote: string
  views: string
  messages: string
  image: string
  images?: string[]
  badge?: string
  creator?: CharacterCreator
  hashtags?: string[]
  updatedTime?: string
  storyIntroduction?: string
  stats?: CharacterStat[]
  events?: CharacterEvent[]
}

export interface CharacterCardProps {
  character?: Character
  onClick?: () => void
  style?: CSSProperties
  className?: string
  badge?: string
}

export interface CharacterSliderRowProps {
  title: string
  emoji?: string
  subtitle?: string
  characters: Character[]
  onCardClick?: (character: Character) => void
}

export interface CharacterDetailModalProps {
  isOpen: boolean
  character: Character | null
  onClose: () => void
  onStartChat?: (character: Character) => void
  onLoadGame?: (character: Character) => void
}

export interface SliderNavButtonProps {
  direction: 'left' | 'right'
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
  disabled?: boolean
}
