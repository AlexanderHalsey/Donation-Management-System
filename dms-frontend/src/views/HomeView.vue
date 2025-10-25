<script lang="ts" setup>
import type { Color } from '@shared/models'
import { useColorStore } from '@/stores'
import { computed, onMounted, ref } from 'vue'

const colorStore = useColorStore()

const loading = ref(true)

const addRandomColor = async () => {
  loading.value = true
  await colorStore.addRandomColor()
  loading.value = false
}
const colors = computed(() => colorStore.colors)
const getDivStyle = (color: Color) => {
  return {
    backgroundColor: color.hexcode,
  }
}

onMounted(async () => {
  await colorStore.loadColors()
  loading.value = false
})
</script>

<template>
  <div class="home">
    <h1>This is the home page</h1>
    <div v-if="!loading" class="wrapper">
      <h2>List of existing colors</h2>
      <div class="color-list-wrapper">
        <div v-for="color in colors" :key="color.id" class="color" :style="getDivStyle(color)">
          {{ color.hexcode }}
        </div>
      </div>

      <button class="button" @click="addRandomColor">Add a random color</button>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: darken(#007bff, 10%);
  }
}

.color-list-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.color {
  margin: 16px;
  padding: 20px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
}
</style>
