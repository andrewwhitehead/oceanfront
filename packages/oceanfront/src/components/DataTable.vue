<template>
  <div :class="tableClass" :style="columnsStyle" :id="outerId">
    <div class="of-data-table-header">
      <div v-if="rowsSelector" class="of-data-table-rows-selector">
        <slot name="header-rows-selector">
          <of-button
            variant="text"
            keep-text-color
            split
            :items="selectRowsItems"
          >
            <of-field
              type="toggle"
              variant="basic"
              class="row-selector"
              v-model="headerRowsSelectorChecked"
              :locked="selectLocked"
              @update:model-value="onUpdateHeaderRowsSelector"
            />
          </of-button>
        </slot>
        <slot name="header-first-cell" />
      </div>
      <div
        v-for="(col, idx) of columns"
        :class="[
          col.class,
          {
            sortable: col.sortable !== false,
            [sort.order]: sort.column === col.value,
          },
        ]"
        :key="idx"
      >
        <span
          v-if="col.sortable !== false"
          :id="createColId(idx)"
          :tabindex="col.sortable !== false ? '0' : undefined"
          @mouseenter="
            col.extra_sort_fields
              ? sortColEnter('#' + createColId(idx), col.extra_sort_fields)
              : null
          "
          @mouseleave="col.extra_sort_fields ? sortColLeave() : null"
          @click="onSort(col.value)"
          @keydown.enter.prevent="onSort(col.value)"
        >
          {{ col.text }}
          <of-icon
            :name="
              sort.order == RowSortOrders.desc && sort.column == col.value
                ? 'bullet down'
                : 'bullet up'
            "
          />
        </span>
        <div v-else>
          {{ col.text }}
        </div>
      </div>
    </div>
    <div
      class="of-data-table-row"
      v-for="(row, rowidx) of rows"
      :key="rowidx"
      :class="{ selected: rowsRecord.value[row.id], odd: rowidx % 2 != 0 }"
    >
      <div v-if="rowsSelector">
        <slot name="rows-selector" :record="rowsRecord" :item="row">
          <of-field
            type="toggle"
            variant="basic"
            class="row-selector"
            :locked="selectLocked"
            :record="selectLocked ? undefined : rowsRecord"
            :model-value="selectLocked ? true : rowsRecord.value[row.id]"
            :name="row.id"
          />
        </slot>
        <slot name="first-cell" :record="rowsRecord" :item="row" />
      </div>
      <div v-for="(col, colidx) of columns" :class="col.class" :key="colidx">
        <of-data-type :value="row[col.value]"></of-data-type>
      </div>
    </div>
    <template v-if="footerRows.length">
      <div
        class="of-data-table-footer"
        v-for="(row, rowidx) of footerRows"
        :key="rowidx"
      >
        <div :class="{ first: rowidx == 0 }" v-if="rowsSelector">&nbsp;</div>
        <div
          v-for="(col, colidx) of columns"
          :class="[col.class, rowidx == 0 ? 'first' : undefined]"
          :key="colidx"
        >
          <of-format :type="col.format" :value="row[col.value]" />
        </div>
      </div>
    </template>
    <of-overlay
      :active="sortPopupOpened"
      :capture="false"
      :shade="false"
      :target="sortPopupTarget"
    >
      <of-option-list
        @mouseenter="sortPopupEnter()"
        @mouseleave="sortPopupLeave()"
        @click="onSort"
        class="of-extra-sort-popup of--elevated-1"
        :items="selectedColFields"
      />
    </of-overlay>
  </div>
</template>

<script lang="ts">
import { FormRecord, makeRecord } from '../lib/records'
import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType,
  SetupContext,
  ComputedRef,
  Ref,
} from 'vue'
import { DataTableHeader } from '../lib/datatable'
import { useThemeOptions } from '../lib/theme'

enum RowsSelectorValues {
  Page = 'page',
  All = 'all',
  DeselectAll = 'deselect-all',
}

enum RowSortOrders {
  asc = 'asc',
  desc = 'desc',
  noOrder = '',
}

interface ExtraSortField {
  label: string
  value: string
  order?: string
}

const showSelector = (hasSelector: boolean, rows: any[]): boolean => {
  let issetId = false
  if (rows && rows.hasOwnProperty(0) && rows[0].hasOwnProperty('id')) {
    issetId = true
  }
  return (hasSelector && issetId) ?? false
}

let sysDataTableIndex = 0

export default defineComponent({
  name: 'OfDataTable',
  // components: { OfFormat },
  props: {
    footerItems: { type: Array as PropType<any[]>, default: () => [] },
    headers: { type: Array, default: () => [] } as any as object &
      PropType<DataTableHeader[]>,
    items: { type: Array, default: () => [] } as any as object &
      PropType<Record<string, any>>,
    itemsCount: [String, Number],
    itemsPerPage: [String, Number],
    page: [String, Number],
    rowsSelector: Boolean,
    resetSelection: Boolean,
    selectAll: Boolean,
    density: [String, Number],
  },
  emits: {
    'rows-selected': null,
    'rows-select-all': null,
    'rows-select-page': null,
    'rows-deselect-all': null,
    'rows-sorted': null,
  },
  setup(props, ctx: SetupContext) {
    const themeOptions = useThemeOptions()
    const sort = ref({ column: '', order: '' })

    const outerId = computed(() => {
      return 'of-data-table-' + ++sysDataTableIndex
    })

    const sortPopupCloseTimerId = ref()
    const sortPopupOpenTimerId = ref()
    const sortPopupChangeTimerId = ref()
    const sortPopupOpened = ref(false)
    const sortPopupTarget = ref('')
    const selectedColFields: Ref<Object[]> = ref([])
    const selectLocked = ref(false)

    const createColId = (idx: number) => outerId.value + '-header-' + idx

    const sortColLeave = () => {
      clearTimeout(sortPopupChangeTimerId.value)
      clearTimeout(sortPopupOpenTimerId.value)
      if (sortPopupOpened.value !== true) return
      sortPopupCloseTimerId.value = window.setTimeout(() => {
        closeSortPopup()
      }, 500)
    }

    const sortColEnter = (
      target: string,
      extraSortFields: ExtraSortField[]
    ) => {
      clearTimeout(sortPopupCloseTimerId.value)
      sortPopupChangeTimerId.value = window.setTimeout(
        () => {
          setSelectedColFields(extraSortFields)
          sortPopupTarget.value = target
        },
        sortPopupOpened.value ? 500 : 0
      )
      if (sortPopupOpened.value !== true) {
        clearTimeout(sortPopupOpenTimerId.value)
        sortPopupOpenTimerId.value = window.setTimeout(() => {
          openSortPopup()
        }, 500)
      }
    }

    const setSelectedColFields = (extraSortFields: ExtraSortField[]) => {
      selectedColFields.value = []
      for (const field of extraSortFields) {
        const item = {
          value: field.value,
          text: field.label,
        }
        const itemAsc = {
          icon: 'bullet up',
          selected:
            sort.value.column === field.value &&
            sort.value.order === RowSortOrders.asc,
          order: RowSortOrders.asc,
        }
        const itemDesc = {
          icon: 'bullet down',
          selected:
            sort.value.column === field.value &&
            sort.value.order === RowSortOrders.desc,
          order: RowSortOrders.desc,
        }
        selectedColFields.value.push({ ...itemDesc, ...item })
        selectedColFields.value.push({ ...itemAsc, ...item })
      }
    }

    const sortPopupEnter = () => {
      clearTimeout(sortPopupCloseTimerId.value)
    }
    const sortPopupLeave = () => {
      sortColLeave()
    }
    const openSortPopup = () => {
      sortPopupOpened.value = true
    }
    const closeSortPopup = () => {
      sortPopupOpened.value = false
    }

    const columns = computed(() => {
      const cols: any[] = []
      for (const hdr of props.headers as DataTableHeader[]) {
        const align = hdr.align
        const cls = ['of--align-' + (align || 'start'), hdr.class]
        if (typeof hdr.sort === 'string') {
          setSort(hdr.value, hdr.sort)
        }
        cols.push(Object.assign({}, hdr, { align, class: cls }))
      }
      return cols
    })
    const perPage = computed(
      () => parseInt(props.itemsPerPage as any, 10) || 10
    )
    const page = ref(0)
    // What was this?
    /*
    const pageCount = computed(() => {
      let count = parseInt(props.itemsCount ?? props.items?.length, 10) || 0
      return Math.ceil(count / perPage.value)
    })
    */
    watch(
      () => props.page,
      (p) => (page.value = parseInt(p as string, 10) || 1), // FIXME check in range
      { immediate: true }
    )
    const iterStart = computed(() => {
      if (props.itemsCount != null) return 0 // external navigation
      return Math.max(0, perPage.value * (page.value - 1))
    })
    const columnsStyle = computed(() => {
      const selectorWidth = showSelector(props.rowsSelector, rows.value)
        ? 'min-content'
        : ''
      const widths = props.headers
        ?.map((h) => {
          if (!h.width) return 'auto'
          const w = h.width.toString()
          if (w.endsWith('%') || w.match(/^[0-9]+(\.[0-9]*)?$/)) {
            const widthNumber = parseFloat(w)
            if (isNaN(widthNumber)) return 'auto'
            return '' + widthNumber + 'fr'
          }
          return w
        })
        .join(' ')
      return {
        '--of-table-columns': `${selectorWidth} ${widths}`,
      }
    })
    const rows = computed(() => {
      const result = []
      let count = perPage.value
      let propItems = props.items || []
      for (
        let idx = iterStart.value;
        count > 0 && idx < propItems.length;
        idx++
      ) {
        result.push(propItems[idx])
      }
      return result
    })
    const footerRows = computed(() => {
      return props.footerItems
    })

    const rowsSelector = computed(() =>
      showSelector(props.rowsSelector, rows.value)
    )
    const selectAll = computed(() => props.selectAll)
    const rowsRecord: ComputedRef<FormRecord> = computed(() => {
      let ids: any = {}

      if (selectAll.value) {
        ids = { all: true }
      } else {
        if (rowsSelector.value) {
          for (const row of rows.value) {
            ids[row.id] = row.selected || false
          }
        }
      }
      return makeRecord(ids)
    })
    watch(
      () => rowsRecord.value.value,
      (val) => {
        ctx.emit('rows-selected', val)
        headerRowsSelectorChecked.value = true
        for (const [id, checked] of Object.entries(val)) {
          if (id !== RowsSelectorValues.All && !checked)
            headerRowsSelectorChecked.value = false
        }
      },
      { deep: true }
    )
    watch(
      () => props.resetSelection,
      (val) => {
        if (val) selectRows(RowsSelectorValues.DeselectAll)
      }
    )
    const selectRows = function (val: any) {
      if (!rows.value) return false
      const checked = val == RowsSelectorValues.DeselectAll ? false : true
      headerRowsSelectorChecked.value = checked

      if (val === RowsSelectorValues.All) {
        rowsRecord.value.value = []
        rowsRecord.value.value[RowsSelectorValues.All] = true
        selectLocked.value = true
        ctx.emit('rows-select-all')
      } else {
        delete rowsRecord.value.value[RowsSelectorValues.All]
        selectLocked.value = false
        if (val == RowsSelectorValues.DeselectAll) {
          ctx.emit('rows-deselect-all')
        } else if (val == RowsSelectorValues.Page) {
          ctx.emit('rows-select-page')
        }
        for (const row of rows.value) {
          rowsRecord.value.value[row.id] = checked
        }
      }
    }
    const headerRowsSelectorChecked = ref(false)
    const onUpdateHeaderRowsSelector = function (val: any) {
      let select = val
        ? RowsSelectorValues.Page
        : RowsSelectorValues.DeselectAll
      selectRows(select)
    }
    const selectRowsItems = [
      {
        key: 'page',
        text: 'Select Page',
        value: () => selectRows(RowsSelectorValues.Page),
      },
      {
        key: 'all',
        text: 'Select All',
        value: () => selectRows(RowsSelectorValues.All),
      },
      {
        key: 'clear',
        text: 'Deselect All',
        value: () => selectRows(RowsSelectorValues.DeselectAll),
      },
    ]

    const setSort = function (column: string, order: string) {
      sort.value.order = order
      sort.value.column = column
    }

    const onSort = function (
      column: string,
      field: ExtraSortField | undefined = undefined
    ) {
      closeSortPopup()
      const autoOrder =
        sort.value.order == RowSortOrders.noOrder ||
        sort.value.column !== column
          ? RowSortOrders.asc
          : sort.value.order == RowSortOrders.asc
          ? RowSortOrders.desc
          : RowSortOrders.asc

      setSort(column, field?.order || autoOrder)
      selectRows(RowsSelectorValues.DeselectAll)
      ctx.emit('rows-sorted', sort.value)
    }
    const density = computed(() => {
      let d = props.density
      if (d === 'default') {
        d = undefined
      } else if (typeof d === 'string') {
        d = parseInt(d, 10)
        if (isNaN(d)) d = undefined
      }
      if (typeof d !== 'number') {
        d = themeOptions.defaultDensity
      }
      if (typeof d !== 'number') {
        d = 2
      }
      return Math.max(0, Math.min(3, d || 0))
    })

    const tableClass = computed(() => [
      'of-data-table',
      'of--density-' + density.value,
    ])

    return {
      columns,
      footerRows,
      rows,
      rowsSelector,
      rowsRecord,
      selectRowsItems,
      selectRows,
      onUpdateHeaderRowsSelector,
      headerRowsSelectorChecked,
      columnsStyle,
      onSort,
      sort,
      tableClass,
      outerId,
      RowSortOrders,
      sortPopupTarget,
      sortPopupOpened,
      selectedColFields,
      selectLocked,
      createColId,
      sortColEnter,
      sortColLeave,
      sortPopupEnter,
      sortPopupLeave,
    }
  },
})
</script>
