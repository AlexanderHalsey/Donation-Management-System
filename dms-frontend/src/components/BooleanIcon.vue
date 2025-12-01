<template>
  <QIcon :name="value ? 'check_circle' : 'cancel'" :color="value ? 'green' : 'red'" size="sm" />
</template>

<script setup lang="ts">
defineProps<{
  value: boolean
}>()
</script>
