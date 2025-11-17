<template>
  <QCard flat bordered class="stats-card">
    <QCardSection class="text-center">
      <div class="stats-icon">
        <QIcon :name="icon" size="2rem" :color="iconColor" />
      </div>
      <div class="stats-value">
        <slot name="value">{{ value }}</slot>
      </div>
      <div class="stats-label">
        <slot name="label">{{ label }}</slot>
      </div>
    </QCardSection>
  </QCard>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  value?: string | number
  label?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
})
</script>

<style scoped>
.stats-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-icon {
  margin-bottom: 0.5rem;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.stats-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}
</style>
