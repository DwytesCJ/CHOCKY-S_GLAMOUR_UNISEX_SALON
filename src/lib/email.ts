import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chockys.com';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
  paymentMethod: string;
}

interface AppointmentEmailData {
  customerName: string;
  email: string;
  serviceName: string;
  date: string;
  time: string;
  stylist?: string;
  notes?: string;
}

const formatUGX = (amount: number) => `UGX ${amount.toLocaleString()}`;

// ===================== ORDER EMAILS =====================

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemRows = data.items.map(item => 
    `<tr>
      <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;">${item.name}${item.variant ? ` <small style="color:#9ca3af;">(${item.variant})</small>` : ''}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">${formatUGX(item.price * item.quantity)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">CHOCKY'S</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Ultimate Glamour</p>
      </div>
      
      <!-- Content -->
      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#e8f5e9;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;">
            <span style="color:#4caf50;font-size:28px;">✓</span>
          </div>
          <h2 style="margin:16px 0 8px;color:#1a1a1a;font-size:22px;">Order Confirmed!</h2>
          <p style="color:#6b7280;margin:0;">Thank you for your order, ${data.customerName}</p>
        </div>

        <div style="background:#fdf2f8;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
          <p style="color:#9ca3af;margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
          <p style="color:#e91e63;margin:0;font-size:24px;font-weight:bold;letter-spacing:2px;">${data.orderNumber}</p>
        </div>

        <!-- Order Items -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="border-bottom:2px solid #e5e7eb;">
              <th style="padding:12px 8px;text-align:left;font-size:13px;color:#6b7280;text-transform:uppercase;">Item</th>
              <th style="padding:12px 8px;text-align:center;font-size:13px;color:#6b7280;text-transform:uppercase;">Qty</th>
              <th style="padding:12px 8px;text-align:right;font-size:13px;color:#6b7280;text-transform:uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Totals -->
        <div style="border-top:2px solid #e5e7eb;padding-top:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Subtotal</span>
            <span>${formatUGX(data.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Shipping</span>
            <span>${data.shippingCost === 0 ? 'FREE' : formatUGX(data.shippingCost)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #e5e7eb;font-size:18px;font-weight:bold;">
            <span>Total</span>
            <span style="color:#e91e63;">${formatUGX(data.total)}</span>
          </div>
        </div>

        <!-- Shipping & Payment -->
        <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="background:#f9fafb;border-radius:8px;padding:16px;">
            <p style="color:#9ca3af;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
            <p style="margin:0;font-size:14px;color:#374151;">${data.shippingAddress}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Est. Delivery: ${data.estimatedDelivery}</p>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;">
            <p style="color:#9ca3af;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Payment</p>
            <p style="margin:0;font-size:14px;color:#374151;">${data.paymentMethod}</p>
          </div>
        </div>

        <!-- Actions -->
        <div style="text-align:center;margin-top:32px;">
          <a href="${SITE_URL}/account/orders" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Track Your Order</a>
          <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
            <a href="${SITE_URL}/api/orders/${data.orderNumber}/receipt" style="color:#e91e63;text-decoration:underline;">Download Receipt (PDF)</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">CHOCKY'S Ultimate Glamour &middot; Wandegeya, Kampala</p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">Questions? Reply to this email or call us at +256 XXX XXX XXX</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `Order Confirmed - ${data.orderNumber} | CHOCKY'S`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdate(data: {
  email: string;
  customerName: string;
  orderNumber: string;
  status: string;
  statusMessage: string;
  trackingNumber?: string;
}) {
  const statusColors: Record<string, string> = {
    PROCESSING: '#f59e0b',
    SHIPPED: '#3b82f6',
    OUT_FOR_DELIVERY: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
  };

  const color = statusColors[data.status] || '#6b7280';

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">CHOCKY'S</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;">Order Update</h2>
        <p style="color:#6b7280;margin:0 0 24px;">Hi ${data.customerName}, here's an update on your order.</p>
        
        <div style="background:#f9fafb;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Order ${data.orderNumber}</p>
          <div style="display:inline-block;background:${color};color:#ffffff;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-top:8px;">
            ${data.status.replace(/_/g, ' ')}
          </div>
        </div>

        <p style="font-size:15px;color:#374151;line-height:1.6;">${data.statusMessage}</p>
        
        ${data.trackingNumber ? `
          <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-top:16px;">
            <p style="margin:0;font-size:13px;color:#6b7280;">Tracking Number</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#1d4ed8;letter-spacing:1px;">${data.trackingNumber}</p>
          </div>
        ` : ''}

        <div style="text-align:center;margin-top:32px;">
          <a href="${SITE_URL}/account/orders" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Order Details</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">CHOCKY'S Ultimate Glamour &middot; Wandegeya, Kampala</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `Order ${data.status.replace(/_/g, ' ')} - ${data.orderNumber} | CHOCKY'S`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send order status email:', error);
    return { success: false, error };
  }
}

// ===================== APPOINTMENT EMAILS =====================

export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">CHOCKY'S</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Ultimate Glamour</p>
      </div>
      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="margin:0 0 8px;font-size:22px;">Appointment Confirmed!</h2>
          <p style="color:#6b7280;margin:0;">Hi ${data.customerName}, your appointment has been booked.</p>
        </div>

        <div style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;">Service</p>
              <p style="margin:0;font-weight:600;color:#1a1a1a;">${data.serviceName}</p>
            </div>
            <div>
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;">Date</p>
              <p style="margin:0;font-weight:600;color:#1a1a1a;">${data.date}</p>
            </div>
            <div>
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;">Time</p>
              <p style="margin:0;font-weight:600;color:#1a1a1a;">${data.time}</p>
            </div>
            ${data.stylist ? `<div>
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;">Stylist</p>
              <p style="margin:0;font-weight:600;color:#1a1a1a;">${data.stylist}</p>
            </div>` : ''}
          </div>
        </div>

        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#374151;">📍 <strong>Location:</strong> CHOCKY'S Ultimate Glamour, Wandegeya, Kampala</p>
        </div>

        ${data.notes ? `<p style="font-size:14px;color:#6b7280;"><em>Notes: ${data.notes}</em></p>` : ''}

        <div style="text-align:center;margin-top:24px;">
          <a href="${SITE_URL}/account/appointments" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Appointment</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">Need to reschedule? Contact us at +256 XXX XXX XXX</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `Appointment Confirmed - ${data.date} | CHOCKY'S`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAppointmentReminder(data: AppointmentEmailData) {
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">CHOCKY'S</h1>
      </div>
      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;font-size:48px;">⏰</div>
          <h2 style="margin:12px 0 8px;font-size:22px;">Appointment Reminder</h2>
          <p style="color:#6b7280;margin:0;">Hi ${data.customerName}, this is a reminder for your upcoming appointment.</p>
        </div>

        <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:14px;color:#92400e;">Your appointment is coming up!</p>
          <p style="margin:0;font-size:20px;font-weight:bold;color:#78350f;">${data.date} at ${data.time}</p>
          <p style="margin:8px 0 0;font-size:15px;color:#92400e;">${data.serviceName}</p>
        </div>

        <div style="background:#f9fafb;border-radius:8px;padding:16px;">
          <p style="margin:0;font-size:14px;color:#374151;">📍 CHOCKY'S Ultimate Glamour, Wandegeya, Kampala</p>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${SITE_URL}/account/appointments" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">View Appointment</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">Need to reschedule? Contact us ASAP at +256 XXX XXX XXX</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `Reminder: Appointment Tomorrow - ${data.serviceName} | CHOCKY'S`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send appointment reminder email:', error);
    return { success: false, error };
  }
}

// ===================== WELCOME EMAIL =====================

export async function sendWelcomeEmail(data: { email: string; name: string }) {
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:40px 32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:32px;letter-spacing:2px;">CHOCKY'S</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">Ultimate Glamour</p>
      </div>
      <div style="padding:32px;text-align:center;">
        <h2 style="margin:0 0 16px;font-size:24px;">Welcome, ${data.name}! 🎉</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Thank you for joining CHOCKY'S Ultimate Glamour. We're thrilled to have you!
          Explore our curated collection of beauty products, book appointments with our expert stylists,
          and enjoy exclusive member rewards.
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:32px;">
          <div style="background:#fdf2f8;border-radius:12px;padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">🛍️</div>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">Shop</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Premium Beauty</p>
          </div>
          <div style="background:#fdf2f8;border-radius:12px;padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">💇‍♀️</div>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">Book</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Appointments</p>
          </div>
          <div style="background:#fdf2f8;border-radius:12px;padding:20px;">
            <div style="font-size:24px;margin-bottom:8px;">⭐</div>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">Earn</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Rewards</p>
          </div>
        </div>

        <a href="${SITE_URL}/shop" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Start Shopping</a>
      </div>
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">CHOCKY'S Ultimate Glamour &middot; Wandegeya, Kampala</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `Welcome to CHOCKY'S Ultimate Glamour! 🎉`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// ===================== DISCOUNT EMAIL =====================

export async function sendDiscountEmail(data: {
  email: string;
  name: string;
  couponCode: string;
  discountValue: string;
  expiresAt: string;
  message?: string;
}) {
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e91e63,#d4a574);padding:32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">CHOCKY'S</h1>
      </div>
      <div style="padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">🎁</div>
        <h2 style="margin:0 0 8px;font-size:24px;">Special Offer for You!</h2>
        <p style="color:#6b7280;margin:0 0 24px;">Hi ${data.name}, we have an exclusive deal just for you.</p>
        
        <div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border:2px dashed #e91e63;border-radius:16px;padding:32px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">Your Discount</p>
          <p style="margin:0;font-size:36px;font-weight:bold;color:#e91e63;">${data.discountValue}</p>
          <div style="margin:16px 0;padding:12px 24px;background:#ffffff;border-radius:8px;display:inline-block;">
            <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Use Code</p>
            <p style="margin:0;font-size:20px;font-weight:bold;letter-spacing:3px;color:#1a1a1a;">${data.couponCode}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#9ca3af;">Valid until ${data.expiresAt}</p>
        </div>

        ${data.message ? `<p style="font-size:14px;color:#6b7280;line-height:1.6;">${data.message}</p>` : ''}

        <a href="${SITE_URL}/shop" style="display:inline-block;background:#e91e63;color:#ffffff;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:16px;">Shop Now</a>
      </div>
      <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">CHOCKY'S Ultimate Glamour &middot; Wandegeya, Kampala</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `CHOCKY'S Glamour <${FROM_EMAIL}>`,
      to: [data.email],
      subject: `${data.discountValue} OFF - Exclusive Discount Inside! | CHOCKY'S`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send discount email:', error);
    return { success: false, error };
  }
}
