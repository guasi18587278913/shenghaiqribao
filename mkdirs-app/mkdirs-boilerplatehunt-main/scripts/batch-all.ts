import {
  importCategories,
  removeCategories,
  updateCategories,
} from "./batch-category";
import { importGroups, removeGroups, updateGroups } from "./batch-group";
import { importItems, removeItems, updateItems } from "./batch-item";
import {
  importItemsMicrolink,
  removeItemsMicrolink,
} from "./batch-item-microlink";
import { importTags, removeTags, updateTags } from "./batch-tag";

/**
 * Demo: Batch Operations Manager
 *
 * A centralized script to manage all batch operations across different entities
 * in the Sanity database.
 *
 * Features:
 * - Unified data cleanup
 * - Coordinated imports
 * - Bulk updates
 * - Sequential processing
 *
 * Available Operations:
 * 1. removeAll: Remove all data
 * 2. importAll: Import all data
 * 3. updateAll: Update all data
 *
 * Usage Examples:
 * ```typescript
 * // Clean everything
 * await removeAll();
 *
 * // Fresh import
 * await importAll();
 *
 * // Update everything
 * await updateAll();
 *
 * // Custom sequence
 * await removeAll();
 * await importGroups();
 * await importCategories();
 * await importTags();
 * await importItems();
 * ```
 */

export const removeAll = async () => {
  console.log("Removing all data...");

  try {
    // Remove in reverse order of dependencies
    await removeItems();
    await removeTags();
    await removeCategories();
    await removeGroups();

    console.log("All data removed successfully");
  } catch (error) {
    console.error("Error removing data:", error);
  }
};

export const importAll = async () => {
  console.log("Importing all data...");

  try {
    // Import in order of dependencies
    await importGroups();
    await importCategories();
    await importTags();
    await importItems();

    console.log("All data imported successfully");
  } catch (error) {
    console.error("Error importing data:", error);
  }
};

export const updateAll = async () => {
  console.log("Updating all data...");

  try {
    await updateGroups();
    await updateCategories();
    await updateTags();
    await updateItems();

    console.log("All data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

// get operation from command line
const operation = process.argv[2];

// run operation based on command line argument
const runOperation = async () => {
  switch (operation) {
    case "remove":
      await removeAll();
      break;
    case "import":
      await importAll();
      break;
    case "update":
      await updateAll();
      break;
    default:
      console.log(`
Available commands:
- remove: Remove all data
- import: Import all data
- update: Update all data
      `);
  }
};

// run operation
runOperation().catch(console.error);
