const PDFDocument = require("pdfkit");
const invoiceConfig = require("./invoiceConfig");

// Brand colors from the WellFit design system
const COLORS = {
  dark: "#021024",
  navy: "#052659",
  blue: "#5483B3",
  lightBg: "#f8f7f4",
  border: "#e7e3dc",
  text: "#333333",
  lightText: "#6b7280",
};

/**
 * Derive a human-readable invoice number from the order ID.
 * - Integer IDs: INV-WF-000042
 * - UUID IDs:    INV-WF-A1B2C3D4
 */
function getInvoiceNumber(orderId) {
  const idStr = String(orderId);
  const isNumeric = /^\d+$/.test(idStr);

  if (isNumeric) {
    return `INV-WF-${idStr.padStart(6, "0")}`;
  }
  // UUID or other non-numeric: take first 8 chars uppercased
  return `INV-WF-${idStr.slice(0, 8).toUpperCase()}`;
}

/**
 * Format a date string as en-IN locale: "11 Aug 2026"
 */
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Draw a horizontal line on the PDF.
 */
function drawLine(doc, y, color = COLORS.border) {
  doc
    .strokeColor(color)
    .lineWidth(0.8)
    .moveTo(50, y)
    .lineTo(545, y)
    .stroke();
}

/**
 * Generate an invoice PDF and return the PDFDocument stream.
 *
 * @param {Object} order       - The order record (id, customer_name, email, phone, address, city, state, pincode, total, created_at)
 * @param {Array}  orderItems  - Array of order_items (product_name, size, quantity, price)
 * @param {string} status      - Current order status string
 * @returns {PDFDocument}      - A readable stream; pipe to response
 */
function generateInvoice(order, orderItems, status) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const invoiceNumber = getInvoiceNumber(order.id);
  const config = invoiceConfig;
  const isGstInvoice = config.gstin && config.gstin.trim() !== "";

  // ─── HEADER ────────────────────────────────────────────────
  // Business name
  doc
    .fontSize(22)
    .fillColor(COLORS.navy)
    .font("Helvetica-Bold")
    .text(config.businessName, 50, 50, { width: 250 });

  // Address line
  doc
    .fontSize(9)
    .fillColor(COLORS.lightText)
    .font("Helvetica")
    .text(config.addressLine, 50, 76, { width: 250 });

  // GSTIN (only if provided)
  if (isGstInvoice) {
    doc
      .fontSize(9)
      .fillColor(COLORS.lightText)
      .text(`GSTIN: ${config.gstin}`, 50, 90, { width: 250 });
  }

  // Invoice title — right side
  const titleText = isGstInvoice ? "TAX INVOICE" : "INVOICE";
  doc
    .fontSize(20)
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .text(titleText, 350, 50, { width: 195, align: "right" });

  // Invoice number & date — right side
  doc
    .fontSize(10)
    .fillColor(COLORS.text)
    .font("Helvetica")
    .text(`Invoice: ${invoiceNumber}`, 350, 78, { width: 195, align: "right" })
    .text(`Date: ${formatDate(order.created_at)}`, 350, 93, { width: 195, align: "right" });

  // Status badge
  doc
    .fontSize(9)
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .text(`Status: ${status || "Pending"}`, 350, 110, { width: 195, align: "right" });

  // Divider
  drawLine(doc, 130, COLORS.navy);

  // ─── BILL TO ───────────────────────────────────────────────
  doc
    .fontSize(10)
    .fillColor(COLORS.blue)
    .font("Helvetica-Bold")
    .text("BILL TO", 50, 145);

  doc
    .fontSize(11)
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .text(order.customer_name || "Customer", 50, 162);

  let billY = 178;
  doc.fontSize(9).fillColor(COLORS.text).font("Helvetica");

  if (order.email) {
    doc.text(order.email, 50, billY);
    billY += 14;
  }
  if (order.phone) {
    doc.text(`Phone: ${order.phone}`, 50, billY);
    billY += 14;
  }
  if (order.address) {
    doc.text(order.address, 50, billY, { width: 300 });
    billY += 14;
  }

  const cityLine = [order.city, order.state, order.pincode].filter(Boolean).join(", ");
  if (cityLine) {
    doc.text(cityLine, 50, billY, { width: 300 });
    billY += 14;
  }

  // ─── ITEMS TABLE ───────────────────────────────────────────
  const tableTop = Math.max(billY + 20, 240);

  // Table header background
  doc
    .rect(50, tableTop, 495, 24)
    .fill(COLORS.navy);

  // Table header text
  const colX = { product: 58, size: 250, qty: 320, price: 385, total: 460 };

  doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold");
  doc.text("Product", colX.product, tableTop + 7);
  doc.text("Size", colX.size, tableTop + 7);
  doc.text("Qty", colX.qty, tableTop + 7);
  doc.text("Unit Price (Rs.)", colX.price, tableTop + 7);
  doc.text("Total (Rs.)", colX.total, tableTop + 7);

  // Table rows
  let rowY = tableTop + 28;
  let subtotal = 0;
  const items = orderItems || [];

  items.forEach((item, index) => {
    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    subtotal += lineTotal;

    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(50, rowY - 2, 495, 22).fill("#faf9f7");
    }

    doc.fontSize(9).fillColor(COLORS.text).font("Helvetica");
    doc.text(item.product_name || "Product", colX.product, rowY + 3, { width: 185, lineBreak: false });
    doc.text(item.size || "—", colX.size, rowY + 3);
    doc.text(String(item.quantity || 1), colX.qty, rowY + 3);
    doc.text(`Rs. ${Number(item.price || 0).toLocaleString("en-IN")}`, colX.price, rowY + 3);
    doc.text(`Rs. ${lineTotal.toLocaleString("en-IN")}`, colX.total, rowY + 3);

    rowY += 22;
  });

  // Line below table
  drawLine(doc, rowY + 4, COLORS.border);

  // ─── TOTALS ────────────────────────────────────────────────
  let totalsY = rowY + 18;
  const totalsLabelX = 380;
  const totalsValueX = 460;

  doc.fontSize(10).fillColor(COLORS.text).font("Helvetica");
  doc.text("Subtotal:", totalsLabelX, totalsY);
  doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, totalsValueX, totalsY);

  totalsY += 18;
  doc.text("Shipping:", totalsLabelX, totalsY);
  doc.fillColor(COLORS.blue).text("Free", totalsValueX, totalsY);

  totalsY += 22;
  drawLine(doc, totalsY, COLORS.navy);

  totalsY += 8;
  const grandTotal = Number(order.total) || subtotal;
  doc
    .fontSize(13)
    .fillColor(COLORS.dark)
    .font("Helvetica-Bold")
    .text("Grand Total:", totalsLabelX, totalsY)
    .text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, totalsValueX, totalsY);

  // ─── FOOTER ────────────────────────────────────────────────
  const footerY = Math.max(totalsY + 60, 650);

  drawLine(doc, footerY, COLORS.border);

  doc
    .fontSize(11)
    .fillColor(COLORS.navy)
    .font("Helvetica-Bold")
    .text("Thank you for shopping with WellFit!", 50, footerY + 14, {
      width: 495,
      align: "center",
    });

  doc
    .fontSize(9)
    .fillColor(COLORS.lightText)
    .font("Helvetica")
    .text(
      `For questions about your order, contact us at ${config.supportEmail}`,
      50,
      footerY + 32,
      { width: 495, align: "center" }
    );

  doc
    .fontSize(8)
    .fillColor(COLORS.lightText)
    .text("Free Shipping across India", 50, footerY + 50, {
      width: 495,
      align: "center",
    });

  doc.end();
  return doc;
}

module.exports = { generateInvoice, getInvoiceNumber };
