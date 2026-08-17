import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="font-mono text-xs text-text-faint">ERROR 404</p>
      <h1 className="font-display text-2xl font-semibold">Screen not found</h1>
      <p className="text-sm text-text-muted">There's no route here — even a classic USSD session would reject this option.</p>
      <Link to="/">
        <Button variant="primary">← Return Home</Button>
      </Link>
    </div>
  );
}
