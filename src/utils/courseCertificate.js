function toPdfText(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

function makeCertificatePdf({ learnerName, courseTitle, completedAt, certificateId }) {
  const completionDate = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(completedAt))
  const commands = [
    '0.96 0.97 0.99 rg 0 0 842 595 re f',
    '1 1 1 rg 35 35 772 525 re f',
    '0.98 0.39 0.02 rg 35 520 772 40 re f',
    '0.98 0.39 0.02 RG 2 w 54 54 734 467 re S',
    'BT /F2 13 Tf 1 1 1 rg 72 534 Td (CAMPUSHUB LEARNING ACADEMY) Tj ET',
    'BT /F2 32 Tf 0.08 0.13 0.22 rg 0 0 Td 1 0 0 1 160 440 Tm (CERTIFICATE OF COMPLETION) Tj ET',
    'BT /F1 15 Tf 0.30 0.35 0.42 rg 1 0 0 1 265 380 Tm (This certificate is proudly presented to) Tj ET',
    `BT /F2 30 Tf 0.98 0.39 0.02 rg 1 0 0 1 170 324 Tm (${toPdfText(learnerName)}) Tj ET`,
    'BT /F1 15 Tf 0.30 0.35 0.42 rg 1 0 0 1 231 278 Tm (for successfully completing the course) Tj ET',
    `BT /F2 22 Tf 0.08 0.13 0.22 rg 1 0 0 1 150 232 Tm (${toPdfText(courseTitle)}) Tj ET`,
    `BT /F1 13 Tf 0.30 0.35 0.42 rg 1 0 0 1 290 180 Tm (Completed on ${toPdfText(completionDate)}) Tj ET`,
    '0.98 0.39 0.02 RG 1.5 w 335 125 m 507 125 l S',
    'BT /F2 11 Tf 0.08 0.13 0.22 rg 1 0 0 1 350 104 Tm (CampusHub Learning Academy) Tj ET',
    `BT /F1 9 Tf 0.45 0.49 0.55 rg 1 0 0 1 72 67 Tm (Certificate ID: ${toPdfText(certificateId)}) Tj ET`,
  ].join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
  ]

  let document = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(document.length)
    document += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = document.length
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    document += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([document], { type: 'application/pdf' })
}

export function createCourseCertificate({ learnerName, courseTitle, completedAt, certificateId }) {
  return makeCertificatePdf({ learnerName, courseTitle, completedAt, certificateId })
}

export function downloadCourseCertificate(certificate, courseTitle) {
  const fileUrl = URL.createObjectURL(certificate)
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = `${courseTitle.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-certificate.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
}
