#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Developer CLI Tool: Inspect isolated attribution audit logs.
 * Usage:
 *   npm run audit
 *   npm run audit -- --author "Shaurya"
 *   npm run audit -- --search "keyword"
 *   npm run audit -- --limit 50
 */

const mongoose = require("mongoose");

const AUDIT_MONGODB_URI = process.env.AUDIT_MONGODB_URI || process.env.MONGODB_URI;
const AUDIT_DB_NAME = process.env.AUDIT_DB_NAME || "inkless_audit";

if (!AUDIT_MONGODB_URI) {
  console.error("Error: MONGODB_URI or AUDIT_MONGODB_URI is not set in environment.");
  process.exit(1);
}

// Parse simple CLI args
const args = process.argv.slice(2);
let authorFilter = null;
let searchFilter = null;
let limit = 25;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--author" && args[i + 1]) {
    authorFilter = args[i + 1];
    i++;
  } else if (args[i] === "--search" && args[i + 1]) {
    searchFilter = args[i + 1];
    i++;
  } else if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[i + 1], 10) || 25;
    i++;
  }
}

async function viewAuditLogs() {
  console.log("\n========================================================");
  console.log("   INKLESS DEVELOPER AUDIT & ATTRIBUTION LEDGER");
  console.log("========================================================");
  console.log(`Connected to Database: "${AUDIT_DB_NAME}"`);

  const conn = await mongoose.createConnection(AUDIT_MONGODB_URI, {
    dbName: AUDIT_DB_NAME,
  }).asPromise();

  const auditCollection = conn.collection("noteauditlogs");

  const query = {};
  if (authorFilter) {
    query.$or = [
      { authorName: { $regex: authorFilter, $options: "i" } },
      { authorEmail: { $regex: authorFilter, $options: "i" } },
    ];
  }
  if (searchFilter) {
    query.text = { $regex: searchFilter, $options: "i" };
  }

  const totalLogs = await auditCollection.countDocuments({});
  const matchedLogs = await auditCollection.countDocuments(query);
  const logs = await auditCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  console.log(`Total Records in Audit DB: ${totalLogs}`);
  if (authorFilter || searchFilter) {
    console.log(`Filter Matched: ${matchedLogs} records`);
  }
  console.log(`Displaying latest ${logs.length} entries:\n`);

  if (logs.length === 0) {
    console.log("No audit records found matching criteria.\n");
    await conn.close();
    process.exit(0);
  }

  const tableData = logs.map((log) => ({
    Action: log.action || "CREATE",
    "Note ID": log.noteId,
    "Author Name": log.authorName,
    "Author Email": log.authorEmail,
    "Content Preview": log.text.length > 30 ? log.text.slice(0, 27) + "..." : log.text,
    Date: new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19),
    IP: log.ipAddress || "N/A",
  }));

  console.table(tableData);
  console.log("========================================================\n");

  await conn.close();
  process.exit(0);
}

viewAuditLogs().catch((err) => {
  console.error("Error inspecting audit logs:", err);
  process.exit(1);
});
