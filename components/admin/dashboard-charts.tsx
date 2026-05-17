'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

export function DashboardCharts({ 
  registrationsData,
  tournamentsByGameData
}: { 
  registrationsData: any[]
  tournamentsByGameData: any[]
}) {
  // Vibrant colors for Pie Chart (Games)
  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e']
  
  // Specific colors for Registration Status
  const getStatusColor = (name: string) => {
    switch(name) {
      case 'Menunggu': return '#f59e0b' // Amber
      case 'Disetujui': return '#10b981' // Emerald
      case 'Ditolak': return '#ef4444' // Red
      default: return '#3b82f6' // Blue
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Registrations Trend */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-md overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Status Pendaftaran</CardTitle>
          <CardDescription>Jumlah pendaftaran berdasarkan status persetujuan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationsData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'var(--color-foreground)', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]} 
                  barSize={50}
                >
                  {registrationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments by Game */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-md overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Distribusi Game</CardTitle>
          <CardDescription>Persentase turnamen berdasarkan kategori game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex flex-col items-center justify-center">
            {tournamentsByGameData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tournamentsByGameData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                  >
                    {tournamentsByGameData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'var(--color-foreground)', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">Belum ada data turnamen</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
