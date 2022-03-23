<template>
  <div class="container">
    <h1>URL Inputs</h1>

    <of-demo-field>
      <template #default="props">
        <of-text-field
          placeholder="(placeholder)"
          help="field help"
          label="URL input"
          v-model="textValue"
          v-bind="{ ...props, ...customProps }"
          input-type="url"
        />
      </template>
    </of-demo-field>
  </div>
</template>

<script lang="ts">
import { reactive, ref, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const textValue = ref('https://1crm.com/')
    const customProps = reactive({ multiline: false })
    return {
      customProps,
      textValue,
    }
  },
})
</script>

<style lang="scss">
.demo-row {
  grid-gap: 10px;
  margin: 10px 0;
}
</style>
