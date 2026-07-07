---
name: MK Rockstar
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary: '#c6c6c6'
  on-primary: '#303030'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#e9c349'
  on-tertiary: '#3c2f00'
  tertiary-container: '#000000'
  on-tertiary-container: '#8f7200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Anton
    fontSize: 120px
    fontWeight: '400'
    lineHeight: 110px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is engineered for a high-end streetwear audience, blending the raw energy of urban fashion with the disciplined luxury of an editorial lookbook. The brand personality is "Quiet Confidence"—it does not scream for attention but commands it through scale, negative space, and premium material finishes.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes a cinematic "Dark Mode" foundation to elevate product photography, making every item feel like a gallery piece. The interface recedes to let the content lead, using ultra-wide layouts and deliberate typography to create an atmosphere that feels expensive, exclusive, and avant-garde.

## Colors

The palette is strictly curated to maintain a moody, high-fashion aesthetic. 

- **Deep Charcoal (#121212)** serves as the primary canvas, providing a softer, more premium depth than pure black for large surfaces.
- **Pure White (#FFFFFF)** is reserved for high-contrast typography and primary calls to action, ensuring maximum legibility against dark backgrounds.
- **Metallic Gold (#D4AF37)** is used sparingly as a "prestige accent"—think of it as the hardware on a luxury bag. Use it for small interactive highlights, active states, or premium membership badges.
- **Translucency:** To achieve the Glassmorphic effect, use white at 5-10% opacity with a heavy backdrop blur for containers and navigation bars.

## Typography

Typography in this design system is used as a structural element. 

- **Headlines:** Use **Anton** in all-caps for a powerful, condensed "street" impact. It should feel architectural and urgent. For hero sections, use extreme scale (Display XL) with tight tracking.
- **Body:** **Hanken Grotesk** provides a sharp, contemporary contrast. It is clean and legible, ensuring the technical details of the garments are easily digestible.
- **Labels:** Use uppercase Hanken Grotesk with wide letter spacing for category tags, breadcrumbs, and micro-copy to reinforce the editorial feel.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with oversized margins to create an "airy" luxury feel. 

- **The 12-Column System:** Use a standard 12-column grid for desktop, but prioritize "asymmetric balance"—for example, an image spanning 7 columns with text occupying 3 columns, leaving 2 columns of dead space.
- **Negative Space:** Avoid crowding. Every element should have room to breathe. Use a base 8px scale, but favor larger jumps (32px, 64px, 128px) to define major sections.
- **Mobile:** Transition to a 2-column or single-column stack. Increase vertical padding significantly between sections to maintain the premium feel on smaller screens.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism** rather than traditional drop shadows.

- **Base Level:** Deep Charcoal (#121212).
- **Elevated Level (Cards/Modals):** A slightly lighter gray (#1A1A1A) or a Glassmorphic surface (White at 8% opacity with a 20px backdrop blur).
- **Borders:** Instead of shadows, use thin, 1px "inner glows"—semi-transparent white borders (10-15% opacity) to define edges against dark backgrounds.
- **Depth:** When shadows are necessary for high-priority modals, use a "Large Ambient Shadow": Black, 40% opacity, 60px blur, 0px spread.

## Shapes

This design system utilizes **Sharp (0)** edges to maintain a brutalist, high-fashion edge. 

Rounded corners are strictly forbidden for primary UI elements like buttons, inputs, and cards. The sharp 90-degree angles communicate precision, discipline, and a modern architectural aesthetic reminiscent of high-end streetwear packaging and store interiors.

## Components

- **Buttons:** Primary buttons are solid White with Black text, sharp corners, and all-caps Anton labels. Secondary buttons are transparent with a 1px white border. Hover states should involve a slight opacity shift or a shift to the Metallic Gold accent.
- **Inputs:** Minimalist bottom-border only or a fully boxed 1px border. Backgrounds should be slightly darker than the surface or semi-transparent.
- **Cards:** No visible borders by default; use large-scale imagery that bleeds to the edges. Product info should be displayed in a clean, systematic list below the image or as a Glassmorphic overlay at the bottom of the image.
- **Chips/Tags:** Small, sharp rectangles with a White 1px border and Label-Caps typography.
- **Lists:** High-contrast separators (1px White at 10% opacity). Use generous vertical padding (24px+) between list items.
- **Featured Component (Lookbook Carousel):** A full-screen horizontal scroll component where images take 80% of the viewport width, creating a cinematic, immersive browsing experience.