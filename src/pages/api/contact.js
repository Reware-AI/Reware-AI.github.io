// This is a server-side API endpoint for handling form submissions securely
import { loadEnv } from 'vite';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV, process.cwd(), '');
const RECEIVER_EMAIL = env.RECEIVER_EMAIL || 'ho.hajipour@gmail.com';
const MAILGUN_API_KEY = env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = env.MAILGUN_DOMAIN;
const MAILGUN_EU_REGION = env.MAILGUN_EU_REGION === 'true';

// Function to add random delay to prevent timing attacks
async function addRandomDelay() {
  const minDelay = 500; // 500ms
  const maxDelay = 1500; // 1.5s
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Simple rate limiting
const rateLimiter = {
  requests: new Map(),
  maxRequests: 5, // Max requests per IP
  timeWindow: 3600000, // 1 hour in milliseconds
  
  isAllowed: function(ip) {
    const now = Date.now();
    const userRequests = this.requests.get(ip) || [];
    
    // Filter out expired requests
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.timeWindow);
    
    // Check if under the limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      this.requests.set(ip, validRequests);
      return true;
    }
    
    return false;
  }
};

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Function to send email using Mailgun API
async function sendMailgunEmail(name, email, subject, message) {
  // Sanitize inputs before using them
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = email; // Don't sanitize email as it's used for validation
  const sanitizedSubject = sanitizeInput(subject);
  const sanitizedMessage = sanitizeInput(message);
  
  const mailgun = new Mailgun(FormData);
  
  // Configure Mailgun client with API key and optional EU endpoint
  const clientConfig = {
    username: 'api',
    key: MAILGUN_API_KEY,
  };
  
  // Add EU endpoint if configured
  if (MAILGUN_EU_REGION) {
    clientConfig.url = "https://api.eu.mailgun.net";
  }
  
  const mg = mailgun.client(clientConfig);

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `RewareAI Website <postmaster@${MAILGUN_DOMAIN}>`,
      to: [RECEIVER_EMAIL],
      subject: `Contact Form: ${sanitizedSubject}`,
      text: `
Name: ${sanitizedName}
Email: ${sanitizedEmail}
Subject: ${sanitizedSubject}
Message: ${sanitizedMessage}
      `,
      html: `
<h2>New Message from RewareAI Contact Form</h2>
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Subject:</strong> ${sanitizedSubject}</p>
<p><strong>Message:</strong></p>
<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log('Email sent via Mailgun API:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email via Mailgun:', error);
    throw error;
  }
}

export async function POST({ request }) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limit
    if (!rateLimiter.isAllowed(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      
      // Add random delay to prevent timing attacks
      await addRandomDelay();
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        }
      );
    }
    
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const subject = data.get('subject') || 'New Contact Form Submission';
    const message = data.get('message');
    const csrfToken = data.get('csrf_token');
    const honeypot = data.get('website');
    
    // Check if honeypot field was filled (spam bot)
    if (honeypot) {
      console.warn(`Potential spam bot detected from IP: ${ip}, honeypot field was filled`);
      // Return success to the bot but don't actually send the email
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Your message has been sent successfully. We will get back to you soon!',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Check for CSRF token
    if (!csrfToken) {
      console.warn(`CSRF token missing for request from IP: ${ip}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid request. Please refresh the page and try again.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please fill in all required fields.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please enter a valid email address.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Validate message length
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Message is too long (maximum 5000 characters).',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Validate Mailgun configuration
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error('Mailgun is not properly configured. Missing API key or domain.');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email service is not properly configured. Please try again later.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    try {
      // Send email using Mailgun API
      await sendMailgunEmail(name, email, subject, message);
      
      // Log the submission (for backup/debugging)
      console.log('Form submission received:', { 
        name: sanitizeInput(name), 
        email: sanitizeInput(email), 
        subject: sanitizeInput(subject),
        ip,
        timestamp: new Date().toISOString()
      });
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Your message has been sent successfully. We will get back to you soon!',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    } catch (emailError) {
      // Log the error but don't expose it to the user
      console.error('Error sending email:', emailError);
      console.error('Email configuration:', {
        mailgunDomain: MAILGUN_DOMAIN ? MAILGUN_DOMAIN : 'not_configured',
        euRegion: MAILGUN_EU_REGION ? 'enabled' : 'disabled',
        receiver: RECEIVER_EMAIL,
        error: emailError.message,
        stack: emailError.stack
      });
      
      // Return error response to the user
      return new Response(
        JSON.stringify({
          success: false,
          message: 'There was an error sending your message. Please try again later.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'There was an error processing your request. Please try again later.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
