"use client"

import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Target,
  TrendingUp,
  Trophy,
  Activity,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

// Mock data
const mockStats = {
  currentSensitivity: 0.35,
  currentDPI: 800,
  totalMatches: 156,
  winRate: 52.3,
  avgKD: 1.24,
  avgHS: 28.5,
  recentMatches: [
    { id: 1, map: "Ascent", agent: "Jett", kd: 1.5, result: "W", score: "13-11" },
    { id: 2, map: "Haven", agent: "Reyna", kd: 0.9, result: "L", score: "10-13" },
    { id: 3, map: "Split", agent: "Jett", kd: 2.1, result: "W", score: "13-7" },
    { id: 4, map: "Bind", agent: "Raze", kd: 1.3, result: "W", score: "13-9" },
    { id: 5, map: "Icebox", agent: "Jett", kd: 0.8, result: "L", score: "11-13" },
  ],
  performanceTrend: [
    { date: "Mon", kd: 1.1 },
    { date: "Tue", kd: 1.3 },
    { date: "Wed", kd: 0.9 },
    { date: "Thu", kd: 1.5 },
    { date: "Fri", kd: 1.4 },
    { date: "Sat", kd: 1.2 },
    { date: "Sun", kd: 1.6 },
  ],
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState(new Date())

  const handleSync = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastSync(new Date())
    setIsLoading(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s your performance overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last sync: {format(lastSync, "HH:mm")}
            </div>
            <Button
              onClick={handleSync}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Sync Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Sensitivity
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.currentSensitivity}</div>
              <p className="text-xs text-muted-foreground">
                DPI: {mockStats.currentDPI}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Win Rate
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.winRate}%</div>
              <p className="text-xs text-muted-foreground">
                {mockStats.totalMatches} matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average K/D
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgKD}</div>
              <p className="text-xs text-muted-foreground">
                +0.15 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Headshot %
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgHS}%</div>
              <p className="text-xs text-muted-foreground">
                +2.3% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches & Performance Trend */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStats.recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded ${
                        match.result === "W" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <div>
                        <div className="font-medium">{match.map}</div>
                        <div className="text-sm text-muted-foreground">{match.agent}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{match.score}</div>
                      <div className="text-sm text-muted-foreground">K/D: {match.kd}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {mockStats.performanceTrend.map((day, index) => {
                  const height = (day.kd / 2) * 100 // Scale to percentage
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-secondary rounded-t relative" style={{ height: `${height}%` }}>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                          {day.kd}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{day.date}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                View Full History
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}