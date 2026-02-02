import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WardrobeList from "@/components/wardrobe/WardrobeList";

export default function WardrobePage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Guarda-roupa" />
      <WardrobeList />
    </div>
  );
}
