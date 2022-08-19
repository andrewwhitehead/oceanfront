<template>
  <of-overlay :active="active" @blur="hide">
    <template #default="{ active: dialogActive }">
      <transition :name="transition">
        <div class="of-dialog-outer">
          <div
            ref="dialog"
            role="dialog"
            :id="id"
            class="of-dialog"
            :class="classAttr"
            v-if="dialogActive"
          >
            <div
              class="of-dialog-header"
              ref="dialogHeader"
              :class="{ 'drag-and-drop': dragAndDrop }"
              v-on="{ mousedown: dragAndDrop ? dragAndDropAction : null }"
            >
              <slot name="header" />
            </div>
            <div class="of-dialog-content">
              <slot />
            </div>
            <div class="of-dialog-footer">
              <div
                v-if="resize"
                class="dialog-resizer"
                @mousedown="resizeAction"
              >
                <of-icon name="popup resize" />
              </div>
              <slot name="footer" />
            </div>
          </div>
        </div>
      </transition>
    </template>
  </of-overlay>
</template>

<script lang="ts">
import { ref, defineComponent, SetupContext, computed, watch, Ref } from 'vue'
import { OfOverlay } from './Overlay'

export default defineComponent({
  name: 'OfDialog',
  components: { OfOverlay },
  inheritAttrs: false,
  props: {
    class: String,
    id: String,
    loading: Boolean,
    modelValue: Boolean,
    resize: { type: Boolean, default: false },
    dragAndDrop: { type: Boolean, default: true },
    transition: { type: String, default: 'slide-down' },
  },
  emits: ['update:modelValue'],
  setup: function (props, ctx: SetupContext) {
    const dialog = ref<any>()
    const dialogHeader: Ref<HTMLDivElement | undefined> = ref()
    const active = ref(props.modelValue)

    const padding = 10
    const bottomPadding = 85

    let currentZIndex = ref(100)
    let position = ref({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    })

    let startWidth = ref()
    let startHeight = ref()

    watch(
      () => props.modelValue,
      (val) => {
        active.value = val
      }
    )

    const resizeAction = (e: MouseEvent) => {
      e.preventDefault()

      // @media (max-width: 800px)
      if (window.innerWidth > 800) {
        // countDialogSize()

        document.documentElement.addEventListener('mousemove', doResize, false)
        document.documentElement.addEventListener('mouseup', stopResize, false)
      }
    }

    function doResize(e: MouseEvent) {
      e.preventDefault()

      const dialogContent = dialog.value.querySelector('.of-dialog-content')
      const startWidth = parseInt(
        window.getComputedStyle(dialogContent).width,
        10
      )
      const startHeight = parseInt(
        window.getComputedStyle(dialogContent).height,
        10
      )

      const resizerElement = dialog.value.querySelector('.dialog-resizer')
      const resizer = resizerElement.getBoundingClientRect()

      let newOffsetX =
        startWidth + e.clientX - parseInt(resizer.x, 10) - resizer.width / 4
      let newOffsetY =
        startHeight + e.clientY - parseInt(resizer.y, 10) - resizer.height / 4

      if (e.clientX < window.innerWidth - padding - resizer.width) {
        dialog.value.style.maxWidth = 'inherit'
        dialogContent.style.width = newOffsetX + 'px'
      }
      if (e.clientY < window.innerHeight - padding - resizer.height) {
        dialog.value.style.maxHeight = 'inherit'
        dialogContent.style.height = newOffsetY + 'px'
      }
    }

    function stopResize() {
      document.documentElement.removeEventListener('mousemove', doResize, false)
      document.documentElement.removeEventListener('mouseup', stopResize, false)
    }

    const dragAndDropAction = (e: MouseEvent) => {
      e.preventDefault()

      // @media (max-width: 800px)
      if (window.innerWidth > 800 && props.dragAndDrop) {
        const dialogContent = dialog.value.querySelector('.of-dialog-content')
        dialog.value.style.zIndex = '' + ++currentZIndex.value

        startWidth.value = parseInt(
          window.getComputedStyle(dialogContent).width,
          10
        )
        startHeight.value = parseInt(
          window.getComputedStyle(dialogContent).height,
          10
        )

        // get the mouse cursor position at startup
        position.value[3] = e.clientX
        position.value[4] = e.clientY

        // call a function whenever the cursor moves
        document.addEventListener('mouseup', closeDragElement)
        document.addEventListener('mousemove', elementDrag)
      }
    }

    function elementDrag(e: MouseEvent) {
      if (!dialog.value) {
        return
      }

      // calculate the new cursor position:
      position.value[1] = position.value[3] - e.clientX
      position.value[2] = position.value[4] - e.clientY
      position.value[3] = e.clientX
      position.value[4] = e.clientY

      let offsetLeft = dialog.value.offsetLeft
      let offsetTop = dialog.value.offsetTop
      let newOffsetLeft = offsetLeft - position.value[1]
      let newOffsetTop = offsetTop - position.value[2]

      let rightLimit = window.innerWidth - startWidth.value - offsetLeft
      let bottomLimit = window.innerHeight - startHeight.value - offsetTop

      // popup can't go out of the visible area
      if (newOffsetLeft <= padding) {
        newOffsetLeft = padding
      }
      if (newOffsetTop <= padding) {
        newOffsetTop = padding
      }
      if (rightLimit <= padding && offsetLeft < newOffsetLeft) {
        newOffsetLeft = window.innerWidth - startWidth.value - padding
      }
      if (bottomLimit <= bottomPadding && offsetTop < newOffsetTop) {
        newOffsetTop = window.innerHeight - startHeight.value - bottomPadding
      }

      // set the element's new position:
      dialog.value.style.left = newOffsetLeft + 'px'
      dialog.value.style.top = newOffsetTop + 'px'
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.removeEventListener('mouseup', closeDragElement)
      document.removeEventListener('mousemove', elementDrag)
    }

    const classAttr = computed(() => props.class)

    const hide = () => {
      active.value = false
      ctx.emit('update:modelValue', false)
    }
    const show = () => (active.value = true)

    return {
      active,
      classAttr,
      hide,
      show,
      dialog,
      dialogHeader,
      dragAndDropAction,
      resizeAction,
    }
  },
})
</script>
