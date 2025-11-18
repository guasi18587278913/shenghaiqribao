"use client";

import type { CategoryListQueryResult } from "@/sanity.types";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_FILTER_VALUE } from "../shared/combobox";
import HomeCategoryListItem from "./home-category-list-item";

export type HomeCategoryListClientProps = {
  categoryList: CategoryListQueryResult;
  urlPrefix: string;
};

export function HomeCategoryListClient({
  categoryList,
  urlPrefix,
}: HomeCategoryListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || DEFAULT_FILTER_VALUE;

  const categoryFilterItemList = [
    { value: DEFAULT_FILTER_VALUE, label: "All Categories" },
    ...categoryList.map((item) => ({
      value: item.slug.current,
      label: item.name,
    })),
  ];

  const handleFilterChange = (type: string, value: string) => {
    console.log(`Filter changed: ${type} -> ${value}`);
    const newParams = new URLSearchParams(window.location.search);
    if (value === null || value === DEFAULT_FILTER_VALUE) {
      newParams.delete(type);
    } else {
      newParams.set(type, value);
    }
    newParams.delete("page");
    router.push(`${urlPrefix}?${newParams.toString()}`);
  };

  return (
    <div className="hidden md:flex border rounded-lg p-4">
      <ul className="flex flex-col gap-y-2 w-full">
        {categoryFilterItemList.map((item) => (
          <HomeCategoryListItem
            key={item.label}
            title={item.label}
            active={item.value === selectedCategory}
            clickAction={() => handleFilterChange("category", item.value)}
          />
        ))}
      </ul>
    </div>
  );
}
