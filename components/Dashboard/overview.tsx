"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Jul",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Aug",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Sep",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Oct",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Nov",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
  {
    name: "Dec",
    total: Math.floor(Math.random() * 5000) + 1000,
    sales: Math.floor(Math.random() * 500) + 100,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary/30" />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                      <span className="font-bold text-muted-foreground">${payload[0].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Sales</span>
                      <span className="font-bold text-muted-foreground">${payload[1].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
