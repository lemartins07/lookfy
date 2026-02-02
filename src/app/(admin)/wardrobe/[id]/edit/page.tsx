import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WardrobeForm from "@/components/wardrobe/WardrobeForm";

export default async function WardrobeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Editar peca" />
      <WardrobeForm mode="edit" itemId={id} />
    </div>
  );
}
