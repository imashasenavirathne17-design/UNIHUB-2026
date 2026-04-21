import { useState } from 'react';
import { Users, FileDiff, Edit, Trash2, PlusCircle } from 'lucide-react';

const mockStudents = [
    { id: 1, name: 'Alice Smith', exams: 12, avgScore: 88, status: 'Top Performer' },
    { id: 2, name: 'Bob Johnson', exams: 5, avgScore: 65, status: 'Needs Review' },
    { id: 3, name: 'Charlie Brown', exams: 8, avgScore: 75, status: 'On Track' },
];

const mockManageExams = [
    { id: 101, title: 'Midterm Computing', active: true, enrollments: 120 },
    { id: 102, title: 'Database Basics', active: false, enrollments: 85 },
];

const AdminView = () => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-white/50 p-6 rounded-3xl border border-white backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">Lecturer Control Panel</h2>
                    <p className="text-sm font-medium text-gray-500">Manage exams, questions, and view student performance analytics.</p>
                </div>
                <button className="flex items-center gap-2 bg-unihub-teal text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#0d857a] transition-colors">
                    <PlusCircle className="w-5 h-5"/> Create New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Student Analytics */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5 text-unihub-teal"/> Student Overview</h3>
                        <span className="text-xs font-bold text-unihub-teal bg-unihub-teal/10 px-3 py-1 rounded-full cursor-pointer hover:bg-unihub-teal/20">View All</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Student Name</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Exams</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Score</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-bold text-gray-800 text-sm">{s.name}</td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{s.exams}</td>
                                        <td className="py-3 px-4 text-gray-800 font-bold text-sm">{s.avgScore}%</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                s.status === 'Top Performer' ? 'bg-unihub-teal/10 text-unihub-teal' :
                                                s.status === 'Needs Review' ? 'bg-unihub-coral/10 text-unihub-coral' :
                                                'bg-unihub-yellow/10 text-unihub-yellow'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manage Active Exams */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileDiff className="w-5 h-5 text-unihub-teal"/> Active Exams</h3>
                    </div>

                    <div className="space-y-4">
                        {mockManageExams.map(exam => (
                            <div key={exam.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-teal/30 transition-all group">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">{exam.title}</h4>
                                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                        <span className={`px-2 py-0.5 rounded text-white ${exam.active ? 'bg-unihub-teal' : 'bg-gray-400'}`}>
                                            {exam.active ? 'Active' : 'Draft'}
                                        </span>
                                        <span>• {exam.enrollments} Enrolled</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg bg-unihub-teal/10 text-unihub-teal hover:bg-unihub-teal/20 transition-colors"><Edit className="w-4 h-4"/></button>
                                    <button className="p-2 rounded-lg bg-unihub-coral/10 text-unihub-coral hover:bg-unihub-coral/20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-auto mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center font-bold text-gray-500 hover:border-unihub-teal/40 hover:text-unihub-teal hover:bg-unihub-teal/5 transition-all flex items-center justify-center gap-2">
                        <PlusCircle className="w-5 h-5"/> Quick Draft
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
