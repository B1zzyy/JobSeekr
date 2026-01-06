'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'

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

interface Application {
  id: string
  company_name: string | null
  job_title: string | null
  applied_at: string
  status: string
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryColor, setPrimaryColor] = useState('#9333ea')

  useEffect(() => {
    // Get computed primary color from CSS immediately (synchronous)
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const primary = getComputedStyle(root).getPropertyValue('--primary').trim()
      setPrimaryColor(primary || '#9333ea')
    }
    // Fetch applications
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications/list')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get current month's data
  const getCurrentMonthData = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentDay = now.getDate()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Filter applications from current month
    const currentMonthApps = applications.filter((app) => {
      const appDate = new Date(app.applied_at)
      return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear
    })

    // Create data points for each day of the month
    const dailyCounts: { [key: number]: number } = {}
    
    currentMonthApps.forEach((app) => {
      const day = new Date(app.applied_at).getDate()
      dailyCounts[day] = (dailyCounts[day] || 0) + 1
    })

    // Build chart data with daily counts (not cumulative) for MUI
    // Only include data up to the current day
    const xAxisData: number[] = []
    const yAxisData: number[] = []
    
    for (let day = 1; day <= currentDay; day++) {
      xAxisData.push(day)
      yAxisData.push(dailyCounts[day] || 0)
    }

    return { xAxisData, yAxisData, currentDay }
  }

  const { xAxisData, yAxisData, currentDay } = getCurrentMonthData()
  const totalApplications = applications.length
  // Calculate total for current month (sum of daily counts)
  const currentMonthApplications = yAxisData.reduce((sum, count) => sum + count, 0)
  const maxYValue = Math.max(...yAxisData, 0)
  const yAxisMax = maxYValue === 0 ? 1 : Math.ceil(maxYValue * 1.1) // Add 10% padding, round up

  // Calculate status counts for pie chart
  const statusCounts: { [key: string]: number } = {}
  applications.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
  })

  // Status colors matching applications page
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Accepted':
        return '#22c55e' // green-500
      case 'Rejected':
        return '#ef4444' // red-500
      case 'Final Round Interviews':
        return '#a855f7' // purple-500
      case '2nd Round Interviews':
        return '#3b82f6' // blue-500
      case '1st Round Interviews':
        return '#06b6d4' // cyan-500
      case 'Applied':
        return '#f59e0b' // amber-500
      case 'Viewed':
        return '#6b7280' // gray-500 (muted)
      default:
        return '#6b7280'
    }
  }

  // Prepare pie chart data
  const pieChartData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      id: status,
      value: count,
      label: status,
    }))
    .sort((a, b) => b.value - a.value) // Sort by count descending

  const pieChartColors = pieChartData.map((item) => getStatusColor(item.label))

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-5 bg-muted rounded w-64 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-3 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <div className="mb-6">
              <div className="h-7 bg-muted rounded w-56 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-72 animate-pulse"></div>
            </div>
            <div className="w-full h-[400px] bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Track your job application progress
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
                  max: currentDay, // Rightmost point is always today's date
                  tickNumber: 7,
                  valueFormatter: (value: number) => {
                    const day = Math.round(value)
                    // Return ordinal format - this will be used for tooltips
                    // For axis labels, we'll handle via tickNumber and only show specific days
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
                  sx: {
                    '& .MuiChartsTooltip-root': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                      border: `1px solid ${primaryColor} !important`,
                      borderRadius: '8px !important',
                      color: 'var(--foreground) !important',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
                      overflow: 'visible !important',
                      boxSizing: 'border-box !important',
                    },
                    '& .MuiChartsTooltip-paper': {
                      backgroundColor: 'var(--card) !important',
                      background: 'var(--card) !important',
                      border: `1px solid ${primaryColor} !important`,
                      borderRadius: '8px !important',
                      overflow: 'visible !important',
                      boxSizing: 'border-box !important',
                      padding: '8px 12px !important',
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
                      '&::after': {
                        content: '" - "',
                      },
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
                  backgroundColor: 'var(--card) !important',
                  background: 'var(--card) !important',
                  border: `1px solid ${primaryColor} !important`,
                  color: 'var(--foreground) !important',
                },
                '& .MuiChartsTooltip-table, & .MuiChartsTooltip-row, & .MuiChartsTooltip-cell': {
                  backgroundColor: 'var(--card) !important',
                  background: 'var(--card) !important',
                  color: 'var(--foreground) !important',
                },
                '& .MuiChartsAxis-root .MuiChartsAxis-tickLabel': {
                  fill: 'var(--foreground) !important',
                  fontSize: '12px',
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

        {/* Pie Chart */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-card-foreground mb-1">
                Application Status
              </h2>
              <p className="text-sm text-muted-foreground">
                Distribution of your applications by status
              </p>
            </div>
            
            {pieChartData.length > 0 ? (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-center mb-4">
                  <PieChart
                    series={[
                      {
                        data: pieChartData,
                        innerRadius: 60,
                        outerRadius: 120,
                        paddingAngle: 2,
                        cornerRadius: 8,
                        cx: 200,
                        cy: 200,
                      },
                    ]}
                    colors={pieChartColors}
                    slotProps={{
                      legend: {
                        hidden: true,
                      },
                    tooltip: {
                      sx: {
                        '& .MuiChartsTooltip-root': {
                          backgroundColor: 'var(--card) !important',
                          border: '1px solid var(--border) !important',
                          borderRadius: '8px !important',
                          color: 'var(--foreground) !important',
                        },
                        '& .MuiChartsTooltip-cell': {
                          color: 'var(--foreground) !important',
                        },
                        '& .MuiChartsTooltip-label': {
                          color: 'var(--foreground) !important',
                        },
                        '& .MuiChartsTooltip-value': {
                          color: 'var(--foreground) !important',
                        },
                      },
                    },
                  }}
                  sx={{
                    '& .MuiPieArc-root': {
                      stroke: 'var(--card)',
                      strokeWidth: 2,
                    },
                    '& .MuiChartsLegend-root': {
                      display: 'none !important',
                    },
                  }}
                  width={400}
                  height={400}
                />
                </div>
                
                {/* Custom Legend Below Chart */}
                <div className="w-full flex flex-wrap justify-center gap-3 px-4">
                  {pieChartData.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(item.label) }}
                      />
                      <span className="text-sm text-foreground whitespace-nowrap">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <p>No applications to display</p>
              </div>
            )}
          </div>
      </div>
    </AppLayout>
  )
}
