"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"

export function SystemStatus() {
  const services = [
    {
      name: "API Gateway",
      status: "operational",
      uptime: "99.99%",
      responseTime: "45ms",
      load: 32,
    },
    {
      name: "Authentication Service",
      status: "operational",
      uptime: "99.98%",
      responseTime: "78ms",
      load: 45,
    },
    {
      name: "Database Cluster",
      status: "operational",
      uptime: "100%",
      responseTime: "12ms",
      load: 28,
    },
    {
      name: "Storage Service",
      status: "degraded",
      uptime: "99.87%",
      responseTime: "156ms",
      load: 72,
    },
    {
      name: "Notification Service",
      status: "incident",
      uptime: "98.23%",
      responseTime: "320ms",
      load: 89,
    },
    {
      name: "Analytics Engine",
      status: "operational",
      uptime: "99.95%",
      responseTime: "67ms",
      load: 41,
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Operational
          </Badge>
        )
      case "degraded":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Degraded
          </Badge>
        )
      case "incident":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Incident
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.name} className="grid grid-cols-5 gap-4 items-center">
          <div className="font-medium">{service.name}</div>
          <div>{getStatusBadge(service.status)}</div>
          <div className="text-sm">{service.uptime}</div>
          <div className="text-sm">{service.responseTime}</div>
          <div className="flex items-center gap-2">
            <Progress value={service.load} className="h-2" />
            <span className="text-xs text-muted-foreground w-8">{service.load}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
