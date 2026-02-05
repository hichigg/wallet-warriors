import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderContent } from "@/components/ui/PlaceholderContent";

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Shop"
        title="The Trading Floor"
        subtitle="Convert real money into fake money. The American Dream, digitized."
      />
      <PlaceholderContent pageName="CrunchCoin Shop" taskNumber={14} />
    </div>
  );
}
