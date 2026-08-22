import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
      {NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
              isActive ? "text-indigo-700" : "text-slate-500"
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
