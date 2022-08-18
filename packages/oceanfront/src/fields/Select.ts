import { computed, defineComponent, h, ref, watch } from 'vue'
import { OfFieldBase } from '../components/FieldBase'
import { OfIcon } from '../components/Icon'
import OfOptionList from '../components/OptionList.vue'
import OfBadge from '../components/Badge.vue'
import { OfButton } from '../components/Button'
import { useConfig } from '../lib/config'

import {
  BaseFieldProps,
  fieldRender,
  makeFieldContext,
  newFieldId,
  provideFieldRender,
} from '../lib/fields'
import { useItems } from '../lib/items'
import { useLanguage } from 'src/lib/language'

type ActiveItem = { text?: string; [key: string]: any }

export const OfSelectField = defineComponent({
  name: 'OfSelectField',
  props: {
    ...BaseFieldProps,
    multi: Boolean,
    addRemove: Boolean,
  },
  setup(props, ctx) {
    const lang = useLanguage()
    const config = useConfig()
    const itemMgr = useItems(config)
    const fieldCtx = makeFieldContext(props, ctx)

    const initialValue = computed(() => {
      let initial = fieldCtx.initialValue
      if (initial === undefined) initial = props.defaultValue
      return initial ?? null
    })

    const searchText = ref()
    const inputValue = ref()
    const pendingValue = ref() // store selected but unconfirmed value
    const stateValue = ref()
    const removing = ref(false)

    watch(
      () => fieldCtx.value,
      (val) => {
        if (val === undefined || val === '') val = null
        inputValue.value = val
        stateValue.value = val
        pendingValue.value = undefined
      },
      {
        immediate: true,
      }
    )

    const elt = ref<HTMLElement | undefined>()
    const focused = ref(false)
    let defaultFieldId: string
    const inputId = computed(() => {
      let id = fieldCtx.id
      if (!id) {
        if (!defaultFieldId) defaultFieldId = newFieldId()
        id = defaultFieldId
      }
      return id
    })
    const opened = ref(false)
    const items = computed(() => {
      const result = {
        disabledKey: 'disabled',
        items: [],
        specialKey: 'special',
        textKey: 'text',
        selectedTextKey: 'selectedText',
        valueKey: 'value',
        iconKey: 'icon',
      }
      let items
      if (props.name && props.record) {
        items = props.record.metadata[props.name]?.items
      }
      if (!items) items = props.items
      const list = itemMgr.getItemList(items)
      if (list) {
        Object.assign(result, list)
      }
      return result
    })

    const itemForValue = (value: any) => {
      const resolved = items.value
      let cmpVal
      let found: { idx?: number; item?: ActiveItem } = {}
      let idx = 0
      for (const item of resolved.items) {
        if (typeof item === 'string') {
          cmpVal = item
        } else if (typeof item === 'object') {
          if (item[resolved.specialKey]) {
            idx++
            continue
          }
          cmpVal = (item as any)[resolved.valueKey]
        }
        if (cmpVal === '') cmpVal = null
        if (cmpVal === value) {
          if (typeof item === 'string') {
            found = { idx, item: { value: item, text: item } }
          } else {
            found = { idx, item }
          }
          break
        }
        idx++
      }
      return found
    }

    const isSelected = (item: any): boolean => {
      if (!props.multi) return inputValue.value === item
      const values = Array.isArray(inputValue.value) ? inputValue.value : []
      return !!~values.indexOf(item)
    }

    const formatItems = computed(() => {
      const resolved = items.value
      const rows = []
      for (const item of resolved.items) {
        if (typeof item === 'string') {
          rows.push({
            disabled: false,
            text: item,
            selected: isSelected(item),
            value: item,
          })
        } else if (typeof item === 'object') {
          rows.push({
            disabled: item[resolved.disabledKey],
            text: item[resolved.textKey],
            selectedText: item[resolved.selectedTextKey],
            value: item[resolved.valueKey],
            selected: isSelected(item[resolved.valueKey]),
            special: item[resolved.specialKey],
            icon: item[resolved.iconKey] ?? '',
          })
        }
      }
      return rows
    })

    const filteredItems = computed(() => {
      if (!props.multi || !props.addRemove) return formatItems.value
      const values = Array.isArray(inputValue.value) ? inputValue.value : []
      const removingItems = removing.value
      return formatItems.value.filter((item) => {
        return item.special || removingItems == !!~values.indexOf(item.value)
      })
    })

    let closing: number | null = null
    const clickOpen = (_evt?: MouseEvent) => {
      if (opened.value) {
        closePopup()
      } else if (fieldCtx.editable && !closing) {
        opened.value = true
      }
      return false
    }
    const closePopup = (refocus?: boolean) => {
      if (opened.value) {
        opened.value = false
        if (closing) clearTimeout(closing)
        closing = window.setTimeout(() => {
          closing = null
        }, 150)
        if (refocus) focus()
        removing.value = false
      }
    }
    const focus = () => {
      const curelt = elt.value
      if (curelt) curelt.focus()
    }

    const toggleValue = (val: any): any => {
      if (!props.multi) return val
      if (!Array.isArray(inputValue.value)) {
        return [val]
      }
      let found = false
      const filtered = inputValue.value.filter((item) => {
        if (item === val) {
          found = true
          return false
        }
        return true
      })
      if (!found) {
        filtered.push(val)
      }
      return filtered
    }
    const setValue = (
      val: any,
      _item?: any,
      ev?: MouseEvent | KeyboardEvent
    ) => {
      ev?.stopPropagation()
      ev?.preventDefault()
      const newValue = toggleValue(val)
      inputValue.value = newValue
      fieldCtx.onUpdate?.(newValue)
      if (!props.multi || !ev?.shiftKey) {
        closePopup(true)
      }
    }

    const selectedItemText = () => {
      const activeItem = itemForValue(inputValue.value)
      return activeItem.item?.selectedText || activeItem.item?.text || ''
    }

    const itemText = (value: any) => {
      const item = itemForValue(value)
      return item.item?.selectedText || item.item?.text || ''
    }

    const renderBadges = () => {
      const values = Array.isArray(inputValue.value) ? inputValue.value : []
      return values.map((val) =>
        h(
          OfBadge,
          { status: 'primary', style: 'margin-bottom:0', compact: true },
          () => [
            itemText(val),
            fieldCtx.editable
              ? h(OfIcon, {
                  name: 'cancel',
                  size: 14,
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    setValue(val)
                  },
                })
              : undefined,
          ]
        )
      )
    }

    const toggleMode = () => {
      removing.value = !removing.value
    }

    const addRemoveButtons = () => {
      if (!props.addRemove) return undefined
      return h(
        'div',
        {
          style:
            'padding: 4px; display: flex; flex-direction: column; align-items: center',
        },
        h('div', { class: 'of-buttonset' }, [
          h(
            OfButton,
            {
              variant: 'outlined',
              active: !removing.value,
              onClick: toggleMode,
            },
            () => lang.value.selectFieldAddItems
          ),
          h(
            OfButton,
            {
              variant: 'outlined',
              active: removing.value,
              onClick: toggleMode,
            },
            () => lang.value.selectFieldRemoveItems
          ),
        ])
      )
    }

    const hooks = {
      onBlur(_evt: FocusEvent) {
        focused.value = false
      },
      onFocus(_evt: FocusEvent) {
        focused.value = true
        searchText.value = ''
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
      append: () => {
        if (fieldCtx.editable || fieldCtx.mode === 'locked')
          return h(OfIcon, {
            class: 'of-select-icon',
            name: opened.value ? 'bullet up' : 'bullet down',
            size: 'input',
          })
      },
      interactiveContent: () => {
        const labels = props.multi ? renderBadges() : selectedItemText()

        return [
          h(
            'div',
            {
              class: [
                'of-field-content-text',
                'of--align-' + (props.align || 'start'),
              ],
              id: inputId.value,
              ref: elt,
              tabindex: fieldCtx.mode === 'fixed' ? -1 : 0,
              ...hooks,
            },
            labels
          ),
        ]
      },
    }

    const fRender = fieldRender({
      blank: computed(() => {
        if (props.multi)
          return !Array.isArray(inputValue.value) || !inputValue.value.length
        const activeItem = itemForValue(inputValue.value)
        if (!activeItem.item) return true
        const val = inputValue.value
        return val === undefined || val === null || val === ''
      }),
      class: 'of-select-field',
      click: clickOpen,
      cursor: computed(() => (fieldCtx.editable ? 'pointer' : null)),
      focus,
      focused,
      inputId,
      inputValue,
      pendingValue,
      popup: {
        content: () =>
          opened.value
            ? h(
                OfOptionList,
                {
                  items: filteredItems.value,
                  class: 'of--elevated-1',
                  onClick: setValue,
                  addSearch: true,
                },
                { header: () => addRemoveButtons() }
              )
            : undefined,
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
