<template>
  <div
    tabindex="-1"
    role="menu"
    class="of-menu options"
    :class="menuClass"
    :style="menuStyle"
    @keydown="onKeyPress"
  >
    <div class="search-row" v-if="showSearch && addSearch">
      <of-field
        type="text"
        v-model="searchText"
        @input="onSearchInput"
        ref="searchField"
        tabindex="0"
      >
        <template #prepend>
          <of-icon name="search" />
        </template>
        <template #append>
          <of-icon
            v-if="searchNotEmpty"
            name="cancel circle"
            style="cursor: pointer"
            size="input"
            @click="clearSearch"
          />
        </template>
      </of-field>
    </div>
    <of-nav-group>
      <div v-if="isEmpty" style="padding: 0 0.5em">No items</div>
      <template v-if="!isEmpty">
        <div class="of-list-outer" ref="listOuter">
          <template v-for="(item, idx) of theItems" :key="idx">
            <div class="of-list-header" v-if="item.special === 'header'">
              {{ item.text }}
            </div>
            <div class="of-list-divider" v-if="item.special === 'divider'" />
            <of-list-item
              v-if="!item.special"
              :active="item.selected"
              :disabled="item.disabled"
              @click="() => item.disabled || click(item.value, item)"
              @blur="onItemBlur"
              @focus="onItemFocus"
              :attrs="item.attrs"
            >
              <of-icon v-if="item.icon" :name="item.icon" size="input" />
              {{ item.text }}
            </of-list-item>
          </template>
        </div>
      </template>
    </of-nav-group>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  ref,
  Ref,
  nextTick,
  watch,
} from 'vue'
import { OfNavGroup } from '../components/NavGroup'
import { OfListItem } from '../components/ListItem'
import { throttle } from '../lib/util'

const OfOptionList = defineComponent({
  name: 'OfOptionList',
  components: {
    OfListItem,
    OfNavGroup,
  },
  props: {
    focus: { type: Boolean, default: false },
    class: [Object, String],
    style: [Object, String],
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    onClick: { type: Function, required: true },
    addSearch: { type: Boolean, default: false },
  },
  emits: ['blur'],
  setup(props, ctx) {
    const isEmpty = computed(() => !theItems.value || !theItems.value.length)
    const theItems = ref(props.items as any[])
    const menuClass = computed(() => props.class)
    const menuStyle = computed(() => props.style)
    const itemFocused: Ref<boolean> = ref(false)
    const listOuter = ref<any>(null)

    const searchField = ref<any>(null)
    const searchText: Ref<string> = ref('')
    const searchNotEmpty = computed(() => searchText.value !== '')
    const showSearch: Ref<boolean> = ref(false)

    const onSearchInput = (_: never, value: string) => {
      if (showSearch.value) search(value)
    }

    const search = throttle(300, (input: string) => {
      searchText.value = input.trim()
    })

    const scrollListTop = () => {
      window.setTimeout(() => {
        listOuter?.value?.scroll(0, 0)
      }, 200)
    }

    watch(
      () => props.items,
      (value) => {
        theItems.value = value
      }
    )

    watch(searchText, () => {
      if (searchText.value.trim() === '') theItems.value = props.items
      theItems.value = props.items.filter((item) => {
        if (item.special) return true
        if (item.value !== undefined) {
          const optionText: string = item.text
          return optionText
            .toLowerCase()
            .includes(searchText.value.trim().toLowerCase())
        }
      })
      //Remove empty special items
      theItems.value = theItems.value.filter((item, index) => {
        if (item.special) {
          const nextItem = theItems.value[index + 1] ?? null
          return nextItem && !nextItem.special
        } else {
          return true
        }
      })
      scrollListTop()
    })

    const clearSearch = () => {
      searchText.value = ''
    }

    watch(
      () => props.focus,
      (val) => {
        if (val) focusFirstItem()
      }
    )

    const onKeyPress = (evt: KeyboardEvent) => {
      let consumed = false

      if (evt.key === 'Escape') {
        if (showSearch.value && searchText.value !== '') {
          consumed = true
          searchText.value = ''
        } else {
          ctx.emit('blur')
        }
      } else if (
        ['ArrowUp', 'ArrowDown'].includes(evt.key) &&
        !itemFocused.value
      ) {
        focusFirstItem(true)
      } else if (
        (evt.key === 'Backspace' ||
          /(^Key([A-Z]$))/.test(evt.code) ||
          /(^Digit([0-9]$))/.test(evt.code)) &&
        !evt.altKey &&
        !evt.metaKey &&
        !evt.ctrlKey
      ) {
        if (props.addSearch && props.items?.length > 0) {
          showSearch.value = true
          nextTick(() => {
            focusSearch()
          })
        }
      }

      if (consumed) {
        evt.stopPropagation()
        evt.preventDefault()
      }
    }

    const focusSearch = () => {
      searchField?.value?.$el.querySelector('input')?.focus()
    }

    const onItemFocus = () => {
      itemFocused.value = true
    }

    const onItemBlur = () => {
      nextTick(() => {
        if (!itemFocused.value) blurList()
      })
      itemFocused.value = false
    }

    const blurList = () => {
      theItems.value.forEach((item) => {
        if (item.attrs?.hasOwnProperty('isFocused')) {
          item.attrs.isFocused = false
        }
      })
      ctx.emit('blur')
    }

    const click = (value: any, item: any): any => {
      if (props.onClick) props.onClick(value, item)
      showSearch.value = false
      searchText.value = ''
    }

    const focusFirstItem = (ignoreSelected = false) => {
      if (theItems.value.length == 0) return

      const selected = theItems.value.findIndex(
        (item) => item.selected && item.selected === true
      )

      if (!ignoreSelected && selected !== -1) {
        theItems.value[selected].attrs = {
          ...theItems.value[selected].attrs,
          ...{ isFocused: true },
        }
      } else {
        scrollListTop()

        theItems.value.some((item) => {
          if (!item.special) {
            item.attrs = { ...item.attrs, ...{ isFocused: true } }
            return true
          }
        })
      }
    }

    nextTick(() => {
      focusFirstItem()
    })

    return {
      isEmpty,
      theItems,
      menuClass,
      menuStyle,
      click,
      listOuter,

      searchField,
      searchText,
      onSearchInput,
      searchNotEmpty,
      clearSearch,
      showSearch,
      onKeyPress,

      onItemBlur,
      onItemFocus,
    }
  },
})

export default OfOptionList
</script>
