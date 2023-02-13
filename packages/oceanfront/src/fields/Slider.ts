import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  SetupContext,
  shallowRef,
  Teleport,
  triggerRef,
  watch,
  watchEffect,
} from 'vue'
import { OfFieldBase } from '../components/FieldBase'
import {
  BaseFieldProps,
  fieldRender,
  newFieldId,
  provideFieldContext,
  provideFieldRender,
} from '../lib/fields'
import { watchPosition } from '../lib/util'

function intoInt(val?: string | number): number | undefined {
  if (typeof val === 'number') {
    return Math.round(val)
  }
  if (val != null) return parseInt(val, 10)
}

export const OfSliderField = defineComponent({
  name: 'OfSliderField',
  props: {
    ...BaseFieldProps,
    min: [String, Number],
    max: [String, Number],
    step: [String, Number],
  },
  setup(props, ctx: SetupContext) {
    const pendingValue = ref<number>(0)
    const stateValue = ref()
    const thumbClass = ref('of-slider-thumb')

    const fieldCtx = provideFieldContext(props, ctx)
    const initialValue = computed(() => {
      let initial = fieldCtx.initialValue
      if (initial === undefined) initial = props.defaultValue
      return initial ?? null
    })
    const opts = computed(() => {
      let min = intoInt(props.min) ?? 0
      let max = intoInt(props.max) ?? 100
      if (min > max) {
        const m = max
        max = min
        min = m
      }
      const delta = max - min
      const step = Math.max(0, Math.min(delta, intoInt(props.step) ?? 1))
      return { min, max, delta, step }
    })
    watch(
      () => fieldCtx?.value || null,
      (val) => {
        console.log(val)
        if (isNaN(val))
          val = opts.value.min + (opts.value.max - opts.value.min) / 2
        pendingValue.value = val
        stateValue.value = val
      },
      {
        immediate: true,
      }
    )

    const fixValue = (val: number) => {
      const { delta, step, min, max } = opts.value
      if (delta && step) {
        val = Math.round((val - min) / step) * step + min
      }
      val = Math.max(min, Math.min(max, val))
      return val
    }

    let defaultFieldId: string
    let lazyInputValue = pendingValue.value
    let startX = 0
    let startVal = 0
    const inputElt = shallowRef<HTMLInputElement | undefined>()
    const thumbElt = shallowRef<HTMLDivElement | undefined>()
    const labelElt = shallowRef<HTMLDivElement | undefined>()
    const trackElt = shallowRef<HTMLDivElement | undefined>()
    const trackProcessElt = shallowRef<HTMLDivElement | undefined>()
    const trackWidth = ref(0)
    const focused = ref(false)
    const focus = () => {
      inputElt.value?.focus()
    }
    const inputId = computed(() => {
      let id = fieldCtx.id
      if (!id) {
        if (!defaultFieldId) defaultFieldId = newFieldId()
        id = defaultFieldId
      }
      return id
    })
    const inputHooks = {
      onBlur(_evt: FocusEvent) {
        focused.value = false
      },
      onFocus(_evt: FocusEvent) {
        focused.value = true
      },
      onKeydown(evt: KeyboardEvent) {
        if (evt.key == 'ArrowUp' || evt.key == 'ArrowRight') {
          setValue(fixValue(pendingValue.value + opts.value.step))
        } else if (evt.key == 'ArrowDown' || evt.key == 'ArrowLeft') {
          setValue(fixValue(pendingValue.value - opts.value.step))
        } else if (evt.key == 'Escape') {
          pendingValue.value = stateValue.value
          cancelMove()
        }
      },
    }
    const thumbHooks = {
      onMousedown(evt: MouseEvent) {
        const elt = thumbElt.value
        if (!elt || !fieldCtx.editable) return
        evt.stopPropagation()
        evt.preventDefault()
        focus()
        startX = evt.pageX
        startVal = pendingValue.value
        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', stopMove)
        // snap to current step in case value was manually assigned
        handleMove(evt)
      },
    }
    const trackHooks = {
      onMousedown(evt: MouseEvent) {
        console.log('onMousedown 141')
        const tg = evt.target as HTMLDivElement | null
        if (!tg || !fieldCtx.editable) return
        const dims = tg.getBoundingClientRect()
        if (!dims.width) return
        evt.stopPropagation()
        evt.preventDefault()
        focus()
        startX = evt.pageX
        startVal = fixValue(
          ((startX - dims.left) * opts.value.delta) / dims.width +
            opts.value.min
        )
        pendingValue.value = startVal
        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', stopMove)
      },
    }

    const cancelMove = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', stopMove)
      thumbClass.value = 'of-slider-thumb'
    }
    const stopMove = () => {
      cancelMove()
      setValue(pendingValue.value)
    }
    const handleMove = (evt: MouseEvent) => {
      const tw = trackWidth.value
      const te = thumbElt.value
      const tpe = trackProcessElt.value

      console.log('handleMove')

      if (tw) {
        pendingValue.value = fixValue(
          startVal + ((evt.pageX - startX) * opts.value.delta) / tw
        )
        thumbClass.value = 'of-slider-thumb-moved'

        if (tpe && te) {
          let tpeWidth = Math.round(
            (tw / opts.value.delta) * pendingValue.value
          )
          if (pendingValue.value != 0) tpeWidth -= te.offsetWidth
          if (pendingValue.value == opts.value.delta) {
            tpeWidth += te.offsetWidth
          }

          tpe.style.width = tpeWidth.toString() + 'px'
        }
      }
    }
    const setValue = (val: number) => {
      lazyInputValue = val
      pendingValue.value = val
      stateValue.value = val
      if (inputElt.value) inputElt.value.value = '' + val
      if (fieldCtx.onUpdate) fieldCtx.onUpdate(val)
    }

    const trackPos = watchPosition({ immediate: true })
    watch(trackPos.positions, (entries) => {
      console.log('trackPos.positions')
      const first = entries.values().next().value
      trackWidth.value = Math.round(first?.width || 0)
    })
    watch(trackElt, (track) => {
      console.log('trackElt')
      trackPos.disconnect()
      if (track && trackProcessElt) {
        trackPos.observe(track)
      }
    })
    // position thumb
    watchEffect(() => {
      console.log('watchEffect')

      const { delta, min } = opts.value
      const tw = trackWidth.value
      const val = pendingValue.value
      const thumb = thumbElt.value
      const left = Math.round((((val - min) * tw) / delta) * 100) / 100 + 'px'

      if (thumb && delta && tw) {
        thumb.style.left = left
      }
    })

    const slots = {
      interactiveContent: () => {
        return h(
          'div',
          {
            class: 'of-slider',
            onVnodeMounted: () => {
              // watch is not triggered on first render
              nextTick(() => triggerRef(trackElt))
            },
            ...trackHooks,
          },
          [
            h('input', {
              id: inputId.value,
              name: fieldCtx.name,
              ref: inputElt,
              type: 'text',
              class: 'of-field-input',
              value: lazyInputValue,
              ...inputHooks,
            }),
            h(
              'div',
              {
                class: thumbClass.value,
                ref: thumbElt,
                ...thumbHooks,
              },
              h(
                'div',
                {
                  ref: labelElt,
                  class: 'of-slider-label-container',
                },
                stateValue.value
              )
            ),
            h(
              'div',
              {
                class: 'of-slider-track',
                ref: trackElt,
              },
              h('div', {
                class: 'of-slider-track-process',
                ref: trackProcessElt,
              })
            ),
          ]
        )
      },
    }
    const fRender = fieldRender({
      class: 'of-slider-field',
      focus,
      focused,
      pendingValue,
      updated: computed(() => initialValue.value !== stateValue.value),
      value: stateValue,
    })
    provideFieldRender(fRender)

    return () => {
      return h(OfFieldBase, props, { ...slots, ...ctx.slots })
    }
  },
})
