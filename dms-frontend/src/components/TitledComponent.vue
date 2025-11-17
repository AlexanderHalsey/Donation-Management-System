<template>
  <div class="titled-component">
    <div class="titled-component__title">
      <slot name="title">
        <span class="text-body2 text-grey-7 text-weight-medium">{{ title }}</span>
      </slot>
    </div>
    <div class="titled-component__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
.titled-component {
  margin-bottom: 1rem;
}

.titled-component__title {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.titled-component__content {
  font-size: 0.9rem;
  color: #333;
}
</style>