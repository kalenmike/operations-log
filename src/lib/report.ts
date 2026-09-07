import { jsPDF } from "jspdf";
import type { WeekEntry } from "../types";
import { formatDateDisplay, getWeekDays, getWeekNumber, getDayLabel } from "./dates";
import specialElite from "../assets/fonts/SpecialElite-Regular.ttf?inline";

const DOMAIN_LABELS: Record<keyof WeekEntry["ratings"], string> = {
  spiritual: "Spiritual",
  physical: "Physical",
  intellectual: "Intellectual",
  emotional: "Emotional",
  social: "Social",
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 20;
const BOX_PAD = 4;
const BOX_RADIUS = 3;

const INK_900: [number, number, number] = [30, 26, 22];
const INK_800: [number, number, number] = [48, 42, 36];
const INK_600: [number, number, number] = [77, 67, 56];
const INK_500: [number, number, number] = [99, 87, 72];
const INK_400: [number, number, number] = [125, 111, 94];
const PARCHMENT_200: [number, number, number] = [226, 212, 184];
const PARCHMENT_300: [number, number, number] = [208, 188, 148];
const PARCHMENT_400: [number, number, number] = [191, 163, 110];
const PARCHMENT_50: [number, number, number] = [250, 246, 240];
const GOLD_500: [number, number, number] = [184, 146, 46];

type Cursor = { v: number };

interface TextOpts {
  font?: "elite" | "courier";
  size?: number;
  bold?: boolean;
  italic?: boolean;
  color?: [number, number, number];
  indent?: number;
  spacing?: number;
  maxWidth?: number;
  charSpace?: number;
  align?: "left" | "center" | "right";
}

function ensureSpace(doc: jsPDF, y: Cursor, needed: number): void {
  if (y.v + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
    doc.addPage();
    y.v = MARGIN;
  }
}

function lineHeight(doc: jsPDF, size: number): number {
  return doc.getLineHeightFactor() * size / 2.5;
}

function measureSegments(doc: jsPDF, segments: { text: string; opts?: TextOpts }[]): number {
  let h = 0;
  for (const seg of segments) {
    const { size = 9, maxWidth = CONTENT_WIDTH - (seg.opts?.indent ?? 0), spacing = 4 } = seg.opts ?? {};
    const lines = doc.splitTextToSize(seg.text, maxWidth);
    h += lines.length * lineHeight(doc, size) + spacing;
  }
  return h;
}

function drawSegment(doc: jsPDF, y: Cursor, text: string, opts?: TextOpts): void {
  const {
    font = "courier",
    size = 9,
    bold = false,
    italic = false,
    color = INK_600,
    indent = 0,
    spacing = 4,
    maxWidth = CONTENT_WIDTH - indent,
    charSpace = 0,
    align = "left",
  } = opts ?? {};
  if (font === "elite") {
    doc.setFont("SpecialElite", "normal");
  } else {
    doc.setFont("courier", italic ? "italic" : bold ? "bold" : "normal");
  }
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setCharSpace(charSpace);
  const lineH = lineHeight(doc, size);
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const l of lines) {
    ensureSpace(doc, y, lineH);
    const x = align === "center" ? MARGIN + (CONTENT_WIDTH - doc.getTextWidth(String(l))) / 2
      : align === "right" ? MARGIN + CONTENT_WIDTH - doc.getTextWidth(String(l))
      : MARGIN + indent;
    doc.text(String(l), x, y.v);
    y.v += lineH;
  }
  doc.setCharSpace(0);
  y.v += spacing;
}

function sectionTitle(doc: jsPDF, y: Cursor, title: string): void {
  ensureSpace(doc, y, 16);
  drawSegment(doc, y, title.toUpperCase(), { size: 10, bold: true, color: INK_500, charSpace: 1, spacing: 2 });
  doc.setDrawColor(PARCHMENT_300[0], PARCHMENT_300[1], PARCHMENT_300[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y.v, PAGE_WIDTH - MARGIN, y.v);
  y.v += 4;
}

function boxed(doc: jsPDF, y: Cursor, segments: { text: string; opts?: TextOpts }[]): void {
  const innerH = measureSegments(doc, segments);
  const boxH = innerH + BOX_PAD * 2;
  ensureSpace(doc, y, boxH + 2);
  const boxTop = y.v + 1;
  doc.setFillColor(PARCHMENT_50[0], PARCHMENT_50[1], PARCHMENT_50[2]);
  doc.setDrawColor(PARCHMENT_200[0], PARCHMENT_200[1], PARCHMENT_200[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, boxTop, CONTENT_WIDTH, boxH, BOX_RADIUS, BOX_RADIUS, "FD");
  const inner: Cursor = { v: boxTop + BOX_PAD };
  for (const seg of segments) {
    drawSegment(doc, inner, seg.text, seg.opts);
  }
  y.v = boxTop + boxH + 2;
}

const DOMAIN_ROW_H = 18;

function domainRow(doc: jsPDF, y: Cursor, ratings: WeekEntry["ratings"]): void {
  const colW = CONTENT_WIDTH / 5;
  const values: number[] = [
    ratings.spiritual || 0,
    ratings.physical || 0,
    ratings.intellectual || 0,
    ratings.emotional || 0,
    ratings.social || 0,
  ];
  const keys = Object.keys(DOMAIN_LABELS) as (keyof WeekEntry["ratings"])[];
  const circleR = 2;
  const gap = circleR * 2 + 1.6;
  const rowW = circleR * 2 * 5 + 1.6 * 4;
  const labelY = y.v + 3;
  const circleY = labelY + 6;
  const valueY = circleY + 5;
  for (let i = 0; i < 5; i++) {
    const cx = MARGIN + colW * i + colW / 2;
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(INK_500[0], INK_500[1], INK_500[2]);
    doc.text(DOMAIN_LABELS[keys[i]].toUpperCase(), cx, labelY, { align: "center" });
    const startX = cx - rowW / 2 + circleR;
    for (let j = 0; j < 5; j++) {
      const x = startX + j * gap;
      if (j < values[i]) {
        doc.setFillColor(GOLD_500[0], GOLD_500[1], GOLD_500[2]);
        doc.circle(x, circleY, circleR, "F");
      } else {
        doc.setDrawColor(PARCHMENT_400[0], PARCHMENT_400[1], PARCHMENT_400[2]);
        doc.setLineWidth(0.3);
        doc.circle(x, circleY, circleR, "D");
      }
    }
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(INK_400[0], INK_400[1], INK_400[2]);
    doc.text(`${values[i]}/5`, cx, valueY, { align: "center" });
  }
  y.v = valueY + 4;
}

function domainBox(doc: jsPDF, y: Cursor, ratings: WeekEntry["ratings"]): void {
  const boxH = DOMAIN_ROW_H + BOX_PAD * 2;
  ensureSpace(doc, y, boxH + 2);
  const boxTop = y.v + 1;
  doc.setFillColor(PARCHMENT_50[0], PARCHMENT_50[1], PARCHMENT_50[2]);
  doc.setDrawColor(PARCHMENT_200[0], PARCHMENT_200[1], PARCHMENT_200[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, boxTop, CONTENT_WIDTH, boxH, BOX_RADIUS, BOX_RADIUS, "FD");
  domainRow(doc, { v: boxTop + BOX_PAD }, ratings);
  y.v = boxTop + boxH + 2;
}

function addFooter(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(PARCHMENT_300[0], PARCHMENT_300[1], PARCHMENT_300[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(INK_400[0], INK_400[1], INK_400[2]);
    doc.text("https://log.kalenmichael.com", PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
    doc.text(`Page ${i} of ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: "right" });
  }
}

export function downloadWeekPdf(week: WeekEntry): void {
  const base64 = specialElite.replace(/^data:font\/[^;]+;base64,/, "");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("SpecialElite.ttf", base64);
  doc.addFont("SpecialElite.ttf", "SpecialElite", "normal", 400, "Identity-H");
  doc.setLineHeightFactor(1.4);
  const y: Cursor = { v: MARGIN };

  const wkNumber = getWeekNumber(week.startDate);
  const days = getWeekDays(week.startDate);
  const range = `${formatDateDisplay(week.startDate)} – ${formatDateDisplay(days[days.length - 1].toISOString().slice(0, 10))}`;

  drawSegment(doc, y, "OPERATIONS LOG", { font: "elite", size: 18, color: INK_900, charSpace: 2, spacing: 3 });
  drawSegment(doc, y, "THE KALEN MICHAEL EXPERIMENT", { font: "elite", size: 9, color: INK_500, charSpace: 1.5, spacing: 5 });
  drawSegment(doc, y, `Week ${wkNumber} · ${range}`, { size: 9, color: INK_400, spacing: 2 });
  if (week.reviewedAt) {
    drawSegment(doc, y, `Closed on ${new Date(week.reviewedAt).toLocaleDateString()}`, { size: 8, italic: true, color: INK_400, spacing: 3 });
  }
  doc.setDrawColor(PARCHMENT_300[0], PARCHMENT_300[1], PARCHMENT_300[2]);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y.v, PAGE_WIDTH - MARGIN, y.v);
  y.v += 6;

  if (week.weeklyGoal.trim()) {
    sectionTitle(doc, y, "Weekly Goal");
    boxed(doc, y, [{ text: week.weeklyGoal, opts: { spacing: 0 } }]);
  }

  if (week.goals.length > 0) {
    sectionTitle(doc, y, "Objectives");
    const labels = days.map((d) => getDayLabel(d.getDay()));
    const segs: { text: string; opts?: TextOpts }[] = [];
    for (const g of week.goals) {
      segs.push({ text: `${g.carried ? "[carried] " : ""}${g.text}`, opts: { bold: true, color: INK_800, spacing: 1 } });
      segs.push({ text: `${g.done.map((d) => (d ? "X" : "·")).join("  ")}   (${labels.join(",")})`, opts: { indent: 6, spacing: 3 } });
    }
    boxed(doc, y, segs);
  }

  sectionTitle(doc, y, "Domain Assessment");
  domainBox(doc, y, week.ratings);

  if (week.bestAreaWhy.trim() || week.worstAreaWhy.trim()) {
    sectionTitle(doc, y, "Assessment Notes");
    const segs: { text: string; opts?: TextOpts }[] = [];
    if (week.bestAreaWhy.trim()) segs.push({ text: `Best: ${week.bestAreaWhy}`, opts: { spacing: 2 } });
    if (week.worstAreaWhy.trim()) segs.push({ text: `Worst: ${week.worstAreaWhy}`, opts: { spacing: 0 } });
    boxed(doc, y, segs);
  }

  const checkins = week.dailyCheckins.filter((c) => c.reflections.trim() || Number(c.moodRating) > 0);
  if (checkins.length > 0) {
    sectionTitle(doc, y, "Daily Check-ins");
    for (const c of checkins) {
      const mood = Number(c.moodRating) || 0;
      const segs: { text: string; opts?: TextOpts }[] = [
        { text: `${formatDateDisplay(c.date)}${mood ? `  ·  Mood ${mood}/5` : ""}`, opts: { bold: true, color: INK_800, spacing: 1 } },
      ];
      if (c.reflections.trim()) segs.push({ text: c.reflections, opts: { indent: 4, spacing: 0 } });
      boxed(doc, y, segs);
    }
  }

  if (week.weekSummary.trim() || week.wins.trim() || week.review.trim()) {
    sectionTitle(doc, y, "Reflection");
    const segs: { text: string; opts?: TextOpts }[] = [];
    if (week.weekSummary.trim()) segs.push({ text: `Summary: ${week.weekSummary}`, opts: { spacing: 2 } });
    if (week.wins.trim()) segs.push({ text: `Wins: ${week.wins}`, opts: { spacing: 2 } });
    if (week.review.trim()) segs.push({ text: `Review: ${week.review}`, opts: { spacing: 0 } });
    boxed(doc, y, segs);
  }

  if (week.energyGivers[0] || week.energyDrainers[0]) {
    sectionTitle(doc, y, "Energy");
    const segs: { text: string; opts?: TextOpts }[] = [];
    if (week.energyGivers[0]) segs.push({ text: `Givers: ${week.energyGivers.join(", ")}`, opts: { spacing: 2 } });
    if (week.energyDrainers[0]) segs.push({ text: `Drainers: ${week.energyDrainers.join(", ")}`, opts: { spacing: 0 } });
    boxed(doc, y, segs);
  }

  if (week.nextWeekQuote.trim()) {
    sectionTitle(doc, y, "Next Week Quote");
    boxed(doc, y, [{ text: week.nextWeekQuote, opts: { italic: true, spacing: 0 } }]);
  }

  if (week.carriedNote?.trim()) {
    sectionTitle(doc, y, "One Thing to Carry Forward");
    boxed(doc, y, [{ text: week.carriedNote, opts: { spacing: 0 } }]);
  }

  addFooter(doc);
  doc.save(`operations-log-wk${wkNumber}.pdf`);
}