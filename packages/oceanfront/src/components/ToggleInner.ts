import { computed, defineComponent, h, VNode } from 'vue'
import { OfIcon } from './Icon'

export const ToggleInner = defineComponent({
  props: {
    switch: Boolean,
    checked: Boolean,
    label: String,
    inputId: String,
    align: String,
    name: String,
  },
  emits: ['focus', 'blur', 'inputMounted'],
  setup(props, ctx) {
    const icon = computed(() => {
      const checked = !!props.checked
      return 'checkbox' + (checked ? ' checked' : '')
    })
    const hooks = {
      onFocus() {
        ctx.emit('focus')
      },
      onBlur() {
        ctx.emit('blur')
      },
      onVnodeMounted(vnode: VNode) {
        ctx.emit('inputMounted', vnode)
      },
    }
    return () => {
      const inputLabel = props.label
      const label = inputLabel
        ? h(
            'label',
            {
              class: [
                'of-field-content-text',
                'of--align-' + (props.align || 'start'),
              ],
              for: props.inputId,
              onClick: (evt: MouseEvent) => evt.stopPropagation(),
            },
            [inputLabel]
          )
        : undefined
      const inner = [
        h('div', { class: 'of-toggle-input' }, [
          h('input', {
            class: 'of-field-input',
            checked: props.checked,
            id: props.inputId,
            // disabled: disabled.value,
            name: props.name,
            type: 'checkbox',
            value: '1',
            ...hooks,
          }),
          props.switch
            ? h('div', { class: 'of-switch' }, [
                h('div', { class: 'of-switch-track' }),
                h('div', { class: 'of-switch-thumb' }),
              ])
            : h(OfIcon, {
                class: 'of-toggle-icon',
                name: icon.value,
                size: 'input',
              }),
        ]),
      ]
      if (label) inner.push(label)
      return [
        h(
          'div',
          {
            class: 'of-toggle-wrapper',
          },
          inner
        ),
      ]
    }
  },
})
