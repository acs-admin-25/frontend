import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import config from '@/lib/config/emailconfig';

export async function POST(req: NextRequest) {
  console.log('Contact API: Request received');
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    console.log('Contact API: Missing required fields', { name, email, subject, message });
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Log environment for debugging (without sensitive data)
  console.log('Contact API: Environment', {
    env: config.env,
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    hasAuth: !!config.email.smtp.auth.user && !!config.email.smtp.auth.pass,
  });

  console.log('Contact API: Creating transporter with Zoho credentials');
  // Configure nodemailer SMTP transport using config
  const transporter = nodemailer.createTransport({
    ...config.email.smtp,
    debug: true, // Enable debug logging
    logger: true, // Enable logger
  });

  // Verify SMTP connection
  try {
    console.log('Contact API: Verifying SMTP connection');
    await transporter.verify();
    console.log('Contact API: SMTP connection verified successfully');
  } catch (error) {
    console.error('Contact API: SMTP connection verification failed:', error);
    // Add more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code;
    const errorResponse = (error as any)?.response;
    
    return NextResponse.json({ 
      error: 'Email service connection failed.',
      details: {
        message: errorMessage,
        code: errorCode,
        response: errorResponse,
        env: config.env,
      }
    }, { status: 500 });
  }

  try {
    // Ensure we're using the authenticated email address
    const fromAddress = config.email.smtp.auth.user;
    const mailOptions = {
      from: `${config.email.from.name} <${fromAddress}>`,
      to: config.email.to,
      subject: `[${config.site.name} Contact] ${subject}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
    };

    console.log('Contact API: Sending email', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      env: config.env,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log('Contact API: Email sent successfully', {
      messageId: info.messageId,
      response: info.response,
      env: config.env,
    });

    return NextResponse.json({ 
      success: true,
      messageId: info.messageId,
      response: info.response,
      env: config.env,
    });
  } catch (error) {
    console.error('Contact API: Failed to send email:', error);
    // Add more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code;
    const errorResponse = (error as any)?.response;
    
    return NextResponse.json({ 
      error: 'Failed to send email.',
      details: {
        message: errorMessage,
        code: errorCode,
        response: errorResponse,
        env: config.env,
      }
    }, { status: 500 });
  }
} 