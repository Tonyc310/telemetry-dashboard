import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Telemetry dashboard</h1>
      <Dashboard />
    </main>
  );
}
