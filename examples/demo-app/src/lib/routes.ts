export type Family = 'gruvbox' | 'everforest' | 'tokyo' | 'catppuccin' | 'rosepine' | 'nord' | 'graphite' | 'atelier'
export type Mode = 'light' | 'dark'
export type Voice = 'nerd' | 'neutral' | 'professional'
export type TypeSetting = 'mono' | 'readable'

export interface DemoMeta {
  path: string
  number: string
  title: string
  project: string
  theme: Family
  themeLabel: string
  voice: Voice
  type: TypeSetting
  texture: number
  density: number
  motion: number
  thesis: string
  own: string
  note: string
}

export const demos: DemoMeta[] = [
  {
    path: '/landing',
    number: '01',
    title: 'Landing',
    project: 'Ironwake',
    theme: 'everforest',
    themeLabel: 'Everforest',
    voice: 'professional',
    type: 'readable',
    texture: 3,
    density: 4,
    motion: 3,
    thesis: 'A passive listening field for the low sky.',
    own: 'An interactive sector atlas with a linear, keyboard-readable contact fallback.',
    note: 'Fictional counter-drone company. All readings and ranges are placeholder demo values.',
  },
  {
    path: '/dashboard',
    number: '02',
    title: 'Dashboard',
    project: 'Northline Net',
    theme: 'tokyo',
    themeLabel: 'Tokyo Night / Day',
    voice: 'professional',
    type: 'readable',
    texture: 2,
    density: 8,
    motion: 1,
    thesis: "A small ISP's state, without a wall of cards.",
    own: 'A fibre-ring schematic as the focal data object, plus a state simulator for empty, loading and error.',
    note: 'Fictional ISP. Subscriber counts, incidents and telemetry are placeholder data.',
  },
  {
    path: '/docs',
    number: '03',
    title: 'Docs',
    project: 'tidal',
    theme: 'catppuccin',
    themeLabel: 'Catppuccin',
    voice: 'neutral',
    type: 'readable',
    texture: 2,
    density: 4,
    motion: 1,
    thesis: 'Dotfiles that come back the way you left them.',
    own: 'A drift lab that stages local and remote edits, then shows the refusal and exit code 3.',
    note: 'Fictional CLI. Commands and outputs are illustrative placeholders.',
  },
  {
    path: '/store',
    number: '04',
    title: 'Store',
    project: 'Solder & Stem',
    theme: 'rosepine',
    themeLabel: 'Rose Pine',
    voice: 'neutral',
    type: 'readable',
    texture: 4,
    density: 5,
    motion: 2,
    thesis: 'Six boards, built one at a time.',
    own: 'A shape-first board index with scaled key layouts and a cart drawer with honest states.',
    note: 'Fictional one-person keyboard shop. Products, prices and stock are placeholders.',
  },
  {
    path: '/quiz',
    number: '05',
    title: 'Quiz',
    project: 'Which database are you?',
    theme: 'gruvbox',
    themeLabel: 'Gruvbox',
    voice: 'neutral',
    type: 'readable',
    texture: 4,
    density: 5,
    motion: 3,
    thesis: 'Eight choices, one data store.',
    own: 'A segmented history strip, centre-out result bars, and a share card built from the same tokens.',
    note: 'For fun. The result is a blunt scoring model, not a recommendation.',
  },
  {
    path: '/portfolio',
    number: '06',
    title: 'Portfolio',
    project: 'Mara Voss',
    theme: 'nord',
    themeLabel: 'Nord',
    voice: 'nerd',
    type: 'readable',
    texture: 7,
    density: 4,
    motion: 3,
    thesis: 'Kernel work, told through what actually shipped.',
    own: 'A dated patch timeline that keeps the reverted patch in the record, next to the trace.',
    note: 'Fictional kernel engineer. Employers, patch IDs and measurements are placeholders.',
  },
  {
    path: '/checkout',
    number: '07',
    title: 'Checkout',
    project: 'Fathom',
    theme: 'graphite',
    themeLabel: 'Graphite',
    voice: 'professional',
    type: 'readable',
    texture: 3,
    density: 5,
    motion: 1,
    thesis: 'One seat, twelve dollars, no surprise.',
    own: 'A perforated order docket that collects validation, decline, timeout and 3-D Secure stamps in place.',
    note: 'Fictional SaaS checkout. No payment is processed and no data leaves this page.',
  },
  {
    path: '/luxury',
    number: '08',
    title: 'Luxury',
    project: 'Aurelia',
    theme: 'atelier',
    themeLabel: 'Atelier',
    voice: 'professional',
    type: 'readable',
    texture: 3,
    density: 3,
    motion: 2,
    thesis: 'A watch, not a platform.',
    own: 'A three-layer watch reveal — case, dial, movement — with serif display and a paper grain.',
    note: 'Fictional watch brand. Model, movement and atelier copy are placeholders.',
  },
]

export const routeMeta = (pathname: string): DemoMeta | undefined => {
  const path = pathname.replace(/\/+$/, '') || '/'
  return demos.find((demo) => demo.path === path)
}
