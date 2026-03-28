import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalyticsCharts = ({ data }) => {
    // Unify with UniHub design tokens
    const COLORS = ['#14B8A6', '#FACC15', '#FF6B6B', '#A7F3D0'];
    
    // Ensure we have valid data objects
    // The data prop might be a single event analytics object or an array of events
    // Based on the usage in AdminEventDashboard, it's passed 'analytics.events' (an array)
    // or 'data' for a single event. Let's make it robust.

    if (!data) return null;

    // If data is an array, we show an aggregate or pick the first one for this specific component
    // In our AdminDashboard, we pass an array to this component. 
    // Let's adapt to show aggregate stats if it's an array.

    const items = Array.isArray(data) ? data : [data];
    const totalCapacity = items.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const totalRegistered = items.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
    const totalAttended = items.reduce((acc, curr) => acc + (curr.attendedCount || 0), 0);

    const registrationData = [
        { name: 'SECURED', value: totalRegistered },
        { name: 'VACANT', value: Math.max(0, totalCapacity - totalRegistered) }
    ];

    const attendanceData = [
        { name: 'PRESENT', value: totalAttended },
        { name: 'ABSENT', value: Math.max(0, totalRegistered - totalAttended) }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-card border border-unihub-border rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-unihub-text mb-1">{payload[0].name}</p>
                    <p className="text-sm font-black text-unihub-teal">{payload[0].value} STUDENTS</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center">
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={registrationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {registrationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-black text-unihub-text leading-none">{((totalRegistered / totalCapacity) * 100).toFixed(0)}%</p>
                        <p className="text-[8px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">FILL RATE</p>
                    </div>
                </div>
                <h4 className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mt-2">Registration Engine</h4>
            </div>

            <div className="flex flex-col items-center">
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={attendanceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {attendanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} cornerRadius={10} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-black text-unihub-text leading-none">
                            {totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(0) : 0}%
                        </p>
                        <p className="text-[8px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">ATTENDANCE</p>
                    </div>
                </div>
                <h4 className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mt-2">Participation Metrics</h4>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
