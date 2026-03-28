import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthContext } from "../context/AuthContext";

const AppLayout = () => {
    const { user } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Role-based logic for Sidebar/Navbar visibility
    // If no user is logged in, show a clean marketing layout (no platform shell)
    if (!user) {
        return (
            <main className="min-h-screen bg-white">
                <Outlet />
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-unihub-teal/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-unihub-coral/5 blur-[120px] rounded-full" />
                </div>
                
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
