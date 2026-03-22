"use client"

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StatsClient({ data }: { data: any }) {
    return (
        <div className="container dashboard-container">
            <header style={{ marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Mes Stats 📊</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Analyse de tes performances sur 30 jours.</p>
            </header>

            {/* 1. Main Progression Chart */}
            <section className="glass" style={{ padding: "1.5rem", height: "350px" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-muted)" }}>PROGRESSION (SECONDES/REPS)</h3>
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={data.chartData}>
                        <defs>
                            <linearGradient id="colorVentral" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval={4}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="ventral"
                            stroke="var(--primary)"
                            fillOpacity={1}
                            fill="url(#colorVentral)"
                            strokeWidth={3}
                        />
                        <Area
                            type="monotone"
                            dataKey="others"
                            stroke="var(--secondary)"
                            fill="transparent"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </section>

            {/* 2. Distribution & Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>

                <section className="glass" style={{ padding: "1.5rem", height: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-muted)", alignSelf: "flex-start" }}>RÉPARTITION</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.distribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </section>

                {/* Totals Summary */}
                <section className="glass" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-muted)" }}>TOTAUX PERSONNELS</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="stat-card" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1rem" }}>
                            <div className="stat-label">VENTRAL</div>
                            <div className="stat-number" style={{ color: "var(--primary)" }}>{data.totals.ventral}s</div>
                        </div>
                        <div className="stat-card" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1rem" }}>
                            <div className="stat-label">SQUATS</div>
                            <div className="stat-number" style={{ color: "var(--secondary)" }}>{data.totals.squat}</div>
                        </div>
                        <div className="stat-card" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1rem" }}>
                            <div className="stat-label">POMPAGES</div>
                            <div className="stat-number" style={{ color: "var(--accent)" }}>{data.totals.pushup}</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
