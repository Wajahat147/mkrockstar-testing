import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderData } = body;

    // Validate required data
    if (!orderData) {
      return new Response(JSON.stringify({ error: "Missing orderData" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const ownerEmail = Deno.env.get("OWNER_EMAIL");
    if (!ownerEmail) {
      return new Response(JSON.stringify({ error: "OWNER_EMAIL not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Pre-generate dynamic HTML blocks for the template
    const itemsHtml = orderData.items.map((item: any) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a;">
          <div style="font-weight: bold; color: #fff; margin-bottom: 4px;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a; text-align: center; color: #ccc;">${item.qty}</td>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #fff;">Rs. ${item.price}</td>
      </tr>
    `).join('');

    const notesHtml = orderData.notes ? `
      <div style="background-color: #222; border-left: 3px solid #cda434; padding: 16px; margin-bottom: 30px;">
        <h4 style="margin: 0 0 8px 0; color: #cda434; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer Notes</h4>
        <p style="margin: 0; font-size: 14px; color: #ccc; font-style: italic;">"${orderData.notes}"</p>
      </div>
    ` : '';

    // Send using Resend Templates feature
    const res = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: `New Order #${orderData.order_id} from ${orderData.customer_name}`,
      template: {
        id: "9675a370-863a-48ed-8133-c0ecb6c53fae",
        variables: {
          ORDER_ID: String(orderData.order_id),
          CUSTOMER_NAME: String(orderData.customer_name),
          CUSTOMER_EMAIL: String(orderData.email),
          CUSTOMER_PHONE: String(orderData.phone || 'N/A'),
          CUSTOMER_ADDRESS: String(orderData.address || 'N/A'),
          TOTAL_AMOUNT: String(orderData.total_amount),
          PAYMENT_METHOD: String(orderData.payment_method || 'Cash on Delivery'),
          ORDER_SUMMARY_HTML: itemsHtml,
          CUSTOMER_NOTES: notesHtml
        }
      }
    });

    if (res.error) {
      throw new Error(res.error.message);
    }

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Resend Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
