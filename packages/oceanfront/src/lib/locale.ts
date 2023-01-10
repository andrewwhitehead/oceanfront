import { Config, ConfigManager } from './config'
import { readonlyUnref } from './util'

export interface LocaleNumberFormat {
  readonly groupSeparator: string
  readonly decimalSeparator: string
  readonly auto: boolean
}

export type LocaleDateTimeFormat = {
  dateFormat?: string
  timeFormat?: string
  timeZone?: string
}

export type LocaleParams = { [key: string]: any }

export interface LocaleState {
  readonly locale: string
  readonly numberFormat?: LocaleNumberFormat
  readonly dateTimeFormat?: LocaleDateTimeFormat
  readonly localeParams?: LocaleParams
}

class LocaleManager implements LocaleState {
  locale: string
  numberFormat?: LocaleNumberFormat
  dateTimeFormat?: LocaleDateTimeFormat
  localeParams?: LocaleParams

  constructor() {
    this.locale = navigator.language
  }
}

const configManager = new ConfigManager('ofloc', LocaleManager)

export function setLocale(loc: string): void {
  configManager.extendingManager.locale = loc
}

export function setDateTimeFormat(options: LocaleDateTimeFormat): void {
  configManager.extendingManager.dateTimeFormat = options
}

export function setNumberFormat(options: LocaleNumberFormat): void {
  configManager.extendingManager.numberFormat = options
}

export function setLocaleParams(params: LocaleParams): void {
  configManager.extendingManager.localeParams = params
}

export function useLocale(config?: Config): LocaleState {
  const mgr = configManager.inject(config)
  return readonlyUnref(mgr)
}
