'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { LineChart } from '@mui/x-charts/LineChart'

// Helper function to get ordinal suffix (st, nd, rd, th)
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export default function TestDashboard() {
  const [primaryColor, setPrimaryColor] = useState('#9333ea')

  useEffect(() => {
    // Get computed primary color from CSS
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const primary = getComputedStyle(root).getPropertyValue('--primary').trim()
      setPrimaryColor(primary || '#9333ea')
    }
  }, [])

  // Mock data for a full month (31 days) with varying application counts
  const generateMockData = () => {
    const xAxisData: number[] = []
    const yAxisData: number[] = []
    const currentDay = 31 // Full month
    const daysInMonth = 31

    // Simulate applications throughout the month
    const mockDailyCounts: { [key: number]: number } = {
      1: 0,
      2: 1,
      3: 0,
      4: 2,
      5: 1,
      6: 0,
      7: 1,
      8: 0,
      9: 3,
      10: 1,
      11: 0,
      12: 2,
      13: 1,
      14: 0,
      15: 4,
      16: 2,
      17: 1,
      18: 0,
      19: 2,
      20: 1,
      21: 0,
      22: 3,
      23: 1,
      24: 0,
      25: 2,
      26: 1,
      27: 0,
      28: 1,
      29: 0,
      30: 2,
      31: 1,
    }

    for (let day = 1; day <= currentDay; day++) {
      xAxisData.push(day)
      yAxisData.push(mockDailyCounts[day] || 0)
    }

    return { xAxisData, yAxisData, currentDay }
  }

  const { xAxisData, yAxisData, currentDay } = generateMockData()
  // Calculate total for current month (sum of daily counts)
  const totalApplications = yAxisData.reduce((sum, count) => sum + count, 0)
  const currentMonthApplications = totalApplications
  const maxYValue = Math.max(...yAxisData, 0)
  const yAxisMax = maxYValue === 0 ? 1 : Math.ceil(maxYValue * 1.1) // Add 10% padding, round up

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Test Dashboard (Full Month)
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Testing chart with full month of data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-3xl font-bold text-foreground">{currentMonthApplications}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-card-foreground mb-1">
              Applications Over Time
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentMonthName} - {new Date().toLocaleDateString('en-US', { weekday: 'long' })} {new Date().getDate()}{getOrdinalSuffix(new Date().getDate())}
            </p>
          </div>
          
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: '100%', width: '100%', height: '400px' }}>
              <LineChart
              xAxis={[
                {
                  data: xAxisData,
                  min: 1,
                  max: Math.max(...xAxisData, 30), // Show full month range on axis even if data stops earlier
                  tickNumber: 7,
                  valueFormatter: (value: number) => {
                    const day = Math.round(value)
                    // Format with ordinal suffix for tooltips
                    return `${day}${getOrdinalSuffix(day)}`
                  },
                  tickLabelStyle: { fill: 'var(--foreground)' },
                  labelStyle: { fill: 'var(--foreground)' },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: { fill: 'var(--foreground)' },
                  labelStyle: { fill: 'var(--foreground)' },
                  min: 0,
                  max: yAxisMax,
                  tickNumber: yAxisMax + 1,
                  valueFormatter: (value: number) => {
                    if (Number.isInteger(value)) {
                      return value.toString()
                    }
                    return ''
                  },
                },
              ]}
              series={[
                {
                  data: yAxisData,
                  curve: 'catmullRom',
                  area: true,
                  showMark: ({ index }) => {
                    const day = xAxisData[index]
                    // Only show marks for days that have passed or are today
                    return day <= currentDay
                  },
                },
              ]}
              colors={[primaryColor]}
              height={400}
              slotProps={{
                tooltip: {
                  labelFormatter: (value: number) => {
                    const day = Math.round(value)
                    return `${day}${getOrdinalSuffix(day)}`
                  },
                  valueFormatter: (value: number | null) => {
                    if (value === null || value === undefined) return '0'
                    return value.toString()
                  },
                  sx: {
                    '& .MuiChartsTooltip-root': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                      border: `1px solid ${primaryColor} !important`,
                      borderRadius: '8px !important',
                      color: 'var(--foreground) !important',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
                    },
                    '& .MuiChartsTooltip-paper': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                      border: `1px solid ${primaryColor} !important`,
                      borderRadius: '8px !important',
                    },
                    '& .MuiPaper-root': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                    },
                    '& .MuiChartsTooltip-mark': {
                      backgroundColor: `${primaryColor} !important`,
                    },
                    '& .MuiChartsTooltip-table': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                    },
                    '& .MuiChartsTooltip-row': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                    },
                    '& .MuiChartsTooltip-cell': {
                      color: 'var(--foreground) !important',
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                    },
                    '& .MuiChartsTooltip-label': {
                      color: 'var(--foreground) !important',
                    },
                    '& .MuiChartsTooltip-value': {
                      color: 'var(--foreground) !important',
                    },
                    '& .MuiChartsTooltip-content': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                      color: 'var(--foreground) !important',
                    },
                  },
                },
              }}
              sx={{
                // Tooltip styling in main sx prop to ensure it applies
                '& .MuiChartsTooltip-root, & .MuiChartsTooltip-paper, & .MuiPaper-root': {
                  backgroundColor: 'hsl(var(--card)) !important',
                  background: 'hsl(var(--card)) !important',
                  border: `1px solid ${primaryColor} !important`,
                  color: 'hsl(var(--foreground)) !important',
                },
                '& .MuiChartsTooltip-table, & .MuiChartsTooltip-row, & .MuiChartsTooltip-cell': {
                  backgroundColor: 'hsl(var(--card)) !important',
                  background: 'hsl(var(--card)) !important',
                  color: 'hsl(var(--foreground)) !important',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-tickLabel': {
                  fill: 'var(--foreground) !important',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-label': {
                  fill: 'var(--foreground) !important',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-line': {
                  stroke: 'var(--border) !important',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-tick': {
                  stroke: 'var(--border) !important',
                },
                '& .MuiLineElement-root': {
                  strokeWidth: '3px !important',
                  stroke: `${primaryColor} !important`,
                  fill: 'none !important',
                  opacity: '1 !important',
                  display: 'block !important',
                },
                '& .MuiAreaElement-root': {
                  fill: `url(#areaGradient) !important`,
                  opacity: '1 !important',
                },
                // Hide the hover overlay line
                '& .MuiChartsAxisHighlight-root': {
                  display: 'none !important',
                },
                '& .MuiChartsAxisHighlight-line': {
                  display: 'none !important',
                },
                // Hide tick marks that don't have labels
                '& .MuiChartsAxis-root .MuiChartsAxis-tickLabel:empty': {
                  display: 'none',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-tick:has(+ text:empty)': {
                  display: 'none',
                },
              }}
              width={undefined}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </LineChart>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

