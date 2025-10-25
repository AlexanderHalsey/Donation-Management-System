import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getColors, postRandomColor } from '@/apis/dms-api'

import type { Color } from '@shared/models'

export const useColorStore = defineStore('color', () => {
  const _colors = ref<Color[]>()

  const colors = computed(() => _colors.value)

  const loadColors = async () => {
    _colors.value = await getColors()
  }

  const addRandomColor = async () => {
    const newColor = await postRandomColor()
    _colors.value?.push(newColor)
  }

  return {
    addRandomColor,
    colors,
    loadColors,
  }
})
