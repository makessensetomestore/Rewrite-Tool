# Rewrite-Tool

## Setup Instructions

1. Create these files and paste code:
   - public/index.html  
   - public/admin.html  
   - public/privacy.html  
   - public/terms.html  
   - public/styles.css  
   - public/script.js  
   - api/rewrite.js  
   - firebaseConfig.js  
   - vercel.json  
   - README.md

2. In `firebaseConfig.js`, replace placeholders with your Firebase project’s credentials.

3. On Vercel:
   - Create “New Project” from GitHub repo  
   - Add environment variable: `OPENAI_API_KEY = Your_OpenAI_API_Key`  
   - Deploy

4. Once deployed, visit your site, sign up, test features.

---

## Features

- Rewrite styles: Professional, Persuasive, Funny, Sarcastic, Concise, Friendly, Formal, Storytelling (premium), SEO Optimized (premium), Boost It!  
- Text conversion: Upside Down, Backwards, Mirror, Vertical, Fancy + premium: Wave, Glitch, Emoji  
- Styling: color / shadow / gradients (premium) + dark mode toggle  
- Watermark system for previews  
- Admin dashboard for managing users & watermark  
- SEO, Ad placeholders, Privacy & Terms templates  
