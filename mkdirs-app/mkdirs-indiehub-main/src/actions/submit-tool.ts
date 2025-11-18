"use server";

import { currentUser } from "@/lib/auth";
import type { SUPPORT_ITEM_ICON } from "@/lib/constants";
import { SubmitToolSchema } from "@/lib/schemas";
import { FreePlanStatus, PricePlans } from "@/lib/submission";
import { slugify } from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/client";
import { UserRole } from "@/types/user-role";
import { revalidatePath } from "next/cache";

type BaseSubmitFormToolData = {
  name: string;
  link: string;
  description: string;
  introduction: string;
  imageId: string;
  tags: string[];
  categories: string[];
  subcategory: string;
};

export type SubmitFormToolData = typeof SUPPORT_ITEM_ICON extends true
  ? BaseSubmitFormToolData & { iconId: string }
  : BaseSubmitFormToolData;

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  id?: string;
};

/**
 * https://nextjs.org/learn/dashboard-app/mutating-data
 */
export async function submitTool(
  formData: SubmitFormToolData,
): Promise<ServerActionResponse> {
  try {
    const user = await currentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return { status: "error", message: "Unauthorized" };
    }

    // console.log("submitTool, data:", formData);
    const {
      name,
      link,
      description,
      introduction,
      imageId,
      tags,
      categories,
      subcategory,
      ...rest
    } = SubmitToolSchema.parse(formData);
    const iconId = "iconId" in rest ? rest.iconId : undefined;
    console.log("submitTool, name:", name, "link:", link);

    // SubmitFormTool, selected categoryId: a600d17b-c459-47af-ac71-d0f46be38596 subcategoryId: 924911ab-947e-4693-bbae-f0890f834fd9
    // submitTool, categories: [ '924911ab-947e-4693-bbae-f0890f834fd9' ] subcategory: 924911ab-947e-4693-bbae-f0890f834fd9
    console.log("submitTool, categories:", categories, "subcategory:", subcategory);

    const slug = slugify(name);
    const data = {
      _type: "tool",
      name,
      slug: {
        _type: "slug",
        current: slug,
      },
      link,
      description,
      introduction,
      publishDate: new Date().toISOString(),

      paid: false,
      pricePlan: PricePlans.FREE,
      freePlanStatus: FreePlanStatus.APPROVED,
      submitter: {
        _type: "reference",
        _ref: user.id,
      },

      // The _key only needs to be unique within the array itself
      tags: tags.map((tag, index) => ({
        _type: "reference",
        _ref: tag,
        _key: index.toString(),
      })),
      categories: categories.map((category, index) => ({
        _type: "reference",
        _ref: category,
        _key: index.toString(),
      })),
      subcategory: {
        _type: "reference",
        _ref: subcategory,
      },
      image: {
        _type: "image",
        alt: `image of ${name}`,
        asset: {
          _type: "reference",
          _ref: imageId,
        },
      },
      icon: iconId
        ? {
            _type: "image",
            alt: `icon of ${name}`,
            asset: {
              _type: "reference",
              _ref: iconId,
            },
          }
        : undefined,
    };

    // console.log("submit, data:", data);

    const res = await sanityClient.create(data);
    if (!res) {
      console.log("submitTool, fail");
      return { status: "error", message: "Failed to submit tool" };
    }

    // console.log("submit, success, res:", res);

    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
    // Along with prefetching, this cache ensures that users can quickly navigate between routes
    // while reducing the number of requests made to the server.
    // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server.
    // You can do this with the revalidatePath function from Next.js.
    revalidatePath("/submitTool");

    return { status: "success", message: "Successfully created", id: res._id };
  } catch (error) {
    console.log("submitTool, error", error);
    return { status: "error", message: "Failed to submit tool" };
  }
}
