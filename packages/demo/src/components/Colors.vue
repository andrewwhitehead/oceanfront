<template>
  <div class="container">
    <h1>Colors</h1>

    <of-config :theme="theme">
      <template #default="{ themeStyle }">
        <div class="row">
          <div class="column">
            <div class="row">
              <div class="column">
                <h4>Settings</h4>
                <!-- bezier-editor v-model="curve" / -->
                <div>
                  <div class="row form-row">
                    <of-slider-field
                      label="Primary Hue"
                      min="0"
                      max="359"
                      v-model="hue"
                    />
                  </div>
                  <div class="row form-row">
                    <of-slider-field
                      label="Secondary Hue Offset"
                      min="0"
                      max="359"
                      v-model="secondOffset"
                    />
                  </div>
                  <div class="row form-row">
                    <of-slider-field
                      label="Background Hue Offset"
                      min="0"
                      max="359"
                      v-model="bgOffset"
                    />
                  </div>
                  <div class="row form-row">
                    <of-slider-field
                      label="Saturation"
                      min="0"
                      max="100"
                      v-model="saturation"
                    />
                  </div>
                  <!-- of-field type="color" v-model="color" variant="filled" / -->
                  <!-- of-field type="color" v-model="color" / -->

                  <div class="row form-row">
                    <of-toggle-field label="Dark mode" v-model="dark" />
                  </div>
                </div>
              </div>
              <div
                class="column of-sheet"
                style="padding: 0 2em 2em; flex-basis: 60%"
                :style="themeStyle"
              >
                <h4>Preview</h4>
                <div class="row form-row">
                  <div class="of-field of--variant-basic of-text-field">
                    <div class="of-field-body">
                      <div class="of-field-over">
                        <div class="of-field-label-wrap">
                          <label class="of-field-label">Field label</label>
                        </div>
                      </div>
                      <div class="of-field-inner">
                        <div class="of-field-input-label">
                          <label>Basic field</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="of-field of--variant-basic of-text-field of--focused"
                  >
                    <div class="of-field-body">
                      <div class="of-field-over">
                        <div class="of-field-label-wrap">
                          <label class="of-field-label">Field label</label>
                        </div>
                      </div>
                      <div class="of-field-inner">
                        <div class="of-field-input-label">
                          <label>Focused</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row form-row">
                  <div
                    class="of-field of--active of--label-visible of--variant-filled of-text-field"
                  >
                    <div class="of-field-body">
                      <div class="of-field-over">
                        <div class="of-field-label-wrap">
                          <label class="of-field-label">Field label</label>
                        </div>
                      </div>
                      <div class="of-field-inner">
                        <div class="of-field-content">
                          <input
                            type="text"
                            class="of-field-input"
                            readonly
                            value="Filled field"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  &nbsp;
                  <div
                    class="of-field of--active of--label-visible of--variant-filled of-text-field of--focused"
                  >
                    <div class="of-field-body">
                      <div class="of-field-over">
                        <div class="of-field-label-wrap">
                          <label class="of-field-label">Field label</label>
                        </div>
                      </div>
                      <div class="of-field-inner">
                        <div class="of-field-content">
                          <input
                            type="text"
                            class="of-field-input"
                            readonly
                            value="Focused"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="column" style="padding-right: 1em">
            <h4>Theme style</h4>
            <of-highlight
              lang="css"
              :value="formatStyle(themeStyle)"
            ></of-highlight>
          </div>
          <div class="column">
            <h4>Theme config</h4>
            <of-highlight lang="json" :value="formatTheme"></of-highlight>
          </div>
        </div>
      </template>
    </of-config>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from 'vue'
// import BezierEditor from './bezier/Editor'

export default defineComponent({
  // components: { BezierEditor },
  setup() {
    // const curve = ref([0.1, 0.4, 0.75, 0.75])
    // return { curve }
    const color = ref('#88aa44aa')
    const dark = ref(false)
    const hue = ref('100')
    const secondOffset = ref('90')
    const bgOffset = ref('180')
    const saturation = ref('80')
    const theme = computed(() => {
      return {
        primaryHue: parseInt(hue.value, 10),
        secondaryHue:
          (parseInt(hue.value, 10) + parseInt(secondOffset.value, 10)) % 360,
        backgroundHue:
          (parseInt(hue.value, 10) + parseInt(bgOffset.value, 10)) % 360,
        dark: dark.value,
        saturation: parseInt(saturation.value, 10),
      }
    })
    const formatTheme = computed(() => JSON.stringify(theme.value, null, 2))
    const formatStyle = (s: Record<string, string>) => {
      const lines = []
      for (const k in s) {
        lines.push(`${k}: ${s[k]};`)
      }
      lines.sort()
      return lines.join('\n')
    }
    return {
      color,
      dark,
      hue,
      secondOffset,
      bgOffset,
      saturation,
      theme,
      formatTheme,
      formatStyle,
    }
  },
})
</script>
