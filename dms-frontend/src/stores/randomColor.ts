import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getRandomColor } from '@/apis/dms-api'

import { type RandomColor } from '@/models'

export const useRandomColorStore = defineStore('random-color', () => {
  const _randomColor = ref<RandomColor>()

  const randomColor = computed(() => _randomColor.value?.color)

  const loadRandomColor = async () => {
    _randomColor.value = await getRandomColor()
  }
  return {
    randomColor,
    loadRandomColor,
  }
})
