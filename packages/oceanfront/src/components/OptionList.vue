<template>
  <div
    role="menu"
    class="of-menu options"
    :class="menuClass"
    :style="menuStyle"
    @keydown="onKeyPress"
  >
    <div class="search-row" v-if="showSearch">
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
        <div class="of-list-outer">
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
    class: [Object, String],
    style: [Object, String],
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    onClick: { type: Function, required: true },
  },
  setup(props) {
    const isEmpty = computed(() => !theItems.value || !theItems.value.length)
    const theItems = ref(props.items as any[])
    const menuClass = computed(() => props.class)
    const menuStyle = computed(() => props.style)

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

    watch(
      () => props.items,
      (value) => {
        theItems.value = value
      }
    )

    watch(searchText, () => {
      if (searchText.value.trim() === '') theItems.value = props.items
      console.log(searchText.value)
      theItems.value = props.items.filter((item) => {
        if (item.value !== undefined) {
          const optionText: string = item.text
          return optionText
            .toLowerCase()
            .includes(searchText.value.toLowerCase())
        }
      })
    })

    const clearSearch = () => {
      searchText.value = ''
    }

    const onKeyPress = (evt: KeyboardEvent) => {
      let consumed = false

      if (evt.key === 'Escape') {
        if (searchText.value !== '') {
          consumed = true
          searchText.value = ''
        }
      } else if (
        (/(^Key([A-Z]$))/.test(evt.code) ||
          /(^Digit([0-9]$))/.test(evt.code)) &&
        !evt.altKey &&
        !evt.metaKey &&
        !evt.ctrlKey
      ) {
        if (!showSearch.value && props.items?.length > 0) {
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

    const click = (value: any, item: any): any => {
      if (props.onClick) props.onClick(value, item)
      showSearch.value = false
      searchText.value = ''
    }

    return {
      isEmpty,
      theItems,
      menuClass,
      menuStyle,
      click,

      searchField,
      searchText,
      onSearchInput,
      searchNotEmpty,
      clearSearch,
      showSearch,
      onKeyPress,
    }
  },
})

export default OfOptionList
</script>
