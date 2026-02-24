import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ itemId: string }>;
}

export default async function CatalogItemPage({ params }: Props) {
  const { itemId } = await params;
  const supabase = createClient();

  const { data: item } = await supabase.from("catalog_items").select("*").eq("id", itemId).single();

  if (!item) redirect("/catalog");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{item.name}</h1>
      <p className="mb-6 text-gray-600">{item.description}</p>

      <div className="space-y-6 rounded-xl border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm text-gray-500">Type</span>
            <p className="font-medium text-gray-900 capitalize">{item.item_type}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Category</span>
            <p className="font-medium text-gray-900">{item.category ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Price</span>
            <p className="font-medium text-gray-900">
              {item.price
                ? `₹${Number(item.price).toLocaleString("en-IN")} / ${item.price_unit}`
                : "Not set"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Stock</span>
            <p className="font-medium text-gray-900">
              {item.track_inventory ? `${item.stock_quantity} units` : "Not tracked"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
