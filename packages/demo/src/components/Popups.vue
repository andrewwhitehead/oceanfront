<template>
  <div class="container">
    <h1>Popups and Dialogs</h1>
    <of-highlight lang="html" :value="sampleCode" />
    <hr />
    <of-button @click="toggleDialog">Show dialog</of-button>
    <of-dialog v-model="dialogActive">
      <template #header></template>
      <template #default>
        <div class="container">
          <h4>Simple Dialog</h4>
          <of-select-field :items="['one', 'two']" label="Test select" />
        </div>
      </template>
      <template #footer></template>
    </of-dialog>

    <p></p>

    <of-button @click="toggleSecondDialog">
      Show dialog (with nested dialog)
    </of-button>
    <of-dialog v-model="secondDialogActive">
      <template #header></template>
      <template #default>
        <div class="container">
          <h4>Dialog with nested</h4>
          <of-select-field :items="['one', 'two']" label="Test select" />
          <p>
            <of-button @click="toggleNestedDialog">
              Show nested dialog
            </of-button>
          </p>
        </div>
        <of-dialog v-model="nestedDialogActive">
          <div class="container">
            <h4>Nested Dialog</h4>
            <of-select-field :items="['one', 'two']" label="Test select" />
          </div>
        </of-dialog>
      </template>
      <template #footer></template>
    </of-dialog>

    <p></p>

    <of-button @click="toggleThirdDialog"> Show dialog with data </of-button>
    <of-dialog v-model="thirdDialogActive">
      <template #header></template>
      <template #default>
        <div class="container">
          <h4>Dialog with data</h4>
          <p>
            Instead of binding each field's value property directly, it can be
            more effective to bind a <var>record</var> and a field name. This
            may be be may be be required for complex field types which bind to
            multiple fields on the associated record. It also allows for
            validation rules to be combined at the record level, instead of
            being assigned to individual fields or handled within a custom
            component.
          </p>
        </div>
      </template>
      <template #footer></template>
    </of-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const sampleCode = `
<of-dialog
  v-model="dialogActive"
/>
`
    const dialogActive = ref(false)
    const secondDialogActive = ref(false)
    const thirdDialogActive = ref(false)

    const nestedDialogActive = ref(false)

    return {
      dialogActive,
      secondDialogActive,
      thirdDialogActive,
      nestedDialogActive,
      sampleCode,
      toggleDialog: () => {
        dialogActive.value = !dialogActive.value
      },
      toggleSecondDialog: () => {
        secondDialogActive.value = !secondDialogActive.value
      },
      toggleThirdDialog: () => {
        thirdDialogActive.value = !thirdDialogActive.value
      },
      toggleNestedDialog: () => {
        nestedDialogActive.value = !nestedDialogActive.value
      },
    }
  },
})
</script>
