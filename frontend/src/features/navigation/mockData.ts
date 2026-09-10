import { 
  Home, 
  Compass, 
  Crown, 
  MessageCircle, 
  Heart,
  Tag,
  Sparkles
} from 'lucide-react'
import type { SidebarMenuItem, FollowedCreator } from './types'

export const SIDEBAR_MENU: SidebarMenuItem[] = [
  { id: 'home', label: 'บ้าน', icon: Home },
  { id: 'world-creator', label: 'สร้างโลก & AI', icon: Sparkles },
  { id: 'quests', label: 'เควสต์', icon: Compass },
  { id: 'ranking', label: 'อันดับ', icon: Crown },
  { id: 'chats', label: 'แชทของฉัน', icon: MessageCircle },
  { id: 'favorites', label: 'รายการโปรด', icon: Heart },
  { id: 'pricing', label: 'ราคา', icon: Tag },
]

export const FOLLOWED_CREATORS: FollowedCreator[] = [
  {
    id: 'creator-1',
    name: 'Morosta',
    avatar: '',
    handle: '@morosta',
    charactersCount: 12,
    hasNewBot: true,
  },
  {
    id: 'creator-2',
    name: 'Nari Official',
    avatar: '',
    handle: '@nariofficial',
    charactersCount: 8,
    hasNewBot: true,
  },
  {
    id: 'creator-3',
    name: 'Webtoon Master',
    avatar: '',
    handle: '@webtoonmaster',
    charactersCount: 15,
    hasNewBot: true,
  },
  {
    id: 'creator-4',
    name: 'Studio Moonlight',
    avatar: '',
    handle: '@moonlight',
    charactersCount: 6,
    hasNewBot: false,
  },
  {
    id: 'creator-5',
    name: 'K-Novel AI',
    avatar: '',
    handle: '@knovel_ai',
    charactersCount: 9,
    hasNewBot: true,
  },
  {
    id: 'creator-6',
    name: 'CyberValkyrie',
    avatar: '',
    handle: '@cybervalkyrie',
    charactersCount: 14,
    hasNewBot: true,
  },
  {
    id: 'creator-7',
    name: 'SweetHeart Studio',
    avatar: '',
    handle: '@sweetheart',
    charactersCount: 11,
    hasNewBot: true,
  },
  {
    id: 'creator-8',
    name: 'DarkRomance Lab',
    avatar: '',
    handle: '@darkromance',
    charactersCount: 7,
    hasNewBot: false,
  },
  {
    id: 'creator-9',
    name: 'AnimeVerse',
    avatar: '',
    handle: '@animeverse',
    charactersCount: 5,
    hasNewBot: true,
  },
  {
    id: 'creator-10',
    name: 'NekoTales',
    avatar: '',
    handle: '@nekotales',
    charactersCount: 18,
    hasNewBot: false,
  },
]
