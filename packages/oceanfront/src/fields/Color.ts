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
    const renderPopup = () => {
      const color = compColor.value
      const hsv = color.hsv
      return h(
        'div',
        {
          class: 'of-menu of-colorpicker-popup of--elevated-1',
          tabindex: '0',
        },
        h('div', { class: 'color-picker' }, [
          h(Saturation, {
            saturation: hsv.s,
            hue: hsv.h,
            value: hsv.v,
            onChange: (s: number, v: number) => setHsv({ ...hsv, s, v }),
          }),
          h(Hue, {
            hue: hsv.h,
            onChange: (h: number) => setHsv({ ...hsv, h }),
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
        if (evt.key == ' ' || evt.key == 'ArrowUp' || evt.key == 'ArrowDown') {
          clickOpen()
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
