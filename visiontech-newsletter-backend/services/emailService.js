const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.useSendGrid = true;
    } else {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendNewsletter(newsletter, subscribers) {
    const results = [];
    
    for (const subscriber of subscribers) {
      try {
        const emailData = {
          to: subscriber.email,
          from: process.env.FROM_EMAIL || 'noreply@visiontech.com',
          subject: newsletter.title,
          html: this.generateEmailHTML(newsletter, subscriber),
          text: this.generateEmailText(newsletter)
        };

        let result;
        if (this.useSendGrid) {
          result = await sgMail.send(emailData);
        } else {
          result = await this.transporter.sendMail(emailData);
        }

        results.push({
          email: subscriber.email,
          success: true,
          messageId: result.messageId || 'sent'
        });
      } catch (error) {
        results.push({
          email: subscriber.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  generateEmailHTML(newsletter, subscriber) {
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BACKEND_URL;
    const homepageLink = frontendUrl
      ? `${frontendUrl}/?token=${subscriber.unsubscribeToken}`
      : `${backendUrl}`;
    const greeting = subscriber.name ? `Hi ${subscriber.name},` : 'Hello,';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${newsletter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${newsletter.title}</h1>
            ${newsletter.description ? `<p>${newsletter.description}</p>` : ''}
          </div>
          
          <div class="content">
            <p>${greeting}</p>
            ${newsletter.content}
            ${newsletter.imageUrl ? `<img src="${newsletter.imageUrl}" alt="${newsletter.title}" style="max-width: 100%; height: auto;">` : ''}
          </div>
          
          <div class="footer">
            <p>You're receiving this because you subscribed to VisionTech Newsletter.</p>
            <p><a href="${homepageLink}">Unsubscribe</a></p>
          </div>
        </div>
        
        </body>
      </html>
    `;
  }

  generateEmailText(newsletter) {
    return `${newsletter.title}\n\n${newsletter.description || ''}\n\n${newsletter.content}`;
  }

  async sendTestEmail(to, subject, content) {
    const emailData = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@visiontech.com',
      subject,
      html: content
    };

    if (this.useSendGrid) {
      return await sgMail.send(emailData);
    } else {
      return await this.transporter.sendMail(emailData);
    }
  }
}

module.exports = new EmailService();
