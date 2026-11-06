export type StudioActiveView =
  | { type: 'welcome' }
  | { type: 'master' }
  | { type: 'spark' }
  | { type: 'note'; noteId: string }
  | { type: 'cell'; cellId: string }
  | { type: 'cabinet' }
