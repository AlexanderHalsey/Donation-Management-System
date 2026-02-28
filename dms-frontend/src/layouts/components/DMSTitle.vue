<template>
  <div class="dms-title">
    <QImg :src="logo" alt="DMS Logo" fit="contain" style="max-width: 56px; height: 24px" />

    <template v-if="showText">DMS</template>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.png'

defineProps({
  showText: {
    type: Boolean,
    default: true,
  },
})
</script>

<style lang="scss" scoped>
.dms-title {
  position: sticky;
  top: 0;
  color: $primary;
  background: inherit;
  z-index: 1;
  height: 51px;
  min-width: 1px;
  max-width: 100%;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 14px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
