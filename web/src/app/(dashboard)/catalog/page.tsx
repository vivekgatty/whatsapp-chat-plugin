"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import type { CatalogItem } from "@/types";

export default function CatalogPage() {
  // TODO: Fetch catalog items
  const items: CatalogItem[] = [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
          <p className="text-sm text-gray-500">Products and services your business offers</p>
        </div>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No catalog items yet"
          description="Add your products or services to quickly create orders in conversations."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/catalog/${item.id}`}
              className="rounded-xl border bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{item.name}</span>
                {!item.is_available && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    Unavailable
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{item.category ?? item.item_type}</span>
                <span className="font-semibold text-gray-900">
                  {item.price
                    ? `₹${Number(item.price).toLocaleString("en-IN")}`
                    : "Price on request"}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
