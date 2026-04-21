import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function AdminLayout() {
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="font-['Inter'] min-h-screen w-full bg-white text-black flex flex-col md:flex-row shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black bg-white flex flex-col shrink-0 min-h-[60px] md:min-h-screen">
        <div className="p-6 border-b border-black flex items-center justify-between md:justify-start">
          <h1 className="text-xl font-bold tracking-tight uppercase">Admin</h1>
        </div>
        <nav className="flex-grow flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-4 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border border-transparent ${
                  isActive
                    ? "bg-black text-white"
                    : "text-black hover:border-black"
                }`
              }
            >
              <item.icon className="w-5 h-5 stroke-[1.5px]" />
              <span className="hidden md:inline">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-black hidden md:block">
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-black hover:border-black border border-transparent transition-colors">
            <LogOut className="w-5 h-5 stroke-[1.5px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col bg-white overflow-y-auto w-full">
        <div className="px-8 py-6 border-b border-black flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="border border-black px-3 py-1 rounded-full uppercase text-xs">Live</span>
          </div>
        </div>
        <div className="p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
