<template>
  <v-chart class="trend-chart" :option="option" autoresize />
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { useThemePalette } from '../../composables/useThemePalette.js'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      times: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      positive: [12, 18, 35, 42, 38, 45],
      negative: [8, 12, 25, 38, 52, 48],
      neutral: [30, 28, 32, 35, 30, 28]
    })
  }
})

const palette = useThemePalette()

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: palette.value.surface,
    borderColor: palette.value.border,
    textStyle: { color: palette.value.ink }
  },
  legend: {
    data: ['正面', '负面', '中性'],
    textStyle: { color: palette.value.graphite },
    bottom: 0
  },
  grid: {
    left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data.times,
    axisLine: { lineStyle: { color: palette.value.border } },
    axisLabel: { color: palette.value.graphite }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: palette.value.border, type: 'dashed' } },
    axisLabel: { color: palette.value.graphite }
  },
  series: [
    {
      name: '正面',
      type: 'line',
      smooth: true,
      data: props.data.positive,
      itemStyle: { color: palette.value.low },
      areaStyle: { color: `${palette.value.low}18` }
    },
    {
      name: '负面',
      type: 'line',
      smooth: true,
      data: props.data.negative,
      itemStyle: { color: palette.value.critical },
      areaStyle: { color: `${palette.value.critical}18` }
    },
    {
      name: '中性',
      type: 'line',
      smooth: true,
      data: props.data.neutral,
      itemStyle: { color: palette.value.neutral },
      areaStyle: { color: `${palette.value.neutral}18` }
    }
  ]
}))
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
}
</style>
