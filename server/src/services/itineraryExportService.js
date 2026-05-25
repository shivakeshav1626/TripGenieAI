import PDFDocument from "pdfkit";

const safeText = (value, fallback = "Not specified") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : fallback;
  }

  return String(value);
};

const writeLabelValue = (doc, label, value, x, y, width) => {
  doc.fontSize(9).fillColor("#94a3b8").text(label.toUpperCase(), x, y, { width, lineBreak: false });
  doc.fontSize(11).fillColor("#e2e8f0").text(safeText(value), x, y + 12, { width });
};

const writeSectionTitle = (doc, title) => {
  doc.moveDown(1.2);
  doc.fontSize(14).fillColor("#67e8f9").text(title, 48, doc.y);
  doc.moveDown(0.3);
};

const writeParagraph = (doc, text, options = {}) => {
  const { x = 48, width = 500, size = 11, color = "#cbd5e1" } = options;
  doc.fontSize(size).fillColor(color).text(safeText(text, ""), x, doc.y, { width, lineGap: 3 });
};

const writeBulletList = (doc, items = [], options = {}) => {
  const { x = 56, width = 488 } = options;
  items.forEach((item) => {
    doc.fontSize(10).fillColor("#67e8f9").text("•", x - 8, doc.y, { width: 8 });
    doc.fontSize(11).fillColor("#cbd5e1").text(String(item), x, doc.y, { width, lineGap: 2 });
    doc.moveDown(0.35);
  });
};

const writeDaySection = (doc, day, index) => {
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#020617");
  doc.fontSize(20).fillColor("#ffffff").text(`Day ${day.day || index + 1}`, 48, 48);
  doc.fontSize(14).fillColor("#e2e8f0").text(day.title || `Day ${index + 1}`, 48, 78);
  if (day.focus) {
    doc.moveDown(0.5);
    writeParagraph(doc, day.focus, { x: 48, width: 500, size: 11, color: "#94a3b8" });
  }

  const sections = [
    ["Morning", day.morning],
    ["Afternoon", day.afternoon],
    ["Evening", day.evening],
  ];

  sections.forEach(([label, items]) => {
    if (!Array.isArray(items) || !items.length) {
      return;
    }

    doc.moveDown(1);
    doc.fontSize(12).fillColor("#67e8f9").text(label, 48, doc.y);
    items.forEach((item) => {
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#ffffff").text(item.title || item.time || "Activity", 56, doc.y, { width: 500 });
      if (item.description) writeParagraph(doc, item.description, { x: 56, width: 485, size: 10 });
      const details = [item.location, item.cost, item.bookingNote].filter(Boolean).join(" · ");
      if (details) writeParagraph(doc, details, { x: 56, width: 485, size: 9, color: "#94a3b8" });
      doc.moveDown(0.3);
    });
  });

  if (Array.isArray(day.food) && day.food.length) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor("#67e8f9").text("Food", 48, doc.y);
    day.food.forEach((item) => {
      writeParagraph(doc, `${item.meal || "Meal"}: ${item.recommendation || item.description || "Suggested dining"}`, { x: 56, width: 485, size: 10 });
    });
  }

  if (Array.isArray(day.notes) && day.notes.length) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor("#67e8f9").text("Notes", 48, doc.y);
    writeBulletList(doc, day.notes, { x: 60, width: 480 });
  }
};

const generateItineraryPdfBuffer = async (itinerary) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#020617");
    doc.fillColor("#ffffff");
    doc.fontSize(26).text(itinerary.tripTitle || "TripGenie AI Itinerary", 48, 56);
    doc.fontSize(12).fillColor("#67e8f9").text(`${safeText(itinerary.destination)} · ${safeText(itinerary.daysCount)} days`, 48, 92);

    doc.moveDown(2);
    writeSectionTitle(doc, "Travel Summary");
    const summary = itinerary.summary || itinerary.itineraryData?.tripSummary || {};
    writeParagraph(doc, summary.overview || "A premium AI-generated itinerary.", { x: 48, width: 500 });
    doc.moveDown(0.8);
    writeLabelValue(doc, "Best for", summary.bestFor, 48, doc.y, 230);
    writeLabelValue(doc, "Travel style", itinerary.travelStyle || summary.travelStyle, 300, doc.y, 230);

    writeSectionTitle(doc, "Hotel Details");
    const hotel = itinerary.hotelDetails || itinerary.itineraryData?.hotelDetails || {};
    writeParagraph(doc, hotel.recommendedArea || hotel.area || "No hotel guidance generated.", { x: 48, width: 500 });
    if (Array.isArray(hotel.bookingNotes) && hotel.bookingNotes.length) {
      writeBulletList(doc, hotel.bookingNotes, { x: 60, width: 480 });
    }

    writeSectionTitle(doc, "Transport Schedule");
    (itinerary.transportSchedule || []).forEach((item) => {
      writeParagraph(doc, `${item.day ? `Day ${item.day}` : "Trip"} · ${safeText(item.mode)}`, { x: 48, width: 500, size: 11, color: "#ffffff" });
      writeParagraph(doc, `${safeText(item.from)} → ${safeText(item.to)} · ${safeText(item.duration)}`, { x: 56, width: 480, size: 10 });
      if (item.bookingNote) writeParagraph(doc, item.bookingNote, { x: 56, width: 480, size: 9, color: "#94a3b8" });
      doc.moveDown(0.4);
    });

    (itinerary.days || []).forEach((day, index) => writeDaySection(doc, day, index));

    doc.end();
  });
};

export { generateItineraryPdfBuffer };