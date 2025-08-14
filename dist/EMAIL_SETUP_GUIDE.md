# Email Setup Guide for Contact Form

Your contact form has been updated to send emails directly to your email address using EmailJS. Follow these steps to complete the setup:

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Connect Your Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (e.g., "service_abc123")

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: New Contact Form Submission from {{from_name}}

You have received a new message from your website contact form:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Company: {{company}}
Service Interested In: {{service}}
Project Budget: {{budget}}
Project Timeline: {{timeline}}

Message:
{{message}}

---
This message was sent from your website contact form.
Reply directly to this email to respond to {{from_name}}.
```

4. Save the template and note down your **Template ID** (e.g., "template_xyz789")

## Step 4: Get Your Public Key

1. Go to "Account" → "General"
2. Find your **Public Key** (e.g., "user_abc123xyz")

## Step 5: Update Your Website

Open `script.js` and replace these placeholders:

1. Line 92: Replace `"YOUR_PUBLIC_KEY"` with your actual public key
2. Line 130: Replace `"YOUR_SERVICE_ID"` with your service ID
3. Line 130: Replace `"YOUR_TEMPLATE_ID"` with your template ID
4. Line 125: Replace `"your-email@example.com"` with your actual email address

## Example Configuration

```javascript
// Initialize EmailJS
emailjs.init("user_abc123xyz"); // Your public key

// In the send function:
emailjs.send("service_gmail123", "template_contact456", emailParams)
```

## Step 6: Test Your Form

1. Open your contact page
2. Fill out the form with test data
3. Submit the form
4. Check your email inbox for the message

## Security Notes

- EmailJS handles the email sending securely
- Your email credentials are never exposed in the frontend code
- The public key is safe to include in your JavaScript
- Consider upgrading to a paid plan for higher email limits if needed

## Troubleshooting

- **Form not sending**: Check browser console for errors
- **Emails not received**: Check spam folder, verify template variables
- **Rate limits**: Free plan allows 200 emails/month
- **CORS errors**: Make sure your domain is added to EmailJS allowed origins

## Alternative: Fallback to Mailto

If you prefer a simpler solution, I can also set up a mailto link fallback that opens the user's email client with pre-filled information.

---

Once you've completed these steps, your contact form will send emails directly to your inbox!
