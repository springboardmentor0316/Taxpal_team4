// src/controllers/reportController.js
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Parser as Json2csvParser } from "json2csv";
import Report from "../models/reportModel.js";
import Transaction from "../models/transactionModel.js";
import Budget from "../models/budgetModel.js";

/**
 * Helpers
 */

// compute start/end (inclusive) for given period
function getPeriodRange(period, from, to) {
  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth(); // 0-index
  let start, end;

  const startOfDay = (d) => { d.setHours(0,0,0,0); return d; };
  const endOfDay = (d) => { d.setHours(23,59,59,999); return d; };

  switch (period) {
    case "this_month":
      start = startOfDay(new Date(Y, M, 1));
      end = endOfDay(new Date(Y, M + 1, 0));
      break;
    case "last_month": {
      const lastMonth = new Date(Y, M - 1, 1);
      start = startOfDay(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1));
      end = endOfDay(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));
      break;
    }
    case "this_quarter": {
      const qStartMonth = Math.floor(M / 3) * 3;
      start = startOfDay(new Date(Y, qStartMonth, 1));
      end = endOfDay(new Date(Y, qStartMonth + 3, 0));
      break;
    }
    case "last_quarter": {
      const qStartMonth = Math.floor(M / 3) * 3 - 3;
      const qYear = (qStartMonth < 0) ? Y - 1 : Y;
      const qMonth = (qStartMonth < 0) ? qStartMonth + 12 : qStartMonth;
      start = startOfDay(new Date(qYear, qMonth, 1));
      end = endOfDay(new Date(qYear, qMonth + 3, 0));
      break;
    }
    case "ytd":
      start = startOfDay(new Date(Y, 0, 1));
      end = endOfDay(new Date());
      break;
    case "custom":
      if (!from || !to) return null;
      start = startOfDay(new Date(from));
      end = endOfDay(new Date(to));
      break;
    default:
      return null;
  }
  return { start, end };
}

// fetch data for a given report type and date range
async function getDataForReport(type, range) {
  const q = {
    $or: [
      { createdAt: { $gte: range.start, $lte: range.end } },
      { date: { $gte: range.start, $lte: range.end } },
    ],
  };

  switch (type) {
    case "transactions": {
      const txs = await Transaction.find(q).sort({ createdAt: -1 }).lean();
      return { rows: txs, summary: { count: txs.length } };
    }

    case "budgets": {
      const budgets = await Budget.find(q).sort({ createdAt: -1 }).lean();
      return { rows: budgets, summary: { count: budgets.length } };
    }

    case "tax": {
      const txs = await Transaction.find(q).lean();
      let totalIncome = 0, totalExpense = 0;
      for (const t of txs) {
        const amt = Number(t.amount ?? t.value ?? 0);
        if (t.type === "income" || amt > 0) totalIncome += Math.abs(amt);
        else totalExpense += Math.abs(amt);
      }
      const taxable = Math.max(0, totalIncome - totalExpense);
      return { rows: txs, summary: { totalIncome, totalExpense, taxable } };
    }

    case "income_statement": {
      const txs = await Transaction.find(q).lean();
      let revenue = 0, expenses = 0;
      const byCategory = {};
      for (const t of txs) {
        const amt = Number(t.amount ?? t.value ?? 0);
        if (t.type === "income" || amt > 0) revenue += Math.abs(amt);
        else expenses += Math.abs(amt);

        const cat = t.category || "Uncategorized";
        byCategory[cat] = (byCategory[cat] || 0) + amt;
      }
      const net = revenue - expenses;
      return { rows: txs, summary: { revenue, expenses, net, byCategory } };
    }

    case "balance_sheet": {
      const txs = await Transaction.find(q).lean();
      let cash = 0;
      for (const t of txs) {
        const amt = Number(t.amount ?? t.value ?? 0);
        cash += (t.type === "income" || amt > 0) ? Math.abs(amt) : -Math.abs(amt);
      }
      const budgets = await Budget.find({}).lean();
      return { rows: { transactions: txs, budgets }, summary: { cash, liabilities: 0, assets: cash } };
    }

    default:
      return { rows: [], summary: {} };
  }
}

/**
 * File generators
 */

async function writeCSV(filename, rows, fields) {
  const dir = path.join(process.cwd(), "public", "reports");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);

  const parser = new Json2csvParser({ fields, unwind: [] });
  const csv = parser.parse(rows);
  await fs.writeFile(filePath, csv, "utf8");
  return filePath;
}

async function writePDF(filename, title, periodLabel, rows, columns) {
  const dir = path.join(process.cwd(), "public", "reports");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);

  const stream = fsSync.createWriteStream(filePath);
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  doc.pipe(stream);
  doc.fontSize(18).text(title, { align: "left" });
  doc.moveDown(0.2);
  doc.fontSize(10).text(`Period: ${periodLabel}`, { align: "left" });
  doc.moveDown(0.8);

  doc.fontSize(12);
  doc.text(columns.join(" | "));
  doc.moveDown(0.3);
  doc.fontSize(10);

  const maxRows = 2000;
  let count = 0;
  for (const row of rows) {
    if (count++ >= maxRows) {
      doc.text("… (truncated) …");
      break;
    }
    const cells = columns.map((c) => {
      const val = c.split(".").reduce((acc, p) => (acc ? acc[p] : undefined), row);
      if (val === undefined) return "";
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    });
    doc.text(cells.join(" | "));
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
}

/**
 * Controller methods
 */

// GET /api/reports
export const listReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).lean();
    res.json({ reports });
  } catch (err) {
    console.error("listReports error", err);
    res.status(500).json({ message: "Failed to list reports" });
  }
};

// POST /api/reports/generate
export const generateReport = async (req, res) => {
  try {
    const { type, period, format, from, to } = req.body;

    if (!type || !period || !format) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const range = getPeriodRange(period, from, to);
    if (!range) {
      return res.status(400).json({ message: "Invalid period / missing custom dates" });
    }

    let { rows, summary } = await getDataForReport(type, range);

    // Normalize rows for CSV/PDF
    let normalizedRows = [];
    if (type === "transactions" || type === "tax" || type === "income_statement") {
      normalizedRows = Array.isArray(rows) ? rows.filter(t => !t.isDeleted) : [];
    } else if (type === "balance_sheet") {
      normalizedRows = [summary];
    } else {
      normalizedRows = Array.isArray(rows) ? rows : [];
    }

    const ext = format.toLowerCase();
    const name = `${type}-${period}-${Date.now()}.${ext}`;
    const periodLabel = period === "custom" ? `${from} → ${to}` : period;

    let savedPath;
    if (ext === "csv") {
      let fields = [];
      if (type === "transactions") fields = ["date", "amount", "type", "category", "description", "account"];
      else if (type === "budgets") fields = ["title", "limit", "spent", "category"];
      else if (type === "tax" || type === "income_statement") fields = ["date", "amount", "type", "category", "description"];
      else fields = Object.keys(normalizedRows?.[0] || {});
      await writeCSV(name, normalizedRows, fields);
      savedPath = path.join(process.cwd(), "public", "reports", name);
    } else if (ext === "pdf") {
      let columns = [];
      if (type === "transactions") columns = ["date", "amount", "type", "category", "description"];
      else if (type === "budgets") columns = ["title", "limit", "spent", "category"];
      else if (type === "tax" || type === "income_statement") columns = ["date", "amount", "type", "category", "description"];
      else if (type === "balance_sheet") columns = ["summary"];
      else columns = Object.keys(normalizedRows?.[0] || {});

      await writePDF(name, `${type} report`, periodLabel, normalizedRows, columns);
      savedPath = path.join(process.cwd(), "public", "reports", name);
    } else {
      return res.status(400).json({ message: "Unsupported format" });
    }

    const url = `${req.protocol}://${req.get("host")}/reports/${name}`;

    const doc = await Report.create({
      name,
      type,
      period,
      format: ext,
      url,
      metadata: { from, to, summary },
    });

    const io = req.app?.get("io");
    if (io) io.emit("reports:created", { report: doc });

    res.json({ report: doc });
  } catch (err) {
    console.error("generateReport error", err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};

// GET /api/reports/:id/preview
export const previewReport = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).send("Report not found");

    const filePath = path.join(process.cwd(), "public", "reports", doc.name);
    const hostBase = `${req.protocol}://${req.get("host")}`;

    if (!fsSync.existsSync(filePath)) {
      return res.status(404).send("Report file not found");
    }

    if (doc.format === "csv") {
      const csvText = await fs.readFile(filePath, "utf8");
      function parseCSV(text) {
        const rows = [];
        let cur = "";
        let row = [];
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === '"') {
            if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; } 
            else inQuotes = !inQuotes;
            continue;
          }
          if (ch === ',' && !inQuotes) { row.push(cur); cur = ""; continue; }
          if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); row = []; cur = ""; }
            if (ch === '\r' && text[i + 1] === '\n') i++;
            continue;
          }
          cur += ch;
        }
        if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
        return rows;
      }

      const rows = parseCSV(csvText);
      const escapeHtml = (s) => s == null ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const maxPreviewRows = 500;
      const previewRows = rows.slice(0, maxPreviewRows);

      let html = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>CSV Preview - ${doc.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:10px; color:#111; }
            table { border-collapse: collapse; width: 100%; max-width:100%; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 13px; text-align: left; }
            thead th { background: #f3f4f6; position: sticky; top:0; z-index:2; }
            tbody tr:nth-child(even) { background: #fbfbfb; }
            .meta { margin-bottom: 12px; color: #444; }
            .truncated { margin-top:8px; color:#666; font-size:13px; }
          </style>
        </head>
        <body>
          <div class="meta"><strong>${escapeHtml(doc.name)}</strong> — ${escapeHtml(doc.period || "")} — CSV preview (first ${previewRows.length} rows)</div>
          <div style="overflow:auto; max-height:75vh;">
            <table>
      `;

      if (previewRows.length > 0) {
        const header = previewRows[0];
        html += "<thead><tr>";
        for (const h of header) html += `<th>${escapeHtml(h)}</th>`;
        html += "</tr></thead><tbody>";
        for (let i = 1; i < previewRows.length; i++) {
          const r = previewRows[i];
          html += "<tr>";
          for (const cell of r) html += `<td>${escapeHtml(cell)}</td>`;
          html += "</tr>";
        }
        html += "</tbody>";
      } else {
        html += "<tbody><tr><td><em>No data</em></td></tr></tbody>";
      }

      html += `</table></div>`;
      if (rows.length > previewRows.length) {
        html += `<div class="truncated">…preview truncated (${rows.length} total rows). Download to view all.</div>`;
      }
      html += `</body></html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    if (doc.format === "pdf") {
      const staticUrl = `${hostBase}/reports/${doc.name}`;
      const html = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>PDF Preview - ${doc.name}</title>
          <style>
            html,body { height:100%; margin:0; }
            .container { height:100vh; display:flex; flex-direction:column; }
            iframe { flex:1; border:none; width:100%; height:100%; }
            .meta { padding:8px; background:#f5f7fb; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="meta"><strong>${doc.name}</strong> — ${doc.period || ""}</div>
            <iframe src="${staticUrl}" title="pdf-preview"></iframe>
          </div>
        </body>
        </html>
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(`<p>Preview not available. <a href="${doc.url}" target="_blank">Download</a></p>`);
  } catch (err) {
    console.error("previewReport error", err);
    res.status(500).send("Failed to generate preview");
  }
};

// DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).json({ message: "Report not found" });

    const filePath = path.join(process.cwd(), "public", "reports", doc.name);
    try {
      if (fsSync.existsSync(filePath)) await fs.unlink(filePath);
    } catch (e) {
      console.warn("Failed to remove file:", filePath, e.message);
    }

    await Report.deleteOne({ _id: id });

    const io = req.app?.get("io");
    if (io) io.emit("reports:deleted", { id });

    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("deleteReport error", err);
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
};
