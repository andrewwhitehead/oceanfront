import { Config, ConfigManager } from './config'
import { readonlyUnref } from './util'

export interface Icon {
  class?: string
  // component?: Component | string
  // props?: VNodeProps
  name?: string
  svg?: SvgIcon
  text?: string
}

export interface SvgIcon {
  paths: string[]
}

export interface IconMapping {
  [key: string]: Icon | string
}

export interface IconResolver {
  resolve(name: string): Icon | string | null
}

export interface IconFont {
  resolve(name: string): Icon | null
}

function makeResolver(mapping: IconMapping): IconResolver {
  return {
    resolve: (name: string) => (mapping && mapping[name]) || null,
  }
}

const uiiIcons = [
  'required',
  'accept',
  'cancel',
  'plus',
  'print',
  'search',
  'email',
  'mobile',
  'phone',
  'attach',
  'external',
  'user',
  'lock',
  'sign-in',
  'sign-out',
  'date',
  'time',
  'hourglass',
  'gear',
  'alt-menu',
  'menu',
  'ellipsis',
  'refresh',
  'expand-down',
  'expand-up',
  'expand',
  'expand-close',
  'checkbox',
  'checkbox checked',
  'radio',
  'radio checked',
  'star',
  'star checked',
  'circle-check',
  'circle-cross',
  'circle-ellipsis',
  'circle-help',
  'circle-error',
  'circle-info',
  'circle-plus',
  'circle-minus',
  'circle-divide',
  'circle-split',
  'circle-join',
  'circle-refresh',
  'circle-attach',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'previous',
  'next',
  'triangle-down',
  'triangle-up',
  'nav-top',
  'nav-first',
  'nav-previous',
  'nav-next',
  'nav-last',
]

const uiiAlias = {
  'bullet-select': 'triangle-down of-icon-scale-sm',
  'bullet-select-close': 'triangle-up of-icon-scale-sm',
}

const ledIcon = {
  svg: {
    paths: [
      'M 2 12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
      'M 4 12 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0',
    ],
  },
}

const uiiIconFont: IconFont = {
  resolve(name) {
    if (name in uiiAlias) {
      name = (uiiAlias as any)[name]
    } else if (!uiiIcons.includes(name)) {
      return null
    }
    return {
      class: 'uibasic-icon icon-' + name,
    }
  },
}

const materialIcons = {
  required: '*',
  accept: 'done',
  cancel: 'close',
  plus: 'add',
  print: 'print',
  search: 'search',
  email: 'mail_outline',
  mobile: 'smartphone',
  phone: 'phone',
  attach: 'attach_file',
  external: 'open_in_new',
  user: 'account_circle',
  lock: 'lock',
  'sign-in': '⎘',
  'sign-out': '⎗',
  date: 'calendar_today',
  time: 'access_time',
  hourglass: 'hourglass_empty',
  gear: 'settings',
  'alt-menu': 'more_vert',
  menu: 'menu',
  ellipsis: 'more_horiz',
  refresh: 'refresh',
  'expand-down': 'expand_more',
  'expand-up': 'expand_less',
  expand: 'unfold_more',
  'expand-close': 'unfold_less',
  checkbox: 'check_box_outline_blank',
  'checkbox checked': 'check_box',
  radio: 'radio_button_unchecked',
  'radio checked': 'radio_button_checked',
  star: 'star_border',
  'star checked': 'star',
  'circle-check': 'check_circle',
  'circle-cross': 'cancel',
  'circle-ellipsis': '⋯',
  'circle-help': 'help',
  'circle-error': 'error',
  'circle-info': 'info',
  'circle-plus': 'add_circle',
  'circle-minus': 'remove_circle',
  'circle-divide': '⨸',
  'circle-split': '',
  'circle-join': '',
  'circle-refresh': '🔃',
  'circle-attach': 'attach_file',
  'arrow-left': 'arrow_forward of-icon-flip-horiz',
  'arrow-right': 'arrow_forward',
  'arrow-up': 'arrow_upward',
  'arrow-down': 'arrow_downward',
  previous: 'arrow_left of-icon-scale-lg',
  next: 'arrow_right of-icon-scale-lg',
  'triangle-down': 'arrow_drop_down of-icon-scale-lg',
  'triangle-up': 'arrow_drop_up of-icon-scale-lg',
  'nav-top': 'vertical_align_top',
  'nav-first': 'first_page',
  'nav-previous': 'navigate_before',
  'nav-next': 'navigate_next',
  'nav-last': 'last_page',
  'bullet-select': 'arrow_drop_down',
  'bullet-select-close': 'arrow_drop_up',
}

const materialIconFont: IconFont = {
  resolve(name) {
    let icon = (materialIcons as any)[name]
    if (icon) {
      let cls = 'material-icons'
      const spp = icon.indexOf(' ')
      if (spp !== -1) {
        cls += icon.substring(spp)
        icon = icon.substring(0, spp)
      }
      return {
        class: cls,
        text: icon,
      }
    }
    return null
  },
}

class IconManager {
  defaultFont: string | undefined
  fonts: { [name: string]: IconFont }
  resolvers: IconResolver[]
  showMissing = false

  constructor() {
    this.defaultFont = 'mi'
    this.fonts = { uii: uiiIconFont, mi: materialIconFont }
    this.resolvers = [
      {
        resolve: (name: string) => {
          let ret = null
          if (this.defaultFont) {
            ret = this.fonts[this.defaultFont].resolve(name)
          }
          if (!ret && name.startsWith('led-')) {
            ret = { class: 'of--icon-led of--' + name, ...ledIcon }
          }
          return ret
        },
      },
    ]
  }

  resolve(name?: string): Icon | null {
    if (!name) return null
    const spp = name.indexOf(' ')
    if (spp !== -1) {
      const font = name.substring(0, spp)
      if (font in this.fonts) {
        return this.fonts[font].resolve(name.substring(spp + 1))
      }
    }
    for (const r of this.resolvers) {
      const ret = r.resolve(name)
      if (typeof ret === 'string') return this.resolve(ret)
      else if (ret) return ret
    }
    if (this.showMissing) {
      return { text: 'xx' }
    }
    return null
  }
}

const configManager = new ConfigManager('oficon', IconManager)

export function registerIconFont(name: string, def: IconFont): void {
  if (!def) return
  configManager.extendingManager.fonts[name] = def
}

export function registerIcons(icons: IconMapping | IconResolver): void {
  if (!icons) return
  if (typeof icons === 'object') {
    icons = makeResolver(icons as IconMapping)
  }
  configManager.extendingManager.resolvers.push(icons)
}

export function setDefaultIconFont(name: string): void {
  configManager.extendingManager.defaultFont = name
}

export function showMissingIcons(flag?: boolean): void {
  if (flag === undefined) flag = true
  configManager.extendingManager.showMissing = flag
}

export function useIcons(config?: Config): IconManager {
  const mgr = configManager.inject(config)
  return readonlyUnref(mgr)
}
