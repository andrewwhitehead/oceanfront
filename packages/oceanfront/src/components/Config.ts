import { defineComponent, PropType } from 'vue'
import { extendConfig } from '../lib/config'
import { registerIconSet, IconSet } from '../lib/icons'
import { useLayout } from '../lib/layout'
import {
  setLocale,
  setDateTimeFormat,
  useLocale,
  LocaleDateTimeFormat,
} from '../lib/locale'
import { FormRecord, setCurrentRecord } from '../lib/records'

export const OfConfig = defineComponent({
  name: 'OfConfig',
  inheritAttrs: false,
  props: {
    icons: Object as PropType<IconSet>,
    locale: String,
    dateTimeFormat: Object as PropType<LocaleDateTimeFormat>,
    record: Object as PropType<FormRecord>,
    theme: [String, Object],
  },
  setup(props, ctx) {
    extendConfig(() => {
      if (props.icons) registerIconSet(props.icons)
      if (props.locale) setLocale(props.locale)
      if (props.dateTimeFormat) setDateTimeFormat(props.dateTimeFormat)
      if (props.record !== undefined) {
        setCurrentRecord(props.record)
      }
    })
    const layoutMgr = useLayout()
    const localeMgr = useLocale()
    return () => {
      const cfgProps: Record<string, any> = {
        locale: localeMgr.locale,
        isMobile: layoutMgr.isMobile,
      }
      return ctx.slots.default && ctx.slots.default(cfgProps)
    }
  },
})
