import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderContent } from "@/components/ui/PlaceholderContent";

export default function BattlePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Battle"
        title="Hostile Takeover Arena"
        subtitle="Your numbers versus their numbers. May the biggest spender win."
      />
      <PlaceholderContent pageName="Battle System" taskNumber={20} />
    </div>
  );
}
