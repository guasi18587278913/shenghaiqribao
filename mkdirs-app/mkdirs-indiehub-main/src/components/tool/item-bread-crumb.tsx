import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ToolInfo } from "@/types";
import { HomeIcon } from "lucide-react";

interface ItemBreadCrumbProps {
  item: ToolInfo;
}

/**
 * breadcrumb for item
 */
export default function ItemBreadCrumb({ item }: ItemBreadCrumbProps) {
  return (
    <Breadcrumb className="text-base">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={"/"}>
            <div className="flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </div>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={"/tool"}>
            <span>Tools</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {/* show BreadcrumbLink if category is only one */}
          {item?.categories?.length === 1 && (
            <BreadcrumbLink
              // className="cursor-pointer"
              // href={`/tool?category=${item?.categories?.[0]?.slug?.current}`}
            >
              {item?.categories?.[0]?.name}
            </BreadcrumbLink>
          )}

          {/* show dropdown menu if category is more than one */}
          {/* {item?.categories?.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbLink
                  className="cursor-pointer"
                  href={`/tool?category=${item?.categories?.[0]?.slug?.current}`}
                >
                  {item?.categories?.[0]?.name}
                </BreadcrumbLink>
                <ChevronsUpDownIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {item?.categories?.map((category) => (
                  <DropdownMenuItem key={category.slug.current}>
                    <BreadcrumbLink
                      className="cursor-pointer w-full"
                      href={`/tool?category=${category.slug.current}`}
                    >
                      {category.name}
                    </BreadcrumbLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {/* subcategory */}
          {item?.subcategory && (
            <BreadcrumbLink
              className="cursor-pointer"
              href={`/tool?category=${item?.subcategory.slug.current}`}
            >
              {item?.subcategory.name}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{item?.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
