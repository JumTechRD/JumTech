import jsPDF from "jspdf"

export interface PdfLineItem {
  name: string
  description?: string
  quantity: number
  unitPriceLabel: string
  lineTotalLabel: string
}

export interface PdfDocumentData {
  fileName: string
  title: string
  referenceLabel: string
  referenceValue: string
  dateLabel: string
  dateValue: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerCompanyName?: string
  customerIdentification?: string
  customerAddress?: string
  paymentMethodLabel?: string
  paymentMethodValue?: string
  items: PdfLineItem[]
  subtotalLabel: string
  subtotalValue: string
  totalLabel: string
  totalValue: string
  notes?: string
  validityNote?: string
  footerText?: string
}

function loadImageAsDataUrl(src: string) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto del canvas"))
        return
      }

      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`))
    img.src = src
  })
}

export async function generateFinancialPdf(data: PdfDocumentData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const red: [number, number, number] = [190, 16, 24]
  const darkText: [number, number, number] = [20, 20, 20]
  const grayText: [number, number, number] = [90, 90, 90]
  const lightGray: [number, number, number] = [245, 245, 245]
  const lineGray: [number, number, number] = [215, 215, 215]
  const contentWidth = pageWidth - margin * 2

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  doc.setFillColor(...red)
  doc.rect(0, 0, pageWidth, 38, "F")

  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 6, 40, 24, 2, 2, "F")

  try {
    const logoDataUrl = await loadImageAsDataUrl("/images/logo-nuevo-transparente.png")
    doc.addImage(logoDataUrl, "PNG", margin + 1.5, 7.5, 37, 21.5, undefined, "FAST")
  } catch (error) {
    doc.setTextColor(35, 35, 35)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("JUMTECH RD", margin + 4, 20)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Soluciones Tecnológicas", margin + 4, 26)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Jumtech RD", margin + 46, 15)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text("Soluciones Tecnológicas Integrales", margin + 46, 20)
  doc.text("Email: jumtechRD@gmail.com", margin + 46, 25)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(data.title, pageWidth - margin, 21, { align: "right" })

  let yPosition = 48
  doc.setTextColor(...darkText)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text(`${data.referenceLabel}:`, margin, yPosition)
  doc.setFont("helvetica", "normal")
  doc.text(data.referenceValue, margin + 24, yPosition)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.dateLabel}:`, pageWidth - margin - 42, yPosition)
  doc.setFont("helvetica", "normal")
  doc.text(data.dateValue, pageWidth - margin - 25, yPosition)

  yPosition += 8
  doc.setFont("helvetica", "bold")
  doc.text("CLIENTE:", margin, yPosition)
  yPosition += 6
  doc.setFont("helvetica", "bold")
  doc.text(data.customerName, margin, yPosition)
  yPosition += 5
  doc.setFont("helvetica", "normal")
  doc.text(`Email: ${data.customerEmail}`, margin, yPosition)
  yPosition += 5
  if (data.customerPhone) {
    doc.text(`Tel: ${data.customerPhone}`, margin, yPosition)
    yPosition += 5
  }
  if (data.customerCompanyName) {
    doc.text(`Empresa: ${data.customerCompanyName}`, margin, yPosition)
    yPosition += 5
  }
  if (data.customerIdentification) {
    doc.text(`Identificación: ${data.customerIdentification}`, margin, yPosition)
    yPosition += 5
  }
  if (data.customerAddress) {
    doc.text(`Dirección: ${data.customerAddress}`, margin, yPosition)
    yPosition += 5
  }
  if (data.paymentMethodValue) {
    doc.text(`${data.paymentMethodLabel || "Método de pago"}: ${data.paymentMethodValue}`, margin, yPosition)
  }

  yPosition += 10
  const colDescWidth = 110
  const colCantWidth = 20
  const colPrecioWidth = 25
  const tableHeaderHeight = 8
  const minRowHeight = 14
  const tableBottomLimit = pageHeight - 20
  const textFirstBaseline = 5
  const textBottomPadding = 4
  const nameLineHeight = 4.2
  const descriptionLineHeight = 3.7
  const descriptionGap = 0.8

  type TableLine = {
    text: string
    kind: "name" | "description"
    advanceBefore: number
  }

  const drawTableHeader = (top: number) => {
    doc.setFillColor(...lightGray)
    doc.rect(margin, top, contentWidth, tableHeaderHeight, "F")
    doc.setDrawColor(...lineGray)
    doc.rect(margin, top, contentWidth, tableHeaderHeight)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...darkText)
    doc.text("DESCRIPCIÓN", margin + 2, top + 5.5)
    doc.text("CANT.", margin + colDescWidth + 2, top + 5.5)
    doc.text("PRECIO", margin + colDescWidth + colCantWidth + 2, top + 5.5)
    doc.text("TOTAL", margin + colDescWidth + colCantWidth + colPrecioWidth + 2, top + 5.5)

    return top + tableHeaderHeight
  }

  const addTablePage = () => {
    doc.addPage()
    yPosition = drawTableHeader(margin)
  }

  const splitPdfText = (text: string, maxWidth: number) => {
    const normalizedText = text.trim()
    if (!normalizedText) return []

    const lines = doc.splitTextToSize(normalizedText, maxWidth)
    return Array.isArray(lines) ? lines : [lines]
  }

  const getRowHeight = (lines: TableLine[]) => {
    if (lines.length === 0) return minRowHeight

    let lastBaseline = textFirstBaseline
    for (let index = 1; index < lines.length; index++) {
      lastBaseline += lines[index].advanceBefore
    }

    return Math.max(minRowHeight, lastBaseline + textBottomPadding)
  }

  const drawRowFrame = (top: number, rowHeight: number, isAlternate: boolean) => {
    if (isAlternate) {
      doc.setFillColor(252, 252, 252)
      doc.rect(margin, top, contentWidth, rowHeight, "F")
    }

    doc.setDrawColor(...lineGray)
    doc.rect(margin, top, contentWidth, rowHeight)
    doc.line(margin + colDescWidth, top, margin + colDescWidth, top + rowHeight)
    doc.line(margin + colDescWidth + colCantWidth, top, margin + colDescWidth + colCantWidth, top + rowHeight)
    doc.line(
      margin + colDescWidth + colCantWidth + colPrecioWidth,
      top,
      margin + colDescWidth + colCantWidth + colPrecioWidth,
      top + rowHeight,
    )
  }

  const drawRowText = (lines: TableLine[], top: number) => {
    let lineY = top + textFirstBaseline

    lines.forEach((line, index) => {
      if (index > 0) lineY += line.advanceBefore

      if (line.kind === "name") {
        doc.setTextColor(...darkText)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
      } else {
        doc.setTextColor(...grayText)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
      }

      doc.text(line.text, margin + 2, lineY)
    })
  }

  const drawRowTotals = (item: PdfLineItem, top: number) => {
    doc.setTextColor(...darkText)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`${item.quantity}`, margin + colDescWidth + 10, top + 8, { align: "center" })
    doc.text(item.unitPriceLabel, margin + colDescWidth + colCantWidth + colPrecioWidth - 2, top + 8, {
      align: "right",
    })
    doc.text(item.lineTotalLabel, margin + contentWidth - 2, top + 8, {
      align: "right",
    })
  }

  const drawRowChunk = (
    item: PdfLineItem,
    lines: TableLine[],
    index: number,
    shouldDrawTotals: boolean,
  ) => {
    const rowHeight = getRowHeight(lines)

    drawRowFrame(yPosition, rowHeight, index % 2 !== 0)
    drawRowText(lines, yPosition)
    if (shouldDrawTotals) drawRowTotals(item, yPosition)

    yPosition += rowHeight
  }

  yPosition = drawTableHeader(yPosition)
  const fullPageTableContentHeight = tableBottomLimit - margin - tableHeaderHeight

  for (let index = 0; index < data.items.length; index++) {
    const item = data.items[index]
    doc.setTextColor(...darkText)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    const nameLines = splitPdfText(item.name, colDescWidth - 4)
    doc.setTextColor(...grayText)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const descriptionLines = splitPdfText(item.description || "", colDescWidth - 4)
    const rowLines: TableLine[] = [
      ...(nameLines.length > 0 ? nameLines : [item.name]).map((line, lineIndex) => ({
        text: line,
        kind: "name" as const,
        advanceBefore: lineIndex === 0 ? 0 : nameLineHeight,
      })),
      ...descriptionLines.map((line, lineIndex) => ({
        text: line,
        kind: "description" as const,
        advanceBefore: lineIndex === 0 ? nameLineHeight + descriptionGap : descriptionLineHeight,
      })),
    ]
    const fullRowHeight = getRowHeight(rowLines)
    const availableHeight = tableBottomLimit - yPosition

    if (fullRowHeight > availableHeight && fullRowHeight <= fullPageTableContentHeight) {
      addTablePage()
      drawRowChunk(item, rowLines, index, true)
      continue
    }

    if (fullRowHeight <= tableBottomLimit - yPosition) {
      drawRowChunk(item, rowLines, index, true)
      continue
    }

    let remainingLines = rowLines
    let shouldDrawTotals = true

    while (remainingLines.length > 0) {
      if (tableBottomLimit - yPosition < minRowHeight) {
        addTablePage()
      }

      const nextChunk: TableLine[] = []
      for (const line of remainingLines) {
        const candidateChunk = [...nextChunk, line]
        if (getRowHeight(candidateChunk) <= tableBottomLimit - yPosition || nextChunk.length === 0) {
          nextChunk.push(line)
        } else {
          break
        }
      }

      drawRowChunk(item, nextChunk, index, shouldDrawTotals)
      remainingLines = remainingLines.slice(nextChunk.length)
      shouldDrawTotals = false

      if (remainingLines.length > 0) {
        addTablePage()
      }
    }
  }

  yPosition += 6
  const notesBoxHeight = data.validityNote ? 24 : 18
  const totalsAndNotesHeight = 8 + 11 + notesBoxHeight

  if (yPosition + totalsAndNotesHeight > pageHeight - 20) {
    doc.addPage()
    yPosition = margin
  }

  const totalsXLabel = pageWidth - margin - 45
  const totalsXValue = pageWidth - margin

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(...darkText)
  doc.text(`${data.subtotalLabel}:`, totalsXLabel, yPosition, { align: "right" })
  doc.text(data.subtotalValue, totalsXValue, yPosition, { align: "right" })
  yPosition += 8

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...red)
  doc.setFontSize(14)
  doc.text(`${data.totalLabel}:`, totalsXLabel, yPosition, { align: "right" })
  doc.text(data.totalValue, totalsXValue, yPosition, { align: "right" })

  yPosition += 11
  doc.setFillColor(236, 236, 236)
  doc.rect(margin, yPosition, contentWidth, notesBoxHeight, "F")
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...darkText)
  doc.setFontSize(10)
  doc.text("NOTAS:", margin + 2, yPosition + 6)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const notasTexto = data.notes?.trim() || "Sin notas adicionales."
  const notasLineas = doc.splitTextToSize(notasTexto, contentWidth - 6)
  doc.text(notasLineas[0] || "Sin notas adicionales.", margin + 2, yPosition + 12)

  if (data.validityNote) {
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...red)
    doc.text(data.validityNote, margin + 2, yPosition + 18)
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(150, 40, 40)
  doc.text(data.footerText || "Gracias por su confianza - Jumtech RD | Soluciones Tecnológicas", pageWidth / 2, pageHeight - 10, {
    align: "center",
  })

  doc.save(data.fileName)
}
