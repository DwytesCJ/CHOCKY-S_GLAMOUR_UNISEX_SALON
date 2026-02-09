import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// GET /api/orders/[id]/receipt - Generate PDF receipt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    // Find order by id or orderNumber
    const order: any = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - Brand
    doc.setFillColor(233, 30, 99); // Primary pink
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("CHOCKY'S", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ultimate Glamour', pageWidth / 2, 28, { align: 'center' });
    doc.text('Wandegeya, Kampala | +256 XXX XXX XXX', pageWidth / 2, 35, { align: 'center' });

    // Receipt title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', pageWidth / 2, 55, { align: 'center' });

    // Order info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-UG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    
    doc.text(`Order Number: ${order.orderNumber}`, 14, 68);
    doc.text(`Date: ${orderDate}`, 14, 74);
    doc.text(`Status: ${order.status}`, 14, 80);
    doc.text(`Payment: ${order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}`, 14, 86);

    // Customer info
    doc.text('Bill To:', pageWidth - 14, 68, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Guest' : 'Guest', pageWidth - 14, 74, { align: 'right' });
    doc.setTextColor(100, 100, 100);
    doc.text(order.user?.email || '', pageWidth - 14, 80, { align: 'right' });
    doc.text(order.user?.phone || '', pageWidth - 14, 86, { align: 'right' });

    // Separator
    doc.setDrawColor(233, 30, 99);
    doc.setLineWidth(0.5);
    doc.line(14, 92, pageWidth - 14, 92);

    // Items table
    const tableData = order.items.map((item: any, index: number) => [
      index + 1,
      item.productName || item.product?.name || 'Unknown',
      item.sku || item.product?.sku || '-',
      item.quantity,
      `UGX ${Number(item.price).toLocaleString()}`,
      `UGX ${Number(item.totalPrice).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 98,
      head: [['#', 'Item', 'SKU', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [233, 30, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const totalsX = pageWidth - 14;
    let totalsY = finalY + 12;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', totalsX - 50, totalsY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${Number(order.subtotal).toLocaleString()}`, totalsX, totalsY, { align: 'right' });

    if (Number(order.discountAmount) > 0) {
      totalsY += 7;
      doc.setTextColor(233, 30, 99);
      doc.text('Discount:', totalsX - 50, totalsY);
      doc.text(`-UGX ${Number(order.discountAmount).toLocaleString()}`, totalsX, totalsY, { align: 'right' });
    }

    totalsY += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Shipping:', totalsX - 50, totalsY);
    doc.setTextColor(0, 0, 0);
    const shippingVal = Number(order.shippingCost);
    doc.text(shippingVal === 0 ? 'FREE' : `UGX ${shippingVal.toLocaleString()}`, totalsX, totalsY, { align: 'right' });

    totalsY += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Tax (VAT 18%):', totalsX - 50, totalsY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${Number(order.taxAmount).toLocaleString()}`, totalsX, totalsY, { align: 'right' });

    // Total line
    totalsY += 4;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(totalsX - 70, totalsY, totalsX, totalsY);

    totalsY += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(233, 30, 99);
    doc.text('TOTAL:', totalsX - 50, totalsY);
    doc.text(`UGX ${Number(order.totalAmount).toLocaleString()}`, totalsX, totalsY, { align: 'right' });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with CHOCKY\'S Ultimate Glamour!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString('en-UG')}`, pageWidth / 2, footerY + 10, { align: 'center' });

    // Return PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CHOCKYS-Receipt-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
