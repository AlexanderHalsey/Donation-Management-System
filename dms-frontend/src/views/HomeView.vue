<script lang="ts" setup>
import { useRandomColorStore } from '@/stores'
import { computed } from 'vue'

const randomColorStore = useRandomColorStore()
const getRandomColor = async () => {
  await randomColorStore.loadRandomColor()
}
const randomColor = computed(() => randomColorStore.randomColor)
const divStyle = computed(() => ({
  backgroundColor: randomColor.value,
}))
</script>

<template>
  <div class="home">
    <h1>This is the home page</h1>
    <div class="wrapper">
      <button class="button" @click="getRandomColor">Get random color</button>
      <div class="random-color" :style="divStyle">{{ randomColor }}</div>
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

.random-color {
  margin-top: 16px;
  padding: 20px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
}
</style>
