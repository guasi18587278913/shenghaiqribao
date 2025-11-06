#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const knowledgeDir = path.join(__dirname, '../content/knowledge');

/**
 * Remove Steps and Callout components from MDX content
 */
function removeEnhancements(content) {
  let result = content;

  // Remove Steps/Step components - convert to numbered list
  result = result.replace(/<Steps>\s*/g, '\n');
  result = result.replace(/\s*<\/Steps>/g, '\n');
  result = result.replace(/<Step>\s*/g, '\n- ');
  result = result.replace(/\s*<\/Step>/g, '\n');

  // Remove Callout components - convert to simple text without blockquotes
  result = result.replace(/<Callout type="([^"]+)">\s*/g, '\n**[$1]** ');
  result = result.replace(/<Callout>\s*/g, '\n');
  result = result.replace(/\s*<\/Callout>/g, '\n\n');

  // Clean up multiple newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Process a single MDX file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if no enhancements
    if (!content.includes('<Steps') && !content.includes('<Callout')) {
      return { success: true, skipped: true };
    }

    // Split frontmatter and body
    const parts = content.split('---\n');
    if (parts.length < 3) {
      console.warn(`⚠️  Invalid frontmatter in ${filePath}`);
      return { success: false, error: 'Invalid frontmatter' };
    }

    const frontmatter = parts[1];
    const body = parts.slice(2).join('---\n');

    // Remove enhancements from body
    const processedBody = removeEnhancements(body);

    // Reconstruct file
    const newContent = `---\n${frontmatter}---\n${processedBody}`;

    // Write back
    fs.writeFileSync(filePath, newContent, 'utf8');

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Recursively process all MDX files in a directory
 */
function processDirectory(dir) {
  const results = {
    total: 0,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        results.total++;
        const relativePath = path.relative(knowledgeDir, fullPath);

        console.log(`Processing: ${relativePath}`);
        const result = processFile(fullPath);

        if (result.success) {
          if (result.skipped) {
            results.skipped++;
            console.log(`  ⏭  Skipped (no enhancements)`);
          } else {
            results.success++;
            console.log(`  ✅ Success`);
          }
        } else {
          results.failed++;
          results.errors.push({ file: relativePath, error: result.error });
          console.log(`  ❌ Failed: ${result.error}`);
        }
      }
    }
  }

  traverse(dir);
  return results;
}

// Main execution
console.log('🧹 Removing MDX enhancements...\n');

const results = processDirectory(knowledgeDir);

console.log('\n📊 Summary:');
console.log(`   Total files: ${results.total}`);
console.log(`   ✅ Processed: ${results.success}`);
console.log(`   ⏭  Skipped: ${results.skipped}`);
console.log(`   ❌ Failed: ${results.failed}`);

if (results.errors.length > 0) {
  console.log('\n❌ Errors:');
  results.errors.forEach(({ file, error }) => {
    console.log(`   ${file}: ${error}`);
  });
  process.exit(1);
}

console.log('\n✨ Done! All MDX enhancements have been removed.');
