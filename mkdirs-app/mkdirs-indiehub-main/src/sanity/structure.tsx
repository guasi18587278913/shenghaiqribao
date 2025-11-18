import {
  BillIcon,
  CheckmarkCircleIcon,
  ClockIcon,
  CloseCircleIcon,
  CogIcon,
  ColorWheelIcon,
  ComponentIcon,
  ConfettiIcon,
  DashboardIcon,
  DiamondIcon,
  DocumentTextIcon,
  DocumentsIcon,
  MasterDetailIcon,
  ProjectsIcon,
  StarFilledIcon,
  TagsIcon,
  TaskIcon,
  TiersIcon,
  TokenIcon,
  UserIcon,
  UsersIcon,
} from "@sanity/icons";
import type { DocumentDefinition } from "sanity";
import type { StructureResolver } from "sanity/structure";
import { schemaTypes } from "./schemas";
import account from "./schemas/documents/auth/account";
import passwordResetToken from "./schemas/documents/auth/password-reset-token";
import user from "./schemas/documents/auth/user";
import verificationToken from "./schemas/documents/auth/verification-token";
import blogCategory from "./schemas/documents/blog/blog-category";
import blogPost from "./schemas/documents/blog/blog-post";
import category from "./schemas/documents/directory/category";
import collection from "./schemas/documents/directory/collection";
import group from "./schemas/documents/directory/group";
import item from "./schemas/documents/directory/item";
import tag from "./schemas/documents/directory/tag";
import order from "./schemas/documents/order/order";
import page from "./schemas/documents/page/page";
import settings from "./schemas/documents/settings";
import tool from "./schemas/documents/tool/tool";
import toolCategory from "./schemas/documents/tool/toolCategory";
import toolCollection from "./schemas/documents/tool/toolCollection";
import toolOrder from "./schemas/documents/tool/toolOrder";
import toolSubcategory from "./schemas/documents/tool/toolSubcategory";
import toolTag from "./schemas/documents/tool/toolTag";

const singletonTypes: DocumentDefinition[] = [settings];

// The StructureResolver is how we're changing the DeskTool structure to linking to document (named Singleton)
// demo: https://github.com/javayhu/sanity-press/blob/main/sanity/src/structure.ts#L7
export const structure = (
  /* typeDefArray: DocumentDefinition[] */
): StructureResolver => {
  return (S) => {
    // Goes through all of the singletons and translates them into something the Structure tool can understand
    const singletonItems = singletonTypes.map((singletonType) => {
      return S.listItem()
        .title(singletonType.title ?? "")
        .icon(CogIcon)
        .child(
          S.editor()
            .id(singletonType.name)
            .schemaType(singletonType.name)
            .documentId(singletonType.name),
        );
    });

    // other list items (like MediaTag)
    const otherListItems = S.documentTypeListItems().filter(
      (listItem) => !schemaTypes.find((type) => type.name === listItem.getId()),
    );

    // helper function
    const createFilteredListItem = (
      title: string,
      schemaType: string,
      icon: React.ComponentType<{ className?: string }>,
      filter: string,
    ) => {
      return S.listItem()
        .title(title)
        .schemaType(schemaType)
        .icon(icon)
        .child(
          S.documentList().schemaType(schemaType).title(title).filter(filter),
        );
    };

    // submissions in free plan
    const pendingSubmissionsInFreePlan = createFilteredListItem(
      "Pending Submissions In Free Plan",
      item.name,
      ClockIcon,
      '_type == "item" && pricePlan == "free" && freePlanStatus == "pending"',
    );

    const rejectedSubmissionsInFreePlan = createFilteredListItem(
      "Rejected Submissions In Free Plan",
      item.name,
      CloseCircleIcon,
      '_type == "item" && pricePlan == "free" && freePlanStatus == "rejected"',
    );

    const approvedSubmissionsInFreePlan = createFilteredListItem(
      "Approved Submissions In Free Plan",
      item.name,
      CheckmarkCircleIcon,
      '_type == "item" && pricePlan == "free" && freePlanStatus == "approved"',
    );

    const itemsInFreePlan = createFilteredListItem(
      "All Items In Free Plan",
      item.name,
      ProjectsIcon,
      '_type == "item" && pricePlan == "free"',
    );

    const freePlanItemManagement = S.listItem()
      .title("Free Plan Item management")
      .icon(ProjectsIcon)
      .child(
        S.list()
          .title("Item management")
          .items([
            pendingSubmissionsInFreePlan,
            rejectedSubmissionsInFreePlan,
            approvedSubmissionsInFreePlan,
            itemsInFreePlan,
          ]),
      );

    // submissions in basic plan
    const pendingSubmissionsInBasicPlan = createFilteredListItem(
      "Pending Submissions In Basic Plan",
      item.name,
      ClockIcon,
      '_type == "item" && pricePlan == "basic" && basicPlanStatus == "pending"',
    );

    const failedSubmissionsInBasicPlan = createFilteredListItem(
      "Failed Submissions In Basic Plan",
      item.name,
      CloseCircleIcon,
      '_type == "item" && pricePlan == "basic" && basicPlanStatus == "failed"',
    );

    const successSubmissionsInBasicPlan = createFilteredListItem(
      "Success Submissions In Basic Plan",
      item.name,
      CheckmarkCircleIcon,
      '_type == "item" && pricePlan == "basic" && basicPlanStatus == "success"',
    );

    const itemsInBasicPlan = createFilteredListItem(
      "All Items In Basic Plan",
      item.name,
      DiamondIcon,
      '_type == "item" && pricePlan == "basic"',
    );

    const basicPlanItemManagement = S.listItem()
      .title("Basic Plan Item management")
      .icon(DiamondIcon)
      .child(
        S.list()
          .title("Item management")
          .items([
            pendingSubmissionsInBasicPlan,
            failedSubmissionsInBasicPlan,
            successSubmissionsInBasicPlan,
            itemsInBasicPlan,
          ]),
      );

    // submissions in pro plan
    const pendingSubmissionsInProPlan = createFilteredListItem(
      "Pending Submissions In Pro Plan",
      item.name,
      ClockIcon,
      '_type == "item" && pricePlan == "pro" && proPlanStatus == "pending"',
    );

    const failedSubmissionsInProPlan = createFilteredListItem(
      "Failed Submissions In Pro Plan",
      item.name,
      CloseCircleIcon,
      '_type == "item" && pricePlan == "pro" && proPlanStatus == "failed"',
    );

    const successSubmissionsInProPlan = createFilteredListItem(
      "Success Submissions In Pro Plan",
      item.name,
      CheckmarkCircleIcon,
      '_type == "item" && pricePlan == "pro" && proPlanStatus == "success"',
    );

    const itemsInProPlan = createFilteredListItem(
      "All Items In Pro Plan",
      item.name,
      DiamondIcon,
      '_type == "item" && pricePlan == "pro"',
    );

    const proPlanItemManagement = S.listItem()
      .title("Pro Plan Item management")
      .icon(DiamondIcon)
      .child(
        S.list()
          .title("Item management")
          .items([
            pendingSubmissionsInProPlan,
            failedSubmissionsInProPlan,
            successSubmissionsInProPlan,
            itemsInProPlan,
          ]),
      );

    // featured items
    const featuredItems = createFilteredListItem(
      "Featured Items",
      item.name,
      StarFilledIcon,
      '_type == "item" && featured == true',
    );

    // sponsor items
    const sponsorItems = createFilteredListItem(
      "Sponsor Items",
      item.name,
      ConfettiIcon,
      '_type == "item" && sponsor == true',
    );

    // published items
    const publishedItems = createFilteredListItem(
      "Published Items",
      item.name,
      TaskIcon,
      '_type == "item" && publishDate != null',
    );

    const unpublishedItems = createFilteredListItem(
      "Unpublished Items",
      item.name,
      ClockIcon,
      '_type == "item" && publishDate == null',
    );

    const allItems = S.documentTypeListItem(item.name)
      .title("All Items")
      .icon(DashboardIcon);

    const itemsBySubmitter = S.listItem()
      .title("Items By Submitter")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(user.name)
          .title("Items by Submitter")
          .child((userId) =>
            S.documentList()
              .title("Items")
              .filter('_type == "item" && submitter._ref == $userId')
              .params({ userId }),
          ),
      );

    // failed orders
    const failedOrders = createFilteredListItem(
      "Failed Orders",
      order.name,
      CloseCircleIcon,
      '_type == "order" && status == "failed"',
    );

    // success orders
    const successOrders = createFilteredListItem(
      "Success Orders",
      order.name,
      CheckmarkCircleIcon,
      '_type == "order" && status == "success"',
    );

    // all orders
    const allOrders = S.documentTypeListItem(order.name)
      .title("All Orders")
      .icon(BillIcon);

    // collections
    const allCollections = S.documentTypeListItem(collection.name)
      .title("All Collections")
      .icon(TiersIcon);

    const itemsByCollection = S.listItem()
      .title("Items By Collection")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(collection.name)
          .title("Items by Collection")
          .child((collectionId) =>
            S.documentList()
              .title("Items")
              .filter('_type == "item" && $collectionId in collections[]._ref')
              .params({ collectionId }),
          ),
      );

    // groups
    const allGroups = S.documentTypeListItem(group.name)
      .title("All Groups")
      .icon(TiersIcon);

    const categoriesByGroup = S.listItem()
      .title("Categories By Group")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(group.name)
          .title("Categories by Group")
          .child((groupId) =>
            S.documentList()
              .title("Categories")
              .filter('_type == "category" && $groupId == group._ref')
              .params({ groupId }),
          ),
      );

    // categories
    const allCategories = S.documentTypeListItem(category.name)
      .title("All Categories")
      .icon(TiersIcon);

    const itemsByCategory = S.listItem()
      .title("Items By Category")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(category.name)
          .title("Items by Category")
          .child((categoryId) =>
            S.documentList()
              .title("Items")
              .filter('_type == "item" && $categoryId in categories[]._ref')
              .params({ categoryId }),
          ),
      );

    // tags
    const allTags = S.documentTypeListItem(tag.name)
      .title("All Tags")
      .icon(TagsIcon);

    const itemsByTag = S.listItem()
      .title("Items By Tag")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(tag.name)
          .title("Items by Tag")
          .child((tagId) =>
            S.documentList()
              .title("Posts")
              .filter('_type == "item" && $tagId in tags[]._ref')
              .params({ tagId }),
          ),
      );

    /** tool start */

    // submissions in free plan
    const pendingToolSubmissionsInFreePlan = createFilteredListItem(
      "Pending Tool Submissions In Free Plan",
      tool.name,
      ClockIcon,
      '_type == "tool" && pricePlan == "free" && freePlanStatus == "pending"',
    );

    const rejectedToolSubmissionsInFreePlan = createFilteredListItem(
      "Rejected Tool Submissions In Free Plan",
      tool.name,
      CloseCircleIcon,
      '_type == "tool" && pricePlan == "free" && freePlanStatus == "rejected"',
    );

    const approvedToolSubmissionsInFreePlan = createFilteredListItem(
      "Approved Tool Submissions In Free Plan",
      tool.name,
      CheckmarkCircleIcon,
      '_type == "tool" && pricePlan == "free" && freePlanStatus == "approved"',
    );

    const toolsInFreePlan = createFilteredListItem(
      "All Tools In Free Plan",
      tool.name,
      ProjectsIcon,
      '_type == "tool" && pricePlan == "free"',
    );

    const freePlanToolManagement = S.listItem()
      .title("Free Plan Tool management")
      .icon(ProjectsIcon)
      .child(
        S.list()
          .title("Tool management")
          .items([
            pendingToolSubmissionsInFreePlan,
            rejectedToolSubmissionsInFreePlan,
            approvedToolSubmissionsInFreePlan,
            toolsInFreePlan,
          ]),
      );

    // submissions in pro plan
    const pendingToolSubmissionsInProPlan = createFilteredListItem(
      "Pending Tool Submissions In Pro Plan",
      tool.name,
      ClockIcon,
      '_type == "tool" && pricePlan == "pro" && proPlanStatus == "pending"',
    );

    const failedToolSubmissionsInProPlan = createFilteredListItem(
      "Failed Tool Submissions In Pro Plan",
      tool.name,
      CloseCircleIcon,
      '_type == "tool" && pricePlan == "pro" && proPlanStatus == "failed"',
    );

    const successToolSubmissionsInProPlan = createFilteredListItem(
      "Success Tool Submissions In Pro Plan",
      tool.name,
      CheckmarkCircleIcon,
      '_type == "tool" && pricePlan == "pro" && proPlanStatus == "success"',
    );

    const toolsInProPlan = createFilteredListItem(
      "All Tools In Pro Plan",
      tool.name,
      DiamondIcon,
      '_type == "tool" && pricePlan == "pro"',
    );

    const proPlanToolManagement = S.listItem()
      .title("Pro Plan Tool management")
      .icon(DiamondIcon)
      .child(
        S.list()
          .title("Tool management")
          .items([
            pendingToolSubmissionsInProPlan,
            failedToolSubmissionsInProPlan,
            successToolSubmissionsInProPlan,
            toolsInProPlan,
          ]),
      );

    // featured items
    const featuredTools = createFilteredListItem(
      "Featured Tools",
      tool.name,
      StarFilledIcon,
      '_type == "tool" && featured == true',
    );

    // sponsor items
    const sponsorTools = createFilteredListItem(
      "Sponsor Tools",
      tool.name,
      ConfettiIcon,
      '_type == "tool" && sponsor == true',
    );

    // published items
    const publishedTools = createFilteredListItem(
      "Published Tools",
      tool.name,
      TaskIcon,
      '_type == "tool" && publishDate != null',
    );

    const unpublishedTools = createFilteredListItem(
      "Unpublished Tools",
      tool.name,
      ClockIcon,
      '_type == "tool" && publishDate == null',
    );

    const allToolItems = S.documentTypeListItem(tool.name)
      .title("All Tools")
      .icon(DashboardIcon);

    const toolsBySubmitter = S.listItem()
      .title("Tools By Submitter")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(user.name)
          .title("Tools by Submitter")
          .child((userId) =>
            S.documentList()
              .title("Tools")
              .filter('_type == "tool" && submitter._ref == $userId')
              .params({ userId }),
          ),
      );

    // failed orders
    const failedToolOrders = createFilteredListItem(
      "Failed Tool Orders",
      toolOrder.name,
      CloseCircleIcon,
      '_type == "toolOrder" && status == "failed"',
    );

    // success orders
    const successToolOrders = createFilteredListItem(
      "Success Tool Orders",
      toolOrder.name,
      CheckmarkCircleIcon,
      '_type == "toolOrder" && status == "success"',
    );

    // all orders
    const allToolOrders = S.documentTypeListItem(toolOrder.name)
      .title("All Tool Orders")
      .icon(BillIcon);

    // collections
    const allToolCollections = S.documentTypeListItem(toolCollection.name)
      .title("All Tool Collections")
      .icon(TiersIcon);

    const toolsByCollection = S.listItem()
      .title("Tools By Collection")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(toolCollection.name)
          .title("Tools by Collection")
          .child((collectionId) =>
            S.documentList()
              .title("Tools")
              .filter('_type == "tool" && $collectionId in collections[]._ref')
              .params({ collectionId }),
          ),
      );

    // categories
    const allToolCategories = S.documentTypeListItem(toolCategory.name)
      .title("All Tool Categories")
      .icon(TiersIcon);

    const toolsByCategory = S.listItem()
      .title("Tools By Category")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(toolCategory.name)
          .title("Tools by Category")
          .child((categoryId) =>
            S.documentList()
              .title("Tools")
              .filter('_type == "tool" && $categoryId in categories[]._ref')
              .params({ categoryId }),
          ),
      );

    // subcategories
    const allToolSubcategories = S.documentTypeListItem(toolSubcategory.name)
      .title("All Tool Subcategories")
      .icon(TiersIcon);

    const toolsBySubcategory = S.listItem()
      .title("Tools By Subcategory")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(toolSubcategory.name)
          .title("Tools by Subcategory")
          .child((subcategoryId) =>
            S.documentList()
              .title("Tools")
              .filter('_type == "tool" && $subcategoryId == subcategory._ref')
              .params({ subcategoryId }),
          ),
      );

    // tags
    const allToolTags = S.documentTypeListItem(toolTag.name)
      .title("All Tool Tags")
      .icon(TagsIcon);

    const toolsByTag = S.listItem()
      .title("Tools By Tag")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(toolTag.name)
          .title("Tools by Tag")
          .child((tagId) =>
            S.documentList()
              .title("Tools")
              .filter('_type == "tool" && $tagId in tags[]._ref')
              .params({ tagId }),
          ),
      );

    /** tool end */

    // blog categories
    const allBlogCategories = S.documentTypeListItem(blogCategory.name)
      .title("All Blog Categories")
      .icon(ComponentIcon);

    const postsByCategory = S.listItem()
      .title("Posts By Category")
      .icon(MasterDetailIcon)
      .child(
        S.documentTypeList(blogCategory.name)
          .title("Posts by Category")
          .child((categoryId) =>
            S.documentList()
              .title("Posts")
              .filter('_type == "blogPost" && $categoryId in categories[]._ref')
              .params({ categoryId }),
          ),
      );

    return S.list()
      .title("Content")
      .items([
        // pendingSubmissionsInFreePlan,
        // S.divider(),

        // S.documentTypeListItem(item.name)
        //   .icon(DashboardIcon),
        // group the item management

        S.listItem()
          .title("Item management")
          .icon(DashboardIcon)
          .child(
            S.list().title("Item management").items([
              allItems,
              freePlanItemManagement,
              basicPlanItemManagement,
              proPlanItemManagement,
              S.divider(),

              sponsorItems,
              featuredItems,
              publishedItems,
              unpublishedItems,

              S.divider(),
              itemsBySubmitter,
              itemsByCategory,
              itemsByCollection,
              itemsByTag,
            ]),
          ),

        S.listItem()
          .title("Collection management")
          .icon(ColorWheelIcon)
          .child(
            S.list()
              .title("Collection management")
              .items([allCollections, itemsByCollection]),
          ),

        S.listItem()
          .title("Group management")
          .icon(TiersIcon)
          .child(
            S.list()
              .title("Group management")
              .items([allGroups, categoriesByGroup]),
          ),

        // S.documentTypeListItem(category.name)
        //   .icon(TiersIcon),
        S.listItem()
          .title("Category management")
          .icon(TiersIcon)
          .child(
            S.list()
              .title("Category management")
              .items([allCategories, itemsByCategory]),
          ),

        // S.documentTypeListItem(tag.name)
        //   .icon(TagsIcon),
        S.listItem()
          .title("Tag management")
          .icon(TagsIcon)
          .child(S.list().title("Tag management").items([allTags, itemsByTag])),

        S.divider(),

        /** tool start */

        S.listItem()
          .title("Tool management")
          .icon(DashboardIcon)
          .child(
            S.list().title("Tool management").items([
              allToolItems,
              freePlanToolManagement,
              proPlanToolManagement,
              S.divider(),

              sponsorTools,
              featuredTools,
              publishedTools,
              unpublishedTools,

              S.divider(),
              toolsBySubmitter,
              toolsByCategory,
              toolsByTag,
            ]),
          ),

        S.listItem()
          .title("Tool Collection management")
          .icon(ColorWheelIcon)
          .child(
            S.list()
              .title("Tool Collection management")
              .items([allToolCollections, toolsByCollection]),
          ),

        S.listItem()
          .title("Tool Category management")
          .icon(TiersIcon)
          .child(
            S.list()
              .title("Tool Category management")
              .items([allToolCategories, toolsByCategory]),
          ),

        S.listItem()
          .title("Tool Subcategory management")
          .icon(TiersIcon)
          .child(
            S.list()
              .title("Tool Subcategory management")
              .items([allToolSubcategories, toolsBySubcategory]),
          ),

        S.listItem()
          .title("Tool Tag management")
          .icon(TagsIcon)
          .child(
            S.list()
              .title("Tool Tag management")
              .items([allToolTags, toolsByTag]),
          ),

        S.listItem()
          .title("Tool Order management")
          .icon(BillIcon)
          .child(
            S.list()
              .title("Tool Order management")
              .items([
                successToolOrders,
                failedToolOrders,
                S.divider(),
                allToolOrders,
              ]),
          ),

        /** tool end */

        S.divider(),

        S.documentTypeListItem(blogPost.name).icon(DocumentsIcon),
        // S.documentTypeListItem(blogCategory.name)
        //   .icon(TiersIcon),

        S.listItem()
          .title("Blog Category management")
          .icon(ComponentIcon)
          .child(
            S.list()
              .title("Blog Category management")
              .items([allBlogCategories, postsByCategory]),
          ),

        S.divider(),

        // group the order management
        // S.documentTypeListItem(order.name)
        //   .icon(BillIcon),
        S.listItem()
          .title("Order management")
          .icon(BillIcon)
          .child(
            S.list()
              .title("Order management")
              .items([successOrders, failedOrders, S.divider(), allOrders]),
          ),

        S.divider(),

        // group the user management
        S.listItem()
          .title("User management")
          .icon(UsersIcon)
          .child(
            S.list()
              .title("User management")
              .items([
                S.documentTypeListItem(user.name).icon(UserIcon),
                S.documentTypeListItem(account.name).icon(UsersIcon),
                S.documentTypeListItem(verificationToken.name).icon(TokenIcon),
                S.documentTypeListItem(passwordResetToken.name).icon(TokenIcon),
              ]),
          ),

        S.divider(),

        S.documentTypeListItem(page.name).icon(DocumentTextIcon),

        S.divider(),

        ...singletonItems,

        S.divider(),

        ...otherListItems,
      ]);
  };
};
