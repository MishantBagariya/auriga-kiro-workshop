import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-500">This page doesn't exist.</p>
      <Link to="/dashboard">
        <Button className="mt-6">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
