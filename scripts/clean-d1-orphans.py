#!/usr/bin/env python3
"""
Clean orphan records from D1 database.

Orphan records are progress/feynman/recall entries for files
that no longer exist in the current articles.json.
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_JSON = ROOT / "docs/dashboard/articles.json"

def get_current_articles():
    """Get set of current article file paths."""
    with open(ARTICLES_JSON) as f:
        data = json.load(f)
    return set(a['file'] for a in data['articles'])

def run_d1_query(sql, database="wiki-book-progress"):
    """Run a D1 query and return results."""
    cmd = [
        "npx", "wrangler", "d1", "execute", database,
        "--remote", "--command", sql
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if result.returncode != 0:
        print(f"Error running query: {sql}")
        print(result.stderr)
        return None
    return result.stdout

def get_all_progress_files():
    """Get all unique article_file from progress table."""
    sql = "SELECT DISTINCT article_file FROM progress"
    output = run_d1_query(sql)
    if not output:
        return set()
    
    # Parse the output - wrangler returns JSON-like output
    files = set()
    for line in output.split('\n'):
        if line.strip() and not line.startswith('[') and not line.startswith(']'):
            # Extract file path from output
            clean = line.strip().strip('"').strip(',')
            if clean and '/' in clean:
                files.add(clean)
    return files

def delete_orphan_records(table, valid_files, dry_run=True):
    """Delete records for files not in valid_files."""
    # Get all files in the table
    sql = f"SELECT DISTINCT article_file FROM {table}"
    output = run_d1_query(sql)
    if not output:
        print(f"No records found in {table}")
        return 0
    
    # Parse files from output
    table_files = set()
    for line in output.split('\n'):
        if line.strip() and not line.startswith('[') and not line.startswith(']'):
            clean = line.strip().strip('"').strip(',')
            if clean and '/' in clean:
                table_files.add(clean)
    
    # Find orphans
    orphans = table_files - valid_files
    
    if not orphans:
        print(f"No orphans found in {table}")
        return 0
    
    print(f"Found {len(orphans)} orphan(s) in {table}:")
    for o in sorted(orphans)[:10]:
        print(f"  - {o}")
    if len(orphans) > 10:
        print(f"  ... and {len(orphans) - 10} more")
    
    # Delete orphans
    if not dry_run:
        for orphan in orphans:
            sql = f"DELETE FROM {table} WHERE article_file = '{orphan}'"
            run_d1_query(sql)
        print(f"Deleted {len(orphans)} records from {table}")
    else:
        print(f"[DRY RUN] Would delete {len(orphans)} records from {table}")
    
    return len(orphans)

def main():
    print("=" * 50)
    print("D1 Orphan Records Cleanup")
    print("=" * 50)
    
    # Get current articles
    print("\n1. Loading current articles...")
    valid_files = get_current_articles()
    print(f"   Found {len(valid_files)} current articles")
    
    # Clean each table
    print("\n2. Checking for orphan records...")
    
    total_orphans = 0
    
    for table in ['progress', 'feynman', 'recall']:
        orphans = delete_orphan_records(table, valid_files, dry_run=False)
        total_orphans += orphans
    
    print("\n" + "=" * 50)
    print(f"Total orphan records deleted: {total_orphans}")
    print("=" * 50)

if __name__ == "__main__":
    main()
