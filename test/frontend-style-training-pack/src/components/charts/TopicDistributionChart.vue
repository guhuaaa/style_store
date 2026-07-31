<template>
  <v-chart class="topic-chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { useThemePalette } from '../../composables/useThemePalette.js'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { value: 335, name: '银行业' },
      { value: 310, name: '保险业' },
      { value: 234, name: '证券业' },
      { value: 135, name: '房地产' },
      { value: 154, name: '互联网金融' }
    ]
  }
})

const palette = useThemePalette()

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: palette.value.surface,
    borderColor: palette.value.border,
    textStyle: { color: palette.value.ink }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: palette.value.graphite }
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['35%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 8,
      borderColor: palette.value.surface,
      borderWidth: 2
    },
    label: { show: false },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold',
        color: palette.value.ink
      }
    },
    data: props.data,
    color: [
      palette.value.charcoal || palette.value.ink,
      palette.value.gold,
      palette.value.low,
      palette.value.high,
      palette.value.muted,
      '#6f7478'
    ]
  }]
}))
</script>

<style scoped>
.topic-chart {
  width: 100%;
  height: 100%;
}
</style>
