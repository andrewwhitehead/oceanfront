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
                <of-icon name="expand down" />
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
  setup(props, ctx: SetupContext) {
    const dialog = ref<any>()
    const dialogHeader: Ref<HTMLDivElement | undefined> = ref()

    const active = ref(props.modelValue)

    let currentZIndex = ref(100)

    let position1 = ref(0)
    let position2 = ref(0)
    let position3 = ref(0)
    let position4 = ref(0)

    let resizerStartX = ref()
    let resizerStartY = ref()

    let startWidth = ref()
    let startHeight = ref()

    watch(
      () => props.modelValue,
      (val) => {
        active.value = val
      }
    )

    const resizeAction = (e: MouseEvent) => {
      // @media (max-width: 800px)
      if (window.innerWidth > 800) {
        const dialogContent = dialog.value.querySelector('.of-dialog-content')

        resizerStartX.value = e.clientX
        resizerStartY.value = e.clientY

        startWidth.value = parseInt(
          window.getComputedStyle(dialogContent).width,
          10
        )
        startHeight.value = parseInt(
          window.getComputedStyle(dialogContent).height,
          10
        )
        document.documentElement.addEventListener('mousemove', doResize, false)
        document.documentElement.addEventListener('mouseup', stopResize, false)
      }
    }

    function doResize(e: MouseEvent) {
      const dialogContent = dialog.value.querySelector('.of-dialog-content')

      dialog.value.style.maxHeight = 'inherit'
      dialog.value.style.maxWidth = 'inherit'

      dialogContent.style.width =
        startWidth.value + e.clientX - resizerStartX.value + 'px'
      dialogContent.style.height =
        startHeight.value + e.clientY - resizerStartY.value + 'px'
    }

    function stopResize() {
      document.documentElement.removeEventListener('mousemove', doResize, false)
      document.documentElement.removeEventListener('mouseup', stopResize, false)
    }

    const dragAndDropAction = (e: MouseEvent) => {
      // @media (max-width: 800px)
      if (window.innerWidth > 800 && props.dragAndDrop) {
        dialog.value.style.zIndex = '' + ++currentZIndex.value

        // get the mouse cursor position at startup
        position3.value = e.clientX
        position4.value = e.clientY

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
      position1.value = position3.value - e.clientX
      position2.value = position4.value - e.clientY
      position3.value = e.clientX
      position4.value = e.clientY

      // set the element's new position:
      dialog.value.style.left = dialog.value.offsetLeft - position1.value + 'px'
      dialog.value.style.top = dialog.value.offsetTop - position2.value + 'px'
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
