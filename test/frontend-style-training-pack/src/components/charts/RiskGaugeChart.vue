<template>
  <v-chart class="gauge-chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { useThemePalette } from '../../composables/useThemePalette.js'

use([CanvasRenderer, GaugeChart, TitleComponent, TooltipComponent])

const props = defineProps({
  value: { type: Number, default: 65 },
  title: { type: String, default: '风险指数' }
})

const palette = useThemePalette()

const option = computed(() => ({
  series: [{
    type: 'gauge',
    startAngle: 200,
    endAngle: -20,
    min: 0,
    max: 100,
    splitNumber: 10,
    itemStyle: {
      color: getRiskColor(props.value, palette.value)
    },
    progress: {
      show: true,
      width: 18
    },
    pointer: {
      show: true,
      length: '60%',
      width: 4
    },
    axisLine: {
      lineStyle: { width: 18, color: [[1, palette.value.border]] }
    },
    axisTick: { show: false },
    splitLine: { length: 8, lineStyle: { width: 2, color: palette.value.muted } },
    axisLabel: { distance: 14, color: palette.value.graphite, fontSize: 10 },
    anchor: { show: true, size: 12, itemStyle: { color: getRiskColor(props.value, palette.value) } },
    title: { show: true, offsetCenter: [0, '70%'], color: palette.value.graphite, fontSize: 12 },
    detail: {
      valueAnimation: true,
      fontSize: 28,
      fontWeight: 'bold',
      offsetCenter: [0, '40%'],
      formatter: '{value}',
      color: palette.value.ink
    },
    data: [{ value: props.value, name: props.title }]
  }]
}))

function getRiskColor(value, colors) {
  if (value < 40) return colors.low
  if (value < 70) return colors.medium
  return colors.critical
}
</script>

<style scoped>
.gauge-chart {
  width: 100%;
  height: 100%;
}
</style>
