<template>
  <div
    role="menu"
    class="of-menu options"
    :class="menuClass"
    :style="menuStyle"
  >
    <div class="search-row">
      <of-field
        type="text"
        v-model="searchText"
        ref="searchField"
        @input="onSearchInput"
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
              @click="() => item.disabled || onClick(item.value, item)"
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
import { defineComponent, computed, PropType, ref, Ref } from 'vue'
import { OfNavGroup } from '../components/NavGroup'
import { OfListItem } from '../components/ListItem'
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
    const isEmpty = computed(() => !props.items || !props.items.length)
    const theItems = computed(() => props.items as any[])
    const menuClass = computed(() => props.class)
    const menuStyle = computed(() => props.style)

    const searchField = ref<HTMLElement | null>(null)
    const searchText: Ref<string> = ref('')
    const searchNotEmpty = computed(() => searchText.value !== '')

    const onSearchInput = (_: never, value: string) => {
      console.log(value)
      searchText.value = value
    }

    const clearSearch = () => {
      searchText.value = ''
    }

    return {
      isEmpty,
      theItems,
      menuClass,
      menuStyle,

      searchField,
      searchText,
      onSearchInput,
      searchNotEmpty,
      clearSearch,
    }
  },
})

export default OfOptionList
</script>
