'use client';

import { Layout } from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Mock data for charts
const performanceData = {
  labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
  datasets: [
    {
      label: 'K/D Ratio',
      data: [1.2, 1.3, 1.1, 1.4, 1.5, 1.3, 1.6],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
    },
    {
      label: 'Headshot %',
      data: [25, 28, 22, 30, 32, 28, 35],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.3,
      yAxisID: 'y1',
    },
  ],
};

const sensitivityCorrelation = {
  datasets: [
    {
      label: 'Performance vs Sensitivity',
      data: [
        { x: 0.3, y: 1.1 },
        { x: 0.32, y: 1.2 },
        { x: 0.35, y: 1.5 },
        { x: 0.38, y: 1.3 },
        { x: 0.4, y: 1.0 },
        { x: 0.42, y: 0.9 },
      ],
      backgroundColor: 'rgb(239, 68, 68)',
    },
  ],
};

const agentPerformance = {
  labels: ['Jett', 'Reyna', 'Raze', 'Phoenix', 'Sage'],
  datasets: [
    {
      label: 'Average K/D',
      data: [1.5, 1.2, 1.3, 1.0, 0.9],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
    },
  ],
};

const mapPerformance = {
  labels: ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox'],
  datasets: [
    {
      label: 'Win Rate %',
      data: [65, 52, 48, 58, 45],
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
    },
  ],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  const scatterOptions = {
    ...chartOptions,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Sensitivity',
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'K/D Ratio',
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <Layout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Performance Analytics</h1>
            <p className='text-muted-foreground'>
              Analyze your gameplay trends and optimize your settings.
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Last 7 Days</SelectItem>
                <SelectItem value='30d'>Last 30 Days</SelectItem>
                <SelectItem value='90d'>Last 90 Days</SelectItem>
                <SelectItem value='all'>All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Best K/D Ratio
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>2.15</div>
              <p className='text-xs text-muted-foreground'>
                With 0.35 sensitivity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Peak Headshot %
              </CardTitle>
              <Target className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>42%</div>
              <p className='text-xs text-muted-foreground'>+8% from average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Optimal eDPI
              </CardTitle>
              <Activity className='h-4 w-4 text-purple-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>280</div>
              <p className='text-xs text-muted-foreground'>0.35 × 800 DPI</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Settings Changes
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-orange-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>3</div>
              <p className='text-xs text-muted-foreground'>This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue='performance' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='performance'>Performance Trends</TabsTrigger>
            <TabsTrigger value='sensitivity'>Sensitivity Analysis</TabsTrigger>
            <TabsTrigger value='agents'>Agent Stats</TabsTrigger>
            <TabsTrigger value='maps'>Map Performance</TabsTrigger>
          </TabsList>

          {/* Performance Trends */}
          <TabsContent value='performance' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  Track your K/D ratio and headshot percentage trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[400px]'>
                  <Line data={performanceData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <div className='grid gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Average K/D</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>1.45</span>
                        <span className='text-xs text-green-500'>+0.12</span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Win Rate</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>54.2%</span>
                        <span className='text-xs text-green-500'>+2.3%</span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Avg Combat Score</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>265</span>
                        <span className='text-xs text-red-500'>-12</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='p-3 rounded-lg bg-green-500/10 border border-green-500/20'>
                      <div className='text-sm font-medium text-green-500'>
                        Improving
                      </div>
                      <div className='text-xs text-muted-foreground mt-1'>
                        Your K/D ratio has improved by 15% this week
                      </div>
                    </div>
                    <div className='p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
                      <div className='text-sm font-medium text-blue-500'>
                        Consistent
                      </div>
                      <div className='text-xs text-muted-foreground mt-1'>
                        Headshot accuracy remains stable at 28-32%
                      </div>
                    </div>
                    <div className='p-3 rounded-lg bg-orange-500/10 border border-orange-500/20'>
                      <div className='text-sm font-medium text-orange-500'>
                        Suggestion
                      </div>
                      <div className='text-xs text-muted-foreground mt-1'>
                        Try lowering sensitivity by 0.02 for better precision
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sensitivity Analysis */}
          <TabsContent value='sensitivity' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Sensitivity vs Performance</CardTitle>
                <CardDescription>
                  Find your optimal sensitivity based on performance data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[400px]'>
                  <Scatter
                    data={sensitivityCorrelation}
                    options={scatterOptions}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings History Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 rounded-lg bg-secondary/50'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='font-medium'>0.35 Sensitivity</span>
                      <span className='text-sm text-muted-foreground'>
                        Current
                      </span>
                    </div>
                    <div className='grid grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>K/D:</span>
                        <span className='ml-1 font-medium'>1.45</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>HS%:</span>
                        <span className='ml-1 font-medium'>32%</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Win%:</span>
                        <span className='ml-1 font-medium'>58%</span>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 rounded-lg bg-secondary/30'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='font-medium'>0.38 Sensitivity</span>
                      <span className='text-sm text-muted-foreground'>
                        Jan 10 - Jan 15
                      </span>
                    </div>
                    <div className='grid grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>K/D:</span>
                        <span className='ml-1 font-medium'>1.20</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>HS%:</span>
                        <span className='ml-1 font-medium'>25%</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Win%:</span>
                        <span className='ml-1 font-medium'>45%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Stats */}
          <TabsContent value='agents' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Compare your performance across different agents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[400px]'>
                  <Bar data={agentPerformance} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Performance */}
          <TabsContent value='maps' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Map Win Rates</CardTitle>
                <CardDescription>
                  Your performance breakdown by map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[400px]'>
                  <Bar data={mapPerformance} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
