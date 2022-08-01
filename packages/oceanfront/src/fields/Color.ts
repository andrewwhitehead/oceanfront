import { computed, defineComponent, h, ref, watch } from 'vue'
import { OfFieldBase } from '../components/FieldBase'
import Hue from '../components/Hue'
import Saturation from '../components/Saturation'
import { hsvToHsl, hsvToRgb, loadColor, rgbToHex, rgbToHsv } from '../lib/color'
import {
  BaseFieldProps,
  fieldRender,
  FieldRender,
  makeFieldContext,
  newFieldId,
  provideFieldRender,
} from '../lib/fields'

export const OfColorField = defineComponent({
  name: 'OfColorField',
  class: 'of-color-field',
  props: BaseFieldProps,
  setup(props, ctx) {
    const fieldCtx = makeFieldContext(props, ctx)
    const opened = ref(false)
    const focused = ref(false)
    const saturationFocused = ref(false)
    const elt = ref<HTMLElement | undefined>()
    let defaultFieldId: string
    const inputId = computed(() => {
      let id = fieldCtx.id
      if (!id) {
        if (!defaultFieldId) defaultFieldId = newFieldId()
        id = defaultFieldId
      }
      return id
    })
    const focus = () => {
      elt.value?.focus()
    }
    const closePopup = (refocus?: boolean) => {
      opened.value = false
      if (refocus) focus()
    }
    const clickOpen = () => {
      if (fieldCtx.editable) opened.value = true
    }
    const togglePopup = () => {
      opened.value = !opened.value
    }
    const initialValue = computed(() => {
      let initial = fieldCtx.initialValue
      if (initial === undefined) initial = props.defaultValue
      return initial ?? null
    })
    const stateValue = ref()
    const compColor = computed(() => {
      const hsv = stateValue.value || { h: 0, s: 0, v: 0 }
      const rgb = hsvToRgb(hsv)
      const hsl = hsvToHsl(hsv)
      return {
        hsv,
        rgb: 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')',
        hsl:
          'hsl(' +
          hsl.h +
          ', ' +
          Math.round(hsl.s * 100) +
          '%, ' +
          Math.round(hsl.l * 100) +
          '%)',
        hex: rgbToHex(rgb),
      }
    })
    watch(
      () => fieldCtx.value,
      (val) => {
        try {
          const rgb = val ? loadColor(val) : null
          if (rgb) {
            if (!stateValue.value || compColor.value.hex != rgbToHex(rgb)) {
              // conditional to avoid clobbering the hue value
              stateValue.value = rgbToHsv(rgb as any)
            }
          }
        } catch (e) {
          // ignore invalid color
        }
      },
      {
        immediate: true,
      }
    )
    const setHsv = (color: { h: number; s: number; v: number; a?: number }) => {
      stateValue.value = color
      onChange(compColor.value.hex)
    }
    const onChange = (data: string): void => {
      if (stateValue.value && fieldCtx.onUpdate) fieldCtx.onUpdate(data)
    }

    const onSaturationBlur = () => {
      saturationFocused.value = false
    }

    const onSaturationFocus = () => {
      saturationFocused.value = true
    }

    const renderPopup = () => {
      const color = compColor.value
      const hsv = color.hsv
      return h(
        'div',
        {
          class: 'of-menu of-colorpicker-popup of--elevated-1',
        },
        h('div', { class: 'color-picker' }, [
          h(Saturation, {
            tabindex: saturationFocused.value ? '-1' : '0',
            saturation: hsv.s,
            hue: hsv.h,
            value: hsv.v,
            focus: saturationFocused.value,
            onChange: (s: number, v: number) => setHsv({ ...hsv, s, v }),
            onBlur: onSaturationBlur,
            onFocus: onSaturationFocus,
            onSelect: closePopup,
          }),
          h(Hue, {
            tabindex: !saturationFocused.value ? '-1' : '0',
            hue: hsv.h,
            onChange: (h: number) => setHsv({ ...hsv, h }),
            onBlur: focus,
            onSelect: closePopup,
          }),
          h('div', {}, color.hsl),
          h('div', {}, color.rgb),
        ])
      )
    }
    const hooks = {
      onBlur(_evt: FocusEvent) {
        focused.value = false
      },
      onFocus(_evt: FocusEvent) {
        focused.value = true
      },
      onKeydown(evt: KeyboardEvent) {
        let consumed = false
        if ([' ', 'ArrowUp', 'ArrowDown'].includes(evt.key)) {
          consumed = true
          togglePopup()
        } else if (evt.key == 'Tab' && opened.value) {
          consumed = true
          saturationFocused.value = true
        }
        if (consumed) {
          evt.preventDefault()
          evt.stopPropagation()
        }
      },
    }

    const slots = {
      interactiveContent: () =>
        h(
          'div',
          {
            class: [
              'of-field-content-text',
              'of--align-' + (props.align || 'start'),
            ],
            id: inputId.value,
            tabindex: 0,
            ref: elt,
            ...hooks,
          },
          [compColor.value.hex]
        ),
      prepend: () =>
        h(
          'div',
          {
            class: 'of-color-swatch',
            style: {
              backgroundColor: compColor.value.hex,
            },
          },
          h('div', { class: 'of-color-swatch-border' })
        ),
    }

    const fRender: FieldRender = fieldRender({
      class: 'of-color-field',
      focused,
      click: clickOpen,
      cursor: computed(() => (fieldCtx.editable ? 'pointer' : 'default')),
      inputId,
      popup: {
        content: () => (opened.value ? renderPopup() : undefined),
        visible: opened,
        onBlur: closePopup,
      },
      updated: computed(() => initialValue.value !== stateValue.value),
      value: stateValue,
    })
    provideFieldRender(fRender)
    const render = () => {
      return h(OfFieldBase, props, { ...slots, ...ctx.slots })
    }
    return render
  },
})
