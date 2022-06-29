<template>
  <of-overlay :active="active" @blur="hide">
    <template #default="{ active: dlgActive }">
      <transition :name="transition">
        <div class="of-dialog-outer">
          <div
            role="dialog"
            :id="id"
            class="of-dialog"
            :class="classAttr"
            v-if="dlgActive"
          >
            <div class="of-dialog-header">
              <slot name="header" />
            </div>
            <div class="of-dialog-content">
              <slot />
            </div>
            <div class="of-dialog-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </transition>
    </template>
  </of-overlay>
</template>

<script lang="ts">
import { ref, defineComponent, SetupContext, computed, watch } from 'vue'
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
    transition: { type: String, default: 'slide-down' },
  },
  emits: ['update:modelValue'],
  setup(props, ctx: SetupContext) {
    const active = ref(props.modelValue)
    watch(
      () => props.modelValue,
      (val) => {
        active.value = val
      }
    )
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
    }
  },
})
</script>
