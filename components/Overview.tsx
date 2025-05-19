"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useMemo } from "react"

const generateChartData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  return months.map(month => ({
    name: month,
    total: Math.floor(Math.random() * 5000) + 1000,
  }))
}

export function Overview() {
  const chartData = useMemo(() => generateChartData(), []);
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} kg`}
        />
        <Bar 
          dataKey="total" 
          fill="#CCFF00"
          stroke="#1A3721"
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

