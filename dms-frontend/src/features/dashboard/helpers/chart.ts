import {
  Chart as ChartJS,
  Colors,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { ChartItem } from '@shared/models'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement, Colors)

export const getChartOptions = ({
  value,
  indexAxis,
}: {
  value: 'amount' | 'count'
  indexAxis?: 'x' | 'y'
}): ChartOptions<'bar'> => {
  return {
    responsive: true,
    indexAxis,
    scales:
      value === 'amount'
        ? {
            [indexAxis === 'y' ? 'x' : 'y']: {
              ticks: {
                callback: (val) => `${val} €`,
              },
            },
          }
        : undefined,
    plugins: {
      legend: {
        onClick: (e) => e.native?.stopPropagation(),
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed[indexAxis === 'y' ? 'x' : 'y'] || 0
            return `${label} : ${value}${value > 1 && label === 'Montant' ? ' €' : ''}`
          },
        },
      },
    },
  }
}

export function getChartData({
  items,
  value,
}: {
  items: ChartItem[]
  value: 'amount' | 'count'
}): ChartData<'bar'> {
  const labels = items.map((item) => item.name)
  return {
    labels,
    datasets: [
      {
        data: items.map((item) => item[value]),
        label: value === 'amount' ? 'Montant' : 'Nombre de dons',
        backgroundColor: 'rgb(64, 207, 197, 0.5)',
      },
    ],
  }
}
