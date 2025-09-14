'use client'

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'

export default function TrafficChart({ series }: { series: { time: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
        <XAxis dataKey="time" minTickGap={24} tickMargin={8} />
        <YAxis allowDecimals domain={[0, 'dataMax + 10']} width={40} />
        <Tooltip />
        <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
