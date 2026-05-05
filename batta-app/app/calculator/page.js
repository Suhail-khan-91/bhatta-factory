import CalculatorWidget from "@/components/calculator/CalculatorWidget";

export const metadata = {
  title: "Calculator — Batta",
  description: "Quick on-site calculator with history log.",
};

export default function CalculatorPage() {
  return (
    // Fill the viewport height minus the 64px bottom nav bar (pb-20 = 5rem is set on <main>)
    <div className="h-[calc(100dvh-5rem)]">
      <CalculatorWidget />
    </div>
  );
}
