import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderContent } from "@/components/ui/PlaceholderContent";

export default function LeaderboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Leaderboard"
        title="Board of Directors"
        subtitle="Ranked by a totally fair algorithm that definitely doesn't factor in spending."
      />
      <PlaceholderContent pageName="Leaderboard" taskNumber={23} />
    </div>
  );
}
