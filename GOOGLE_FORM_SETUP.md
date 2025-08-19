# Google Form Setup for Two-Step Lead Intake

## 🚀 Complete Setup Guide

Your two-step lead intake system is now ready! Here's how to complete the Google Form integration:

### Step 1: Create Your Google Form

1. Go to [forms.google.com](https://forms.google.com/)
2. Click "Create a new form"
3. Title: "SwD Project Brief - Detailed Requirements"
4. Description: "Help us understand your project better so we can provide the most accurate quote and timeline."

### Step 2: Add These Form Fields

**Section 1: Contact Information (Pre-filled)**
- Full Name (Short answer) - *Required*
- Email Address (Short answer) - *Required*  
- Phone Number (Short answer)
- Company Name (Short answer)

**Section 2: Project Details**
- What type of website do you need? (Multiple choice)
  - Business/Corporate Website
  - E-commerce Store
  - Portfolio/Creative Site
  - Blog/Content Site
  - Landing Page
  - Web Application
  - Other

- What's your primary goal? (Multiple choice)
  - Increase sales/conversions
  - Build brand awareness
  - Showcase portfolio
  - Generate leads
  - Provide information
  - Sell products online
  - Other

- Do you have existing branding? (Multiple choice)
  - Yes, complete brand guidelines
  - Yes, basic logo/colors
  - Some elements, need refinement
  - No, need complete branding

**Section 3: Technical Requirements**
- Do you need these features? (Checkboxes)
  - Contact forms
  - Online booking/scheduling
  - E-commerce functionality
  - User accounts/login
  - Content management system
  - Search functionality
  - Social media integration
  - Email marketing integration
  - Analytics tracking
  - SEO optimization

- Do you have content ready? (Multiple choice)
  - Yes, all content is ready
  - Partially, some content ready
  - No, need help with content creation

**Section 4: Design Preferences**
- Design style preference (Multiple choice)
  - Modern/Minimalist
  - Bold/Creative
  - Professional/Corporate
  - Elegant/Luxury
  - Fun/Playful
  - Industry-specific
  - Not sure, need guidance

- Color preferences (Short answer)
- Websites you like (Long answer)
- Websites you dislike (Long answer)

**Section 5: Timeline & Budget**
- When do you need this completed? (Multiple choice)
  - ASAP (Rush job)
  - Within 1 week
  - Within 2 weeks
  - Within 1 month
  - Flexible timeline

- What's your total project budget? (Multiple choice)
  - Under $1,500
  - $1,500 - $3,000
  - $3,000 - $5,000
  - $5,000 - $10,000
  - $10,000+
  - Need quote first

**Section 6: Additional Information**
- Tell us more about your business (Long answer)
- Specific requirements or questions (Long answer)
- How did you hear about us? (Multiple choice)

### Step 3: Get Form ID and Field IDs

1. **Get Form ID:**
   - In your form, click "Send"
   - Copy the link - it looks like: `https://docs.google.com/forms/d/e/FORM_ID_HERE/viewform`
   - Copy the FORM_ID_HERE part

2. **Get Field IDs:**
   - Open your form
   - Right-click → "View Page Source"
   - Search for "entry." - you'll find IDs like `entry.123456789`
   - Note down each field's entry ID

### Step 4: Update Your Code

Replace these in `script.js` and `thank-you.html`:

**In script.js (line 324):**
```javascript
const formId = "YOUR_ACTUAL_FORM_ID_HERE";
```

**Replace field IDs (lines 328-342):**
```javascript
if (data.name) formURL += `&entry.ACTUAL_NAME_ID=${encodeURIComponent(data.name)}`;
if (data.email) formURL += `&entry.ACTUAL_EMAIL_ID=${encodeURIComponent(data.email)}`;
// ... etc for each field
```

**In thank-you.html (line 147):**
```javascript
const formId = 'YOUR_ACTUAL_FORM_ID_HERE';
```

### Step 5: Set Up Form Responses

1. In your Google Form, click "Responses"
2. Click the Google Sheets icon to create a spreadsheet
3. This will collect all detailed project briefs

### Step 6: Test the Complete Flow

1. Fill out your contact form
2. Should redirect to thank-you page
3. Check your email for the auto-reply
4. Click "Complete Project Brief" - should open prefilled Google Form
5. Submit Google Form - should appear in your spreadsheet

## 🎯 How It Works

**Step 1:** User submits contact form
- Gets basic info (name, email, service, budget, timeline, message)
- Sends to your email
- Sends auto-reply to user

**Step 2:** User sees thank-you page with 3 options:
- Complete detailed project brief (Google Form)
- Book 30-min consultation (Calendly)
- Call directly (phone)

**Auto-reply email includes:**
- Thank you message
- All 3 next step options
- Their submission details
- Professional branding

## 📧 Email Templates

The auto-reply includes:
- Personalized greeting
- Next steps with all 3 options
- Their original submission details
- Professional signature
- Clear call-to-action

## 🔧 Customization Options

- Modify the Google Form questions for your needs
- Update the auto-reply email template
- Customize the thank-you page design
- Add tracking/analytics

Your two-step lead intake system is now complete and professional! 🚀
