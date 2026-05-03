import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

/**
 * Generates a PDF ticket buffer with event and attendee information
 * @param {Object} ticketData - Ticket information
 * @param {string} ticketData.orderRef - Order reference number
 * @param {string} ticketData.eventTitle - Event name
 * @param {string} ticketData.eventDate - Event date
 * @param {string} ticketData.eventTime - Event time
 * @param {string} ticketData.categoryName - Ticket category/type
 * @param {string} ticketData.venueName - Venue name
 * @param {string} ticketData.venueAddress - Venue address
 * @param {string} ticketData.attendeeName - Attendee full name
 * @param {string} ticketData.email - Attendee email
 * @param {number} ticketData.quantity - Number of tickets
 * @returns {Buffer} PDF content as a buffer
 */
export function generateTicketPDF(ticketData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header with venue name in red
    doc
      .fontSize(24)
      .fillColor('#DC2626')
      .text('FOX THEATRE ATLANTA', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#888')
      .text('660 Peachtree St NE, Atlanta, GA 30308', { align: 'center' })
      .moveDown(1.2);

    // Ticket title
    doc
      .fontSize(18)
      .fillColor('#000')
      .text('MOBILE TICKET', { align: 'center' })
      .moveDown(0.8);

    // Horizontal line
    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    // Event title
    doc
      .fontSize(16)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.eventTitle, { align: 'center' })
      .moveDown(0.6);

    // Event details grid
    const detailsY = doc.y;
    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('DATE & TIME');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(`${ticketData.eventDate} • ${ticketData.eventTime}`)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('TICKET TYPE');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.categoryName)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('QUANTITY');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(`${ticketData.quantity} ticket${ticketData.quantity > 1 ? 's' : ''}`)
      .moveDown(0.8);

    // Horizontal line
    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    // Attendee information
    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('ATTENDEE NAME');
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.attendeeName)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('EMAIL');
    doc
      .fontSize(10)
      .fillColor('#0066CC')
      .text(ticketData.email)
      .moveDown(0.8);

    // Horizontal line
    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    // QR Code placeholder and order reference
    doc
      .fontSize(9)
      .fillColor('#999')
      .text('[QR CODE PLACEHOLDER]', { align: 'center' })
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('ORDER REFERENCE', { align: 'center' })
      .moveDown(0.2);

    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.orderRef, { align: 'center' })
      .moveDown(1);

    // Footer
    doc
      .fontSize(8)
      .fillColor('#999')
      .text(
        'This is a mobile/digital ticket. Present this ticket on your mobile device at the venue entrance.',
        { align: 'center' }
      )
      .moveDown(0.3);

    doc
      .fontSize(7)
      .fillColor('#bbb')
      .text(
        `Generated: ${new Date().toLocaleString()} • Valid for one entry`,
        { align: 'center' }
      );

    doc.end();
  });
}

/**
 * Generates multiple tickets (one per quantity ordered)
 * @param {Object} ticketData - Base ticket information
 * @param {number} quantity - Number of individual tickets to generate
 * @returns {Promise<Buffer>} PDF with multiple pages
 */
export async function generateMultipleTicketPages(ticketData, quantity) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    return new Promise((resolve) => {
      resolve(Buffer.concat(chunks));
    });
  });

  for (let i = 0; i < quantity; i++) {
    if (i > 0) doc.addPage();

    doc
      .fontSize(24)
      .fillColor('#DC2626')
      .text('FOX THEATRE ATLANTA', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#888')
      .text('660 Peachtree St NE, Atlanta, GA 30308', { align: 'center' })
      .moveDown(1.2);

    doc
      .fontSize(18)
      .fillColor('#000')
      .text('MOBILE TICKET', { align: 'center' })
      .moveDown(0.8);

    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    doc
      .fontSize(16)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.eventTitle, { align: 'center' })
      .moveDown(0.6);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('DATE & TIME');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(`${ticketData.eventDate} • ${ticketData.eventTime}`)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('TICKET TYPE');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.categoryName)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('TICKET NUMBER');
    doc
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(`${i + 1} of ${quantity}`)
      .moveDown(0.8);

    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('ATTENDEE NAME');
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.attendeeName)
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('EMAIL');
    doc
      .fontSize(10)
      .fillColor('#0066CC')
      .text(ticketData.email)
      .moveDown(0.8);

    doc
      .fillColor('#ddd')
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(0.8);

    doc
      .fontSize(9)
      .fillColor('#999')
      .text('[QR CODE PLACEHOLDER]', { align: 'center' })
      .moveDown(0.4);

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('ORDER REFERENCE', { align: 'center' })
      .moveDown(0.2);

    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(ticketData.orderRef, { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(8)
      .fillColor('#999')
      .text(
        'This is a mobile/digital ticket. Present this ticket on your mobile device at the venue entrance.',
        { align: 'center' }
      )
      .moveDown(0.3);

    doc
      .fontSize(7)
      .fillColor('#bbb')
      .text(
        `Generated: ${new Date().toLocaleString()} • Ticket #${i + 1}`,
        { align: 'center' }
      );
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
