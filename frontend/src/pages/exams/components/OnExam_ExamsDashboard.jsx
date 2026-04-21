import { useState } from 'react';
import { 
    BookOpen, 
    TrendingUp, 
    Clock, 
    Award, 
    PlayCircle,
    ChevronRight,
    Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 68 },
  { name: 'Wed', score: 74 },
  { name: 'Thu', score: 72 },
  { name: 'Fri', score: 85 },
  { name: 'Sat', score: 88 },
  { name: 'Sun', score: 92 },
];

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-soft hover:shadow-card transition-all group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-800">{value}</h3>
                <p className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-2xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const ExamsDashboard = ({ setActiveSection }) => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Exams" 
                    value="24" 
                    subtitle="+3 this week" 
                    icon={BookOpen} 
                    colorClass="bg-unihub-teal/10 text-unihub-teal" 
                />
                <StatCard 
                    title="Average Score" 
                    value="82%" 
                    subtitle="Top 15% of class" 
                    icon={TrendingUp} 
                    colorClass="bg-unihub-teal/10 text-unihub-teal" 
                />
                <StatCard 
                    title="Time Spent" 
                    value="18h" 
                    subtitle="In practice sessions" 
                    icon={Clock} 
                    colorClass="bg-unihub-coral/10 text-unihub-coral" 
                />
                <StatCard 
                    title="Performance" 
                    value="Excellent" 
                    subtitle="Consistent growth" 
                    icon={Award} 
                    colorClass="bg-unihub-yellow/10 text-unihub-yellow" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-soft">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-unihub-teal" />
                            Score Trend (Last 7 Days)
                        </h2>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#14B8A6" 
                                    strokeWidth={4} 
                                    dot={{ r: 4, strokeWidth: 2 }} 
                                    activeDot={{ r: 8 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-unihub-teal to-[#0d857a] rounded-3xl p-6 shadow-card text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => setActiveSection('practice')}>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                        <PlayCircle className="w-10 h-10 mb-4 opacity-80" />
                        <h3 className="text-2xl font-black mb-1">Start New Exam</h3>
                        <p className="text-white/80 text-sm mb-6">Jump back into your custom practice sessions.</p>
                        <div className="flex items-center gap-2 text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            Begin Now <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-soft">
                        <h3 className="font-bold text-gray-800 mb-4">Recommended Topics</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-teal/30 cursor-pointer transition-colors" onClick={() => setActiveSection('qbank')}>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Advanced Networking</p>
                                    <p className="text-xs text-unihub-coral font-medium mt-0.5">Weak Area - 45% Accuracy</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-teal/30 cursor-pointer transition-colors" onClick={() => setActiveSection('qbank')}>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Operating Systems</p>
                                    <p className="text-xs text-unihub-yellow font-medium mt-0.5">Needs Review - 60% Accuracy</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamsDashboard;
