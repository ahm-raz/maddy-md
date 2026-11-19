# Maddy MD website

The landing page at <https://maddy-md.vercel.app>. React, TypeScript and Vite, no UI framework.

```
npm install
npm run dev       # local dev server
npm run lint      # oxlint
npm run build     # type-check and build to dist/
```

- Download links and the version number live in `src/config.ts`. Update `VERSION` when you publish a new release; the links point at `releases/download/v<VERSION>/`.
- Theme screenshots in `public/shots/` are real captures of the app (1366×768 WebP).
- Colours follow the app's default Orbit theme; see `../app/DESIGN.md`.
