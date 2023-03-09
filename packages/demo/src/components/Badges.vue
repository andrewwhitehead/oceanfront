<template>
  <div class="container">
    <h1>Badges</h1>
    <of-highlight lang="html" :value="sampleCode" />
    <div class="demo-fields of--elevated-1">
      <div class="row">
        <div class="column spaced">
          <of-field
            v-model="params.density"
            label="Density"
            type="select"
            :items="densities"
          />
        </div>
      </div>
      <h2>States</h2>
      <of-badge
        v-for="status in statusList"
        :status="status"
        :key="status"
        :density="params.density"
        >{{ status }}</of-badge
      >
      <h2>Size</h2>
      <of-badge size="sm" status="warning" :density="params.density"
        >small</of-badge
      >
      <of-badge size="nm" status="warning" :density="params.density"
        >normal</of-badge
      >
      <of-badge size="lg" status="warning" :density="params.density"
        >large</of-badge
      >
      <h2>Icons</h2>
      <of-badge
        v-for="status in statusList"
        :status="status"
        :key="status"
        :density="params.density"
        ><of-icon name="print" />{{ status }}</of-badge
      >
      <h2>Circular</h2>
      <of-badge
        v-for="status in statusList"
        circular
        :status="status"
        :key="status"
        :density="params.density"
        >{{ status }}</of-badge
      >
      <br />
      <of-badge
        v-for="status in statusList"
        circular
        :status="status"
        :key="status"
        :density="params.density"
        ><of-icon name="print" />{{ status }}</of-badge
      >
      <h2>Icon only</h2>
      <of-badge icon size="sm" status="warning" :density="params.density"
        ><of-icon name="print"
      /></of-badge>
      <of-badge icon size="nm" status="warning" :density="params.density"
        ><of-icon name="print"
      /></of-badge>
      <of-badge icon size="lg" status="warning" :density="params.density"
        ><of-icon name="print"
      /></of-badge>
      <of-badge
        icon
        circular
        size="sm"
        status="warning"
        :density="params.density"
        ><of-icon name="print"
      /></of-badge>
      <of-badge
        icon
        circular
        size="nm"
        status="warning"
        :density="params.density"
        ><of-icon name="print"
      /></of-badge>
      <of-badge
        icon
        circular
        size="lg"
        status="warning"
        :density="params.density"
        ><of-icon name="print"
      /></of-badge>
    </div>
  </div>
</template>

<script lang="ts">
const statusList = [
  'success',
  'final',
  'info',
  'draft',
  'pending',
  'deferred',
  'special',
  'error',
  'alert',
  'warning',
  'danger',
  'closed',
  'dead',
  'invert',
]

import { defineComponent, reactive } from 'vue'

const sampleCode = `
<!-- State -->
<of-badge status="info">Info</of-badge>
<of-badge status="info" size="sm">Info</of-badge>
<of-badge status="info" size="lg">Info</of-badge>
<of-badge status="info"><of-icon name="print" />Info</of-badge>
<of-badge circular status="info">Info</of-badge>
<of-badge circular status="info"><of-icon name="print" /></of-badge>
<of-badge icon status="info"><of-icon name="print" /></of-badge>
<of-badge icon circular status="info"><of-icon name="print" /></of-badge>
`
const densities = ['default', '0', '1', '2', '3']
export default defineComponent({
  setup() {
    const params = reactive({
      density: 'default',
    })
    return {
      statusList,
      sampleCode,
      densities,
      params,
    }
  },
})
</script>
