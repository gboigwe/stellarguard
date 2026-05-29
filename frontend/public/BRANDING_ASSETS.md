# Frontend Branding Assets

This directory should contain the following branding assets for StellarGuard. These files are referenced in `src/app/layout.tsx` and `manifest.json` for proper PWA installation, social sharing, and browser display.

## Required Assets

### Favicon
- **File**: `favicon.ico`
- **Size**: 48x48 pixels
- **Format**: ICO format with multiple sizes embedded
- **Purpose**: Browser tab icon

### PWA Icons
- **File**: `icon-192.png`
- **Size**: 192x192 pixels
- **Format**: PNG
- **Purpose**: PWA icon for Android devices, home screen

- **File**: `icon-512.png`
- **Size**: 512x512 pixels
- **Format**: PNG
- **Purpose**: PWA icon for high-resolution displays, splash screens

### Apple Touch Icon
- **File**: `apple-icon-180.png`
- **Size**: 180x180 pixels
- **Format**: PNG
- **Purpose**: iOS home screen icon (no gloss effect)

### Open Graph Image
- **File**: `og-image.png`
- **Size**: 1200x630 pixels
- **Format**: PNG
- **Purpose**: Social media preview cards (Facebook, Twitter, LinkedIn, etc.)
- **Content**: Should include StellarGuard branding, logo, and tagline

## Design Guidelines

### Color Palette
- Primary: `#1a2332` (Stellar dark blue)
- Accent: `#3b82f6` (Stellar blue)
- Background: `#0a0e17` (Deep space)
- Text: `#f3f4f6` (Light gray)

### Logo
- Use the existing `stellarguard-mark.svg` as the base logo
- Maintain consistent branding across all sizes
- Ensure readability at small sizes (16x16 minimum)

### Icon Specifications
- All icons should be square
- Use transparent background for PNG files
- Maintain consistent visual weight across sizes
- Test on both light and dark backgrounds

### Open Graph Image
- Include the StellarGuard logo prominently
- Add tagline: "Decentralized Treasury Management"
- Use the brand color palette
- Leave safe zones for text overlays on social platforms
- Ensure text is readable at small sizes

## Generation Tools

Recommended tools for generating these assets:

1. **Favicon Generator**: https://realfavicongenerator.net/
   - Upload your logo and it will generate all required favicon formats

2. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Generates PWA icons in all required sizes

3. **Manual Creation**:
   - Use design tools like Figma, Sketch, or Adobe Illustrator
   - Export at exact pixel dimensions specified above
   - Use PNG format for web compatibility

## Implementation Notes

- All assets are referenced in `src/app/layout.tsx` metadata
- PWA manifest at `manifest.json` references the PWA icons
- Open Graph image is used for social media sharing
- Apple touch icon is used for iOS "Add to Home Screen"
- Favicon is used for browser tabs and bookmarks

## Current Status

The following files are currently missing and need to be created:
- `favicon.ico`
- `icon-192.png`
- `icon-512.png`
- `apple-icon-180.png`
- `og-image.png`

The existing file `stellarguard-mark.svg` can be used as the base logo for generating these assets.
