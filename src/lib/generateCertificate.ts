/**
 * generateCertificate
 * Generates a PDF certificate for completing W.O.W levels
 * Uses jsPDF — runs client-side only
 */

export async function generateCertificate(params: {
  pseudo: string;
  employeeId: string;
  level: number;
  score: number;
  rank?: number;
  date?: string;
}): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const { pseudo, employeeId, level, score, rank, date } = params;
  const dateStr = date ?? new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const W = 297;
  const H = 210;

  // ── Background ────────────────────────────────────────────────────────────
  doc.setFillColor(26, 63, 120); // #1A3F78
  doc.rect(0, 0, W, H, 'F');

  // Inner frame
  doc.setFillColor(12, 42, 98); // #0C2A62
  doc.rect(10, 10, W - 20, H - 20, 'F');

  // Border
  doc.setDrawColor(0, 200, 190); // #00C8BE
  doc.setLineWidth(1.5);
  doc.rect(10, 10, W - 20, H - 20);

  // Corner accents
  const corners = [[10,10],[W-10,10],[10,H-10],[W-10,H-10]];
  corners.forEach(([x, y]) => {
    doc.setDrawColor(0, 200, 190);
    doc.setLineWidth(2);
    const s = 8;
    const dx = x === 10 ? s : -s;
    const dy = y === 10 ? s : -s;
    doc.line(x, y, x + dx, y);
    doc.line(x, y, x, y + dy);
  });

  // Grid lines (subtle)
  doc.setDrawColor(40, 80, 160);
  doc.setLineWidth(0.2);
  for (let gx = 20; gx < W; gx += 14) doc.line(gx, 10, gx, H - 10);
  for (let gy = 20; gy < H; gy += 9) doc.line(10, gy, W - 10, gy);

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setTextColor(168, 216, 255);
  doc.setFontSize(7);
  doc.text('GUIBOUR SYSTEM // CERTIFICAT OFFICIEL // W.O.W 2026', W / 2, 22, { align: 'center' });

  // Formula bar
  doc.setFillColor(10, 26, 50);
  doc.rect(20, 26, W - 40, 8, 'F');
  doc.setTextColor(91, 155, 213);
  doc.setFontSize(6);
  doc.text(`=GENERATE_CERT("${pseudo}","LEVEL_${level}","SCORE_${score}") // DATE:${dateStr}`, 25, 31.5);

  // ── Main title ────────────────────────────────────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICAT DE COMPÉTENCES BUREAUCRATIQUES', W / 2, 50, { align: 'center' });

  doc.setTextColor(0, 200, 190);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('WORK OR WINDOW — W.O.W SYSTEM™', W / 2, 58, { align: 'center' });

  // Separator
  doc.setDrawColor(0, 200, 190);
  doc.setLineWidth(0.8);
  doc.line(40, 63, W - 40, 63);

  // ── Body text ─────────────────────────────────────────────────────────────
  doc.setTextColor(168, 216, 255);
  doc.setFontSize(8);
  doc.text('Nous certifions que :', W / 2, 75, { align: 'center' });

  // Name box
  doc.setFillColor(0, 71, 171, 0.2);
  doc.setDrawColor(0, 200, 190);
  doc.setLineWidth(0.5);
  doc.roundedRect(W / 2 - 60, 80, 120, 16, 2, 2, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(pseudo.toUpperCase(), W / 2, 91.5, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 155, 213);
  doc.text(`N° Employé : ${employeeId}`, W / 2, 101, { align: 'center' });

  // Achievement text
  doc.setTextColor(168, 216, 255);
  doc.setFontSize(8);
  doc.text([
    `a survécu avec brio aux dossiers volants de l'Open Space,`,
    `escaladant ${level} étages de bureaucratie hostile`,
    `et accumulant un salaire fictif de ${score.toLocaleString('fr-FR')} €.`,
  ], W / 2, 112, { align: 'center' });

  // Stats row
  const stats = [
    { label: 'NIVEAU ATTEINT', value: `${level} / 25` },
    { label: 'SALAIRE GAGNÉ', value: `${score.toLocaleString('fr-FR')} €` },
    ...(rank && rank > 0 ? [{ label: 'CLASSEMENT', value: `#${rank}` }] : []),
    { label: 'DATE', value: dateStr },
  ];

  const cellW = (W - 60) / stats.length;
  stats.forEach((s, i) => {
    const cx = 30 + i * cellW + cellW / 2;
    doc.setFillColor(10, 26, 50);
    doc.rect(30 + i * cellW + 2, 130, cellW - 4, 18, 'F');
    doc.setDrawColor(26, 62, 122);
    doc.rect(30 + i * cellW + 2, 130, cellW - 4, 18);
    doc.setTextColor(91, 155, 213);
    doc.setFontSize(6);
    doc.text(s.label, cx, 136, { align: 'center' });
    doc.setTextColor(255, 224, 51);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, cx, 144, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(0, 200, 190);
  doc.setLineWidth(0.5);
  doc.line(40, 158, W - 40, 158);

  doc.setTextColor(43, 80, 144);
  doc.setFontSize(6);
  doc.text('Ce certificat atteste de compétences avancées en survie bureaucratique, esquive de dossiers et résistance au café refroidi.', W / 2, 164, { align: 'center' });
  doc.text('Document généré automatiquement par GUIBOUR SYSTEM — guibour.fr — Valeur purement satirique.', W / 2, 169, { align: 'center' });

  // Signatures
  const sigs = [
    { title: 'LE DIRECTEUR', name: 'Jean-Luc ARCHIVAGE', dept: 'Direction Générale des RTT' },
    { title: 'LA RH', name: 'Marie-Thérèse FORMULAIRE', dept: 'Pôle Ressources Humaines' },
    { title: 'LE SYSTÈME', name: 'GUIBOUR SYSTEM™', dept: 'Intelligence Artificielle & Burnout' },
  ];
  sigs.forEach((s, i) => {
    const sx = 50 + i * 70;
    doc.setDrawColor(26, 62, 122);
    doc.setLineWidth(0.3);
    doc.line(sx - 15, 182, sx + 15, 182);
    doc.setTextColor(91, 155, 213);
    doc.setFontSize(5);
    doc.text(s.title, sx, 186, { align: 'center' });
    doc.setTextColor(168, 216, 255);
    doc.text(s.name, sx, 190, { align: 'center' });
    doc.setTextColor(43, 80, 144);
    doc.text(s.dept, sx, 194, { align: 'center' });
  });

  // Bottom bar
  doc.setFillColor(10, 26, 50);
  doc.rect(10, 197, W - 20, 8, 'F');
  doc.setTextColor(43, 80, 144);
  doc.setFontSize(5.5);
  doc.text(`=CERT_ID("${employeeId}","${new Date().getTime()}") // GUIBOUR SYSTEM 2026 // guibour.fr // W.O.W — WORK OR WINDOW`, W / 2, 202, { align: 'center' });

  // Save
  doc.save(`certificat-WOW-${pseudo.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
