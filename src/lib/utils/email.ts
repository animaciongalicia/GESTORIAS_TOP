// Email notification utilities
// Uses Resend API (https://resend.com) - add RESEND_API_KEY to env vars

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface HighUrgencyEmailData {
  tenantName: string;
  companyName: string;
  grade: string;
  urgency: string;
  submissionId: string;
  dashboardUrl: string;
  triggers: string[];
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Diagnóstico Rentabilidad <noreply@tudominio.com>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export function generateHighUrgencyEmail(data: HighUrgencyEmailData): EmailPayload {
  const triggersList = data.triggers.length > 0
    ? `<ul>${data.triggers.map(t => `<li>${formatTrigger(t)}</li>`).join('')}</ul>`
    : '<p>Múltiples áreas en rojo</p>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">⚠️ Diagnóstico Urgente</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Se ha completado un diagnóstico con urgencia alta</p>
      </div>

      <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>Empresa:</strong>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              ${data.companyName}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>Calificación:</strong>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="background: ${data.grade === 'C' ? '#dc2626' : data.grade === 'B' ? '#d97706' : '#059669'}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                ${data.grade}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>Urgencia:</strong>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #dc2626; font-weight: bold;">ALTA</span>
            </td>
          </tr>
        </table>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 14px;">Problemas detectados:</h3>
          ${triggersList}
        </div>

        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Ver diagnóstico completo
          </a>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
          Este email fue enviado porque tienes activadas las notificaciones de urgencia alta en ${data.tenantName}.
        </p>
      </div>
    </body>
    </html>
  `;

  return {
    to: '', // Will be filled by caller
    subject: `⚠️ Diagnóstico urgente: ${data.companyName}`,
    html,
  };
}

function formatTrigger(trigger: string): string {
  const triggerTexts: Record<string, string> = {
    caja_no_semanal: 'No revisa la caja semanalmente',
    precios_desactualizados: 'Precios sin actualizar en más de un año',
    descuentos_frecuentes: 'Hace descuentos con frecuencia',
    urgencias_constantes: 'Vive apagando fuegos constantemente',
    dependencia_alta: 'El negocio depende totalmente de él/ella',
    dependencia_cliente: 'Dependencia alta de pocos clientes',
  };
  return triggerTexts[trigger] || trigger;
}

// Fire email notification asynchronously (don't block the response)
export function sendHighUrgencyEmailAsync(
  email: string,
  data: HighUrgencyEmailData
): void {
  const emailPayload = generateHighUrgencyEmail(data);
  emailPayload.to = email;

  // Fire and forget
  sendEmail(emailPayload).catch((err) => {
    console.error('Failed to send high urgency email:', err);
  });
}
