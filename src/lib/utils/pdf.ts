import { jsPDF } from 'jspdf';
import { Submission, Tenant, AreaCategory, PriorityLever } from '@/types';
import { GRADE_INFO, AREA_INFO, TRAFFIC_LIGHT_COLORS, getTrafficLights, getPriorityLevers, detectTriggers } from './scoring';

interface PDFData {
  submission: Submission;
  tenant: Tenant;
  priorityLevers: PriorityLever[];
  logoBase64?: string;
}

export function generateDiagnosticPDF({ submission, tenant, priorityLevers, logoBase64 }: PDFData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper functions
  const centerText = (text: string, fontSize: number, yPos: number) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
  };

  const drawProgressBar = (x: number, yPos: number, width: number, percentage: number, color: string) => {
    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, yPos, width, 6, 2, 2, 'F');

    // Progress bar
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, yPos, (width * percentage) / 100, 6, 2, 2, 'F');
  };

  const gradeInfo = GRADE_INFO[submission.grade];
  const trafficLights = getTrafficLights(submission.scores);

  // Header with tenant branding
  const brandHex = tenant.brand_color.replace('#', '');
  const brandR = parseInt(brandHex.substring(0, 2), 16);
  const brandG = parseInt(brandHex.substring(2, 4), 16);
  const brandB = parseInt(brandHex.substring(4, 6), 16);

  doc.setFillColor(brandR, brandG, brandB);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Add logo if available
  let textStartX = margin;
  if (logoBase64) {
    try {
      // Add logo image (max height 20mm, auto width)
      doc.addImage(logoBase64, 'PNG', margin, 5, 0, 20);
      textStartX = margin + 30; // Offset text after logo
    } catch {
      // If logo fails, continue without it
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(tenant.name, textStartX, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Diagnóstico de Rentabilidad', textStartX, 23);

  y = 45;

  // Company name and date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Empresa: ${submission.company_name}`, margin, y);
  const dateStr = new Date(submission.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Fecha: ${dateStr}`, pageWidth - margin - doc.getTextWidth(`Fecha: ${dateStr}`), y);

  y += 15;

  // Main grade section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  centerText(gradeInfo.title, 24, y);

  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const descriptionLines = doc.splitTextToSize(gradeInfo.description, contentWidth - 40);
  descriptionLines.forEach((line: string) => {
    centerText(line, 12, y);
    y += 6;
  });

  y += 10;

  // Total score
  const gradeHex = gradeInfo.color.replace('#', '');
  const gradeR = parseInt(gradeHex.substring(0, 2), 16);
  const gradeG = parseInt(gradeHex.substring(2, 4), 16);
  const gradeB = parseInt(gradeHex.substring(4, 6), 16);

  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gradeR, gradeG, gradeB);
  const scoreText = `${submission.scores.total}`;
  centerText(scoreText, 48, y);

  doc.setFontSize(24);
  doc.setTextColor(180, 180, 180);
  doc.text('/100', (pageWidth + doc.getTextWidth(scoreText)) / 2 + 2, y);

  y += 20;

  // Separator line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 15;

  // Traffic lights section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Semáforo por área', margin, y);

  y += 12;

  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  areas.forEach((area) => {
    const areaInfo = AREA_INFO[area];
    const score = submission.scores[area];
    const light = trafficLights[area];
    const lightColor = TRAFFIC_LIGHT_COLORS[light];

    // Area name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(areaInfo.name, margin, y);

    // Score text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`${score}%`, pageWidth - margin - 25, y);

    // Traffic light circle
    const circleHex = lightColor.replace('#', '');
    const circleR = parseInt(circleHex.substring(0, 2), 16);
    const circleG = parseInt(circleHex.substring(2, 4), 16);
    const circleB = parseInt(circleHex.substring(4, 6), 16);
    doc.setFillColor(circleR, circleG, circleB);
    doc.circle(pageWidth - margin - 5, y - 2, 3, 'F');

    y += 4;

    // Description
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(areaInfo.description, margin, y);

    y += 4;

    // Progress bar
    drawProgressBar(margin, y, contentWidth - 40, score, lightColor);

    y += 14;
  });

  // Priority levers section
  if (priorityLevers.length > 0) {
    y += 5;

    // Check if we need a new page
    if (y > 230) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(
      priorityLevers.length === 1 ? 'Tu palanca prioritaria' : `Tus ${priorityLevers.length} palancas prioritarias`,
      margin,
      y
    );

    y += 12;

    priorityLevers.forEach((lever, index) => {
      // Check if we need a new page
      if (y > 260) {
        doc.addPage();
        y = margin;
      }

      const bgColor = index === 0 ? { r: 254, g: 242, b: 242 } : { r: 255, g: 251, b: 235 };
      const borderColor = index === 0 ? '#dc2626' : '#d97706';

      // Background
      doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      doc.roundedRect(margin, y - 3, contentWidth, 28, 2, 2, 'F');

      // Left border
      const borderHex = borderColor.replace('#', '');
      const borderR = parseInt(borderHex.substring(0, 2), 16);
      const borderG = parseInt(borderHex.substring(2, 4), 16);
      const borderB = parseInt(borderHex.substring(4, 6), 16);
      doc.setFillColor(borderR, borderG, borderB);
      doc.rect(margin, y - 3, 3, 28, 'F');

      // Number
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 200, 200);
      doc.text(`${index + 1}`, margin + 8, y + 8);

      // Title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(lever.title, margin + 20, y + 6);

      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const leverDescLines = doc.splitTextToSize(lever.description, contentWidth - 30);
      doc.text(leverDescLines[0], margin + 20, y + 14);
      if (leverDescLines[1]) {
        doc.text(leverDescLines[1], margin + 20, y + 20);
      }

      y += 34;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  const footerText = `Diagnóstico ofrecido por ${tenant.name}`;
  centerText(footerText, 9, footerY);

  return doc;
}

// Helper to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadDiagnosticPDF(submission: Submission, tenant: Tenant): Promise<void> {
  const trafficLights = getTrafficLights(submission.scores);
  const triggers = submission.triggers || detectTriggers(submission.answers);
  const priorityLevers = getPriorityLevers(submission.scores, triggers, trafficLights);

  // Load logo if available
  let logoBase64: string | undefined;
  if (tenant.logo_url) {
    const base64 = await loadImageAsBase64(tenant.logo_url);
    if (base64) {
      logoBase64 = base64;
    }
  }

  const pdf = generateDiagnosticPDF({
    submission,
    tenant,
    priorityLevers,
    logoBase64,
  });

  const fileName = `diagnostico-${submission.company_name.toLowerCase().replace(/\s+/g, '-')}-${new Date(submission.created_at).toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
