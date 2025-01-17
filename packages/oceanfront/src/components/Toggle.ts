import { computed, defineComponent, h, ref, SetupContext, PropType } from 'vue'
import { FieldContext, FieldRender } from '../lib/fields'
import { FieldRecord, useRecords } from '../lib/records'
import { extractRefs, readonlyUnrefs } from '../lib/util'
import { useFormats } from '../lib/formats'

export const OfToggle = defineComponent({
  name: 'OfToggle',
  props: {
    checked: { type: Boolean, default: false },
    id: String,
    initialValue: { type: Boolean, default: undefined },
    inputType: String,
    label: String,
    loading: Boolean,
    locked: { type: Boolean, default: false },
    mode: String as PropType<'edit' | 'readonly' | 'view'>,
    muted: Boolean,
    name: String,
    readonly: { type: Boolean, default: false },
    record: Object as PropType<FieldRecord>,
    required: Boolean,
    switch: Boolean,
    value: String,
  },
  emits: {
    'update:checked': null,
  },
  setup(props, ctx: SetupContext) {
    const formatMgr = useFormats()
    const recordMgr = useRecords()
    const record = computed(() => {
      return props.record || recordMgr.getCurrentRecord()
    })
    const initialValue = computed(() =>
      props.name && record.value
        ? (record.value.initialValue || {})[props.name]
        : props.initialValue
    )
    const value = computed(() =>
      props.name && record.value
        ? record.value.value[props.name]
        : props.checked
    )
    const mode = computed(
      () => props.mode || (props.readonly ? 'readonly' : 'edit')
    )
    const locked = computed(() => props.locked || record.value?.locked)
    const focused = ref(false)

    const fctx: FieldContext = readonlyUnrefs({
      container: 'of-field',
      fieldType: 'toggle',
      initialValue,
      locked,
      mode,
      record,
      value,
      onUpdate(value: any) {
        if (props.name && record.value) record.value.value[props.name] = value
        else ctx.emit('update:checked', value)
      },
      /*...extractRefs(props, [
        'id',
        'label',
        'loading',
        'muted',
        'name',
        'required',
      ]),*/
    } as Record<string, any>)

    const rendered = computed<FieldRender>(() => {
      const found = formatMgr.getFieldType('toggle', true)
      if (!found) {
        throw new TypeError(`Unknown field type: toggle`)
      }
      return found.setup(
        {
          inputType: props.inputType || (props.switch ? 'switch' : 'checkbox'),
        },
        fctx
      )
    })

    const handlers = {
      onBlur(_evt: FocusEvent) {
        focused.value = false
      },
      onClick(evt: MouseEvent) {
        const render = rendered.value
        evt.stopPropagation()
        if (render && render.click) return render.click(evt)
      },
      onFocus(_evt: FocusEvent) {
        focused.value = true
      },
    }

    return () => {
      const render = rendered.value
      const content = render.content?.()
      if (!content) return
      return h(
        'div',
        {
          class: [
            'of-toggle',
            {
              'of--active': true,
              // 'of--block': props.block,
              'of--blank': render.blank,
              'of--focused': focused.value,
              'of--invalid': render.invalid,
              'of--muted': props.muted,
              'of--loading': render.loading,
              'of--locked': locked.value,
              'of--updated': render.updated,
            },
            'of--cursor-' + (render.cursor || 'default'),
            render.class,
          ],
          tabIndex: -1,
          ...handlers,
        },
        content
      )
    }
  },
})
