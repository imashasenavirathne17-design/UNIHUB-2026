import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { Target, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

const mockProgress = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 68 },
  { name: 'Week 3', score: 74 },
  { name: 'Week 4', score: 82 },
  { name: 'Week 5', score: 85 },
];

const mockSubjectPerf = [
    { subject: 'Networks', score: 88, fullMark: 100 },
    { subject: 'Databases', score: 65, fullMark: 100 },
    { subject: 'Software Eng', score: 92, fullMark: 100 },
    { subject: 'Algorithms', score: 70, fullMark: 100 },
    { subject: 'Security', score: 85, fullMark: 100 },
];

const PerformanceAnalytics = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-unihub-teal to-[#0d857a] p-6 rounded-3xl text-white shadow-soft">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/80 font-medium text-sm">Overall Growth</p>
                    <h3 className="text-3xl font-black">+24%</h3>
                    <p className="text-xs text-white/60 mt-2">Since last month</p>
                </div>
                <div className="bg-gradient-to-br from-unihub-coral to-[#de3047] p-6 rounded-3xl text-white shadow-soft">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/80 font-medium text-sm">Accuracy Rate</p>
                    <h3 className="text-3xl font-black">82%</h3>
                    <p className="text-xs text-white/60 mt-2">Top 15% in class</p>
                </div>
                <div className="bg-gradient-to-br from-unihub-yellow to-[#d97706] p-6 rounded-3xl text-white shadow-soft">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/80 font-medium text-sm">Avg. Response Time</p>
                    <h3 className="text-3xl font-black">45s</h3>
                    <p className="text-xs text-white/60 mt-2">-12s improvement</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-gray-100 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-unihub-teal" /> Score Progression
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockProgress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5'}}
                                />
                                <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-gray-100 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-unihub-teal" /> Subject Mastery
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockSubjectPerf}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Radar name="Student" dataKey="score" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-white border-l-4 border-unihub-teal rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="bg-unihub-teal/10 p-3 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-unihub-teal" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">AI Performance Insight</h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        Your performance in Software Engineering is exceptional (Top 5%). However, Databases require attention, particularly in SQL subqueries. We recommend taking 3 short practice quizzes focused purely on Databases this week to level up your mastery.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
