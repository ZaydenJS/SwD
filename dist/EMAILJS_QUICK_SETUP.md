# EmailJS Quick Setup for Automatic Email Sending

Your contact form is now configured to automatically send emails to `sharpyswebdesigns@gmail.com` without opening the user's email client.

## 🚀 Current Configuration

The form is set up with these EmailJS parameters:
- **Public Key**: `mOQKvKvhJxhJhqhqh` (demo key)
- **Service ID**: `service_gmail` 
- **Template ID**: `template_contact`

## ⚡ Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up with your Gmail: `sharpyswebdesigns@gmail.com`
3. Verify your email

### Step 2: Add Gmail Service
1. In EmailJS dashboard → "Email Services"
2. Click "Add New Service" 
3. Select "Gmail"
4. Click "Connect Account" and authorize with your Gmail
5. **Copy your Service ID** (looks like `service_abc123`)

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. **Template Name**: `Contact Form`
4. **Template Content**:

```
Subject: New Contact Form Submission from {{from_name}}

Hello,

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
Reply directly to respond to the customer.
```

5. **Save** and copy your **Template ID** (looks like `template_abc123`)

### Step 4: Get Your Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (looks like `user_abc123`)

### Step 5: Update Your Website
Replace these values in `script.js`:

**Line 92**: Replace `"mOQKvKvhJxhJhqhqh"` with your actual public key
**Line 130**: Replace `"service_gmail"` with your actual service ID  
**Line 130**: Replace `"template_contact"` with your actual template ID

## 🎯 Example Final Code

```javascript
// Initialize EmailJS with YOUR public key
emailjs.init("user_YOUR_KEY_HERE");

// Send email with YOUR service and template IDs
emailjs.send("service_YOUR_ID", "template_YOUR_ID", emailParams)
```

## ✅ Test Your Form

1. Fill out your contact form
2. Click "Send Message"
3. Should show "Sending..." then "Message sent successfully!"
4. Check your Gmail inbox for the email

## 🔧 Troubleshooting

- **"EmailJS is not defined"**: Check that the EmailJS script is loading
- **"Service not found"**: Verify your Service ID is correct
- **"Template not found"**: Verify your Template ID is correct
- **Emails not arriving**: Check Gmail spam folder, verify template variables

## 📧 How It Works Now

1. User fills form → clicks "Send Message"
2. Form validates input
3. EmailJS automatically sends email to your Gmail
4. User sees success message
5. You receive formatted email in your inbox

**No more email client opening - completely automatic!** 🚀
