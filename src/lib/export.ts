/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => string | number);
  width?: number;
}

function getNestedValue(obj: any, path: string): string {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function getCellValue(row: any, accessor: string | ((row: any) => string | number)): string {
  if (typeof accessor === 'function') return String(accessor(row));
  return getNestedValue(row, accessor);
}

export function exportToCSV(data: any[], columns: ExportColumn[], filename: string) {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = getCellValue(row, col.accessor);
      // Escape CSV values containing commas, quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
  );

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  title: string,
  filename: string,
  summary?: { label: string; value: string }[]
) {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Header - CHOCKY'S branding
  doc.setFillColor(236, 72, 153); // pink-500
  doc.rect(0, 0, doc.internal.pageSize.width, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("CHOCKY'S Ultimate Glamour", 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 21);

  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, doc.internal.pageSize.width - 14, 13, { align: 'right' });
  doc.text(`Total Records: ${data.length}`, doc.internal.pageSize.width - 14, 21, { align: 'right' });

  // Table
  const tableHeaders = columns.map(col => col.header);
  const tableRows = data.map(row =>
    columns.map(col => getCellValue(row, col.accessor))
  );

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 34,
    theme: 'grid',
    headStyles: {
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [253, 242, 248],
    },
    styles: {
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [229, 231, 235],
    },
    margin: { left: 14, right: 14 },
  });

  // Summary section
  if (summary && summary.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, finalY + 8, doc.internal.pageSize.width - 28, 20 + (summary.length * 7), 3, 3, 'F');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, finalY + 17);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    summary.forEach((item, index) => {
      doc.text(`${item.label}: ${item.value}`, 20, finalY + 25 + (index * 7));
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount} | CHOCKY'S Ultimate Glamour Unisex Salon | Wandegeya, Kampala`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 6,
      { align: 'center' }
    );
  }

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Predefined column configs for common exports
export const exportConfigs = {
  products: {
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'SKU', accessor: 'sku' },
      { header: 'Category', accessor: 'category' },
      { header: 'Price (UGX)', accessor: (r: any) => Number(r.price).toLocaleString() },
      { header: 'Stock', accessor: (r: any) => String(r.stockQuantity) },
      { header: 'Status', accessor: (r: any) => r.isActive ? 'Active' : 'Inactive' },
      { header: 'Featured', accessor: (r: any) => r.isFeatured ? 'Yes' : 'No' },
    ] as ExportColumn[],
  },
  orders: {
    columns: [
      { header: 'Order #', accessor: 'orderNumber' },
      { header: 'Customer', accessor: (r: any) => r.customer?.name || 'N/A' },
      { header: 'Email', accessor: (r: any) => r.customer?.email || 'N/A' },
      { header: 'Items', accessor: (r: any) => String(r.items || 0) },
      { header: 'Total (UGX)', accessor: (r: any) => Number(r.totalAmount).toLocaleString() },
      { header: 'Status', accessor: 'status' },
      { header: 'Payment', accessor: 'paymentStatus' },
      { header: 'Method', accessor: 'paymentMethod' },
      { header: 'Date', accessor: (r: any) => new Date(r.createdAt).toLocaleDateString() },
    ] as ExportColumn[],
  },
  customers: {
    columns: [
      { header: 'Name', accessor: (r: any) => `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A' },
      { header: 'Email', accessor: 'email' },
      { header: 'Phone', accessor: (r: any) => r.phone || 'N/A' },
      { header: 'Orders', accessor: (r: any) => String(r._count?.orders || 0) },
      { header: 'Role', accessor: 'role' },
      { header: 'Joined', accessor: (r: any) => new Date(r.createdAt).toLocaleDateString() },
    ] as ExportColumn[],
  },
  appointments: {
    columns: [
      { header: 'Appointment #', accessor: 'appointmentNumber' },
      { header: 'Customer', accessor: (r: any) => r.customer?.name || 'N/A' },
      { header: 'Service', accessor: (r: any) => r.service?.name || 'N/A' },
      { header: 'Date', accessor: (r: any) => new Date(r.date).toLocaleDateString() },
      { header: 'Time', accessor: 'startTime' },
      { header: 'Status', accessor: 'status' },
      { header: 'Total (UGX)', accessor: (r: any) => Number(r.totalAmount).toLocaleString() },
    ] as ExportColumn[],
  },
  coupons: {
    columns: [
      { header: 'Code', accessor: 'code' },
      { header: 'Type', accessor: 'discountType' },
      { header: 'Value', accessor: (r: any) => r.discountType === 'PERCENTAGE' ? `${r.discountValue}%` : `UGX ${Number(r.discountValue).toLocaleString()}` },
      { header: 'Usage', accessor: (r: any) => `${r.usedCount || 0}/${r.usageLimit || '∞'}` },
      { header: 'Status', accessor: (r: any) => r.isActive ? 'Active' : 'Inactive' },
      { header: 'Expires', accessor: (r: any) => r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : 'Never' },
    ] as ExportColumn[],
  },
  services: {
    columns: [
      { header: 'Service', accessor: 'name' },
      { header: 'Category', accessor: 'category' },
      { header: 'Duration', accessor: (r: any) => `${r.duration} min` },
      { header: 'Price (UGX)', accessor: (r: any) => Number(r.price).toLocaleString() },
      { header: 'Status', accessor: (r: any) => r.isActive ? 'Active' : 'Inactive' },
    ] as ExportColumn[],
  },
  blog: {
    columns: [
      { header: 'Title', accessor: 'title' },
      { header: 'Author', accessor: (r: any) => r.author ? `${r.author.firstName || ''} ${r.author.lastName || ''}`.trim() : 'Unknown' },
      { header: 'Status', accessor: (r: any) => r.isPublished ? 'Published' : 'Draft' },
      { header: 'Views', accessor: (r: any) => String(r.views || 0) },
      { header: 'Created', accessor: (r: any) => new Date(r.createdAt).toLocaleDateString() },
    ] as ExportColumn[],
  },
};
