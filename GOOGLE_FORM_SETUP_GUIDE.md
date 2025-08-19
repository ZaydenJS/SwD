# Google Form Setup Guide for SwD Two-Step Lead Intake

## Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Click "Create a new form"
3. Title: "SwD - Share Your Project Details"
4. Description: "Help us understand your project better to provide the most accurate quote and timeline."

## Step 2: Add Form Fields

Create these fields in order:

### Basic Information

1. **Full Name** (Short answer, Required)
2. **Email Address** (Short answer, Required)
3. **Phone Number** (Short answer)
4. **Company Name** (Short answer)

### Project Details

5. **Service Interested In** (Multiple choice, Required)

   - Custom Web Design
   - UI/UX Design
   - E-commerce Development
   - SEO Optimization
   - Backend Integration
   - Website Maintenance
   - Consultation Only

6. **Project Budget** (Multiple choice, Required)

   - Under $1,500
   - $2,000
   - $3,000
   - $4,000
   - $5,000+

7. **Project Timeline** (Multiple choice, Required)

   - ASAP
   - 1 Week
   - 2 Weeks
   - 3 Weeks
   - Flexible

8. **Project Details** (Paragraph, Required)
   - Description: "Tell us about your project, goals, and any specific requirements..."

### Additional Questions for Step 2

9. **Current Website** (Short answer)

   - Description: "Do you have an existing website? If yes, please provide the URL."

10. **Target Audience** (Short answer, Required)

    - Description: "Who is your target audience? (e.g., young professionals, families, businesses)"

11. **Preferred Design Style** (Multiple choice)

    - Modern & Minimalist
    - Bold & Creative
    - Professional & Corporate
    - Futuristic & Tech-forward
    - Classic & Traditional
    - Other (please specify)

12. **Key Features Needed** (Checkboxes)

    - Contact Forms
    - Online Booking/Scheduling
    - E-commerce/Shopping Cart
    - Blog/News Section
    - Photo Gallery
    - Video Integration
    - Social Media Integration
    - Search Functionality
    - User Accounts/Login
    - Payment Processing
    - Analytics/Tracking
    - Other (please specify)

13. **Inspiration/References** (Paragraph)

    - Description: "Please share any websites, designs, or references that inspire you for this project."

14. **Success Metrics** (Paragraph)

    - Description: "How will you measure the success of this project? (e.g., increased sales, more leads, better user engagement)"

15. **Additional Requirements** (Paragraph)
    - Description: "Any other specific requirements, integrations, or features you need?"

## Step 3: Get Form ID and Field IDs

1. **Get Form ID:**

   - In your form, click "Send"
   - Copy the link - it looks like: `https://docs.google.com/forms/d/e/FORM_ID_HERE/viewform`
   - Copy the FORM_ID_HERE part

2. **Get Field IDs:**
   - Open your form in edit mode
   - Right-click on each field and "Inspect Element"
   - Look for `data-params` or `name` attributes that start with `entry.`
   - Example: `entry.123456789`

## Step 4: Update Your Code

Replace in `script.js`:

```javascript
function createGoogleFormURL(data) {
  // Replace with your actual Google Form ID
  const formId = "YOUR_ACTUAL_FORM_ID_HERE";
  let formURL = `https://docs.google.com/forms/d/e/${formId}/viewform?usp=pp_url`;

  // Replace with your actual field IDs
  if (data.name)
    formURL += `&entry.YOUR_NAME_FIELD_ID=${encodeURIComponent(data.name)}`;
  if (data.email)
    formURL += `&entry.YOUR_EMAIL_FIELD_ID=${encodeURIComponent(data.email)}`;
  if (data.phone)
    formURL += `&entry.YOUR_PHONE_FIELD_ID=${encodeURIComponent(data.phone)}`;
  if (data.company)
    formURL += `&entry.YOUR_COMPANY_FIELD_ID=${encodeURIComponent(
      data.company
    )}`;
  if (data.service)
    formURL += `&entry.YOUR_SERVICE_FIELD_ID=${encodeURIComponent(
      data.service
    )}`;
  if (data.budget)
    formURL += `&entry.YOUR_BUDGET_FIELD_ID=${encodeURIComponent(data.budget)}`;
  if (data.timeline)
    formURL += `&entry.YOUR_TIMELINE_FIELD_ID=${encodeURIComponent(
      data.timeline
    )}`;
  if (data.message)
    formURL += `&entry.YOUR_MESSAGE_FIELD_ID=${encodeURIComponent(
      data.message
    )}`;

  return formURL;
}
```

## Step 5: Test Your Setup

1. Submit your contact form
2. Check that the success message appears with all three buttons
3. Click "Complete Project Brief" - it should open your Google Form with prefilled data
4. Check that the auto-reply email includes the correct Google Form link

## Step 6: Form Settings

In your Google Form settings:

1. **Responses** → Turn on "Collect email addresses"
2. **Responses** → Turn on "Send respondents a copy of their response"
3. **Presentation** → Customize confirmation message:

   ```
   Thank you for completing your project brief!

   We'll review your detailed requirements and get back to you within 24 hours with a personalized proposal.

   Questions? Call us at 0459 437 764 or email sharpyswebdesigns@gmail.com
   ```

## Troubleshooting

- **Form not prefilling?** Double-check your field IDs
- **Form ID not working?** Make sure you copied the correct part of the URL
- **Fields not matching?** Ensure the field names in your contact form match the Google Form fields

## Example Working URL

```
https://docs.google.com/forms/d/e/1FAIpQLSd_EXAMPLE_ID/viewform?usp=pp_url&entry.123456789=John%20Doe&entry.987654321=john@example.com
```

This creates a professional two-step lead qualification system that captures initial interest and then gathers detailed project requirements for accurate quoting.
