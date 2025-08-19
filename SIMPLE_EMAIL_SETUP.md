# Simple Email Setup (Mailto Alternative)

If you prefer a simpler solution without using EmailJS, you can set up the contact form to use your default email client instead.

## Quick Setup (Mailto Only)

1. Open `script.js`
2. Replace line 190: Change `"your-email@example.com"` to your actual email address
3. Comment out or remove the EmailJS code (lines 91-92 and 129-152)

## Modified Contact Form Function

Replace the entire `initContactForm()` function with this simpler version:

```javascript
// Contact form functionality (Simple mailto version)
function initContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!validateForm(data)) {
        return;
      }

      // Show loading state
      const submitBtn = contactForm.querySelector(".btn-primary");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Opening Email...";
      submitBtn.disabled = true;

      // Create and open mailto link
      const mailtoLink = createMailtoLink(data);
      
      showNotification(
        "Opening your email client with the message...",
        "info"
      );

      // Open email client
      setTimeout(() => {
        window.location.href = mailtoLink;
        
        // Reset form after opening email
        setTimeout(() => {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          
          showNotification(
            "Email opened! Please send the message from your email client.",
            "success"
          );
        }, 1000);
      }, 500);
    });
  }
}
```

## How It Works

1. User fills out the contact form
2. Form validates the input
3. Creates a pre-filled email with all the form data
4. Opens the user's default email client (Gmail, Outlook, etc.)
5. User can review and send the email directly

## Pros and Cons

### Pros:
- ✅ No external service dependencies
- ✅ Works offline
- ✅ No API keys or setup required
- ✅ User can review email before sending
- ✅ Uses user's preferred email client

### Cons:
- ❌ Requires user to have email client configured
- ❌ User must manually send the email
- ❌ May not work on all mobile devices
- ❌ Less seamless user experience

## Email Address Configuration

Don't forget to update your email address in:
- Line 190 in `script.js`: `mailto:your-email@example.com`

Change it to your actual email address, for example:
```javascript
return `mailto:contact@sharpyswebdesigns.com?subject=${subject}&body=${body}`;
```

## Testing

1. Open your contact page
2. Fill out the form
3. Click "Send Message"
4. Your email client should open with a pre-filled message
5. Review and send the email

This approach is simpler but requires the user to complete the email sending process manually.
