export type StudioActiveView =
  | { type: 'welcome' }
  | { type: 'master' }
  | { type: 'dashboard' }
  | { type: 'spark' }
  | { type: 'character'; characterId: string }
  | { type: 'note'; noteId: string }
  | { type: 'cell'; cellId: string }
  | { type: 'cabinet' }
