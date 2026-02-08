<template>
  <div class="row items-center q-gutter-x-lg q-mb-sm" data-cy="form-field">
    <label :for="name" class="text-bold text-right" style="width: 200px; padding-bottom: 20px">
      {{ label }}<span v-if="required" style="color: red">&nbsp;*</span>
    </label>

    <div style="width: 400px">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  label: string
  required?: boolean
}>()
</script>
