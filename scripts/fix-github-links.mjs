/**
 * Convert GitHub wiki URLs to relative wiki-book links.
 * 
 * Reads all wiki-book docs, builds a mapping from wiki entity/concept slugs
 * to wiki-book filenames, then replaces all GitHub URLs with relative links.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const DOCS_DIR = join(process.cwd(), 'docs');

// Step 1: Build mapping from wiki slug → wiki-book filename
console.log('Building slug mapping...');
const slugMap = new Map(); // wiki-slug → wiki-book-filename (without .md)
const files = readdirSync(DOCS_DIR).filter(f => f.endsWith('.md') && f.startsWith('ch'));

for (const file of files) {
  const content = readFileSync(join(DOCS_DIR, file), 'utf-8');
  const bookSlug = file.replace('.md', '');
  
  // Extract wiki entity reference: `entities/slug.md` or `concepts/slug.md`
  const entityMatch = content.match(/`(?:entities|concepts|comparisons|queries|moc)\/([^`]+)\.md`/);
  if (entityMatch) {
    const wikiSlug = entityMatch[1];
    slugMap.set(wikiSlug, bookSlug);
  }
  
  // Also map by filename similarity
  const fileSlug = file.replace(/^ch\d+-\d+-/, '').replace('.md', '');
  if (fileSlug) {
    slugMap.set(fileSlug, bookSlug);
  }
}

console.log(`Mapped ${slugMap.size} slugs`);

// Step 2: Replace GitHub URLs in all files
let totalReplaced = 0;
let filesModified = 0;

for (const file of files) {
  const filepath = join(DOCS_DIR, file);
  let content = readFileSync(filepath, 'utf-8');
  const original = content;
  
  // Pattern: [text](https://github.com/QianJinGuo/wiki/blob/main/TYPE/SLUG.md)
  content = content.replace(
    /\[([^\]]+)\]\(https:\/\/github\.com\/QianJinGuo\/wiki\/blob\/main\/(?:entities|concepts|comparisons|queries|moc)\/([^)]+)\.md\)/g,
    (match, text, slug) => {
      const bookSlug = slugMap.get(slug);
      if (bookSlug) {
        totalReplaced++;
        return `[${text}](../${bookSlug}/)`;
      }
      // No mapping found - keep as plain text
      totalReplaced++;
      return text;
    }
  );
  
  // Also handle bare URLs (not in markdown links)
  content = content.replace(
    /https:\/\/github\.com\/QianJinGuo\/wiki\/blob\/main\/(?:entities|concepts|comparisons|queries|moc)\/([^\s)]+)\.md/g,
    (match, slug) => {
      const bookSlug = slugMap.get(slug);
      if (bookSlug) {
        totalReplaced++;
        return `../${bookSlug}/`;
      }
      totalReplaced++;
      return slug;
    }
  );
  
  if (content !== original) {
    writeFileSync(filepath, content);
    filesModified++;
  }
}

console.log(`\nDone!`);
console.log(`  Files modified: ${filesModified}`);
console.log(`  URLs replaced: ${totalReplaced}`);
