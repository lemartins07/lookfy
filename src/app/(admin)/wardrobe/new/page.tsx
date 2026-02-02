import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WardrobeForm from "@/components/wardrobe/WardrobeForm";

export default function WardrobeNewPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Adicionar peça" />
      <WardrobeForm mode="create" />
    </div>
  );
}
