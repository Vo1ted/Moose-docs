# Moose Docs

A simple document editor inspired by Google Docs, built with Next.js and hosted on GitHub Pages.

## Features

- Rich text editing
- Document management
- Comments and collaboration
- Responsive design

## Development

This project uses Next.js with static export for GitHub Pages.

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`
5. Export static files: `npm run export`

## Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.
Just push to the main branch, and the site will be deployed automatically.

## License

MIT
\`\`\`

Finally, let's create a simple index.html file for the root of the GitHub Pages site:

```html file="public/index.html"
&lt;!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/">
  <title>Moose Docs</title>
</head>
<body>
  <p>Redirecting to Moose Docs...</p>
</body>
</html>
