# Homepage UI/UX Fix Plan

## Priority 1: Logo Implementation (Immediate)

### Issue:
The new Bvester logo (hexagonal Africa design) is not displaying correctly due to missing CSS styles in homepage-revenue.css

### Solution:
1. Add `.nav__logo-img` styles to homepage-revenue.css
2. Ensure consistent logo sizing (40px x 40px)
3. Remove old `.nav__logo-mark` styles
4. Test on all screen sizes

### Implementation:
```css
.nav__logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
}
```

## Priority 2: Navigation Consistency

### Issues:
- Mobile menu conflicts
- Inconsistent spacing
- Z-index layering problems

### Solutions:
1. Standardize navigation heights (60px desktop, 56px mobile)
2. Fix z-index hierarchy:
   - Mobile overlay: z-index: 998
   - Mobile menu: z-index: 999
   - Navigation bar: z-index: 1000
3. Consistent padding and margins

## Priority 3: Typography Fixes

### Issues:
- CamelCase CSS properties causing warnings
- Inconsistent font scales
- Text overflow on mobile

### Solutions:
1. Replace all camelCase properties:
   - fontSize → font-size
   - fontWeight → font-weight
   - lineHeight → line-height
2. Implement proper font scale:
   - Mobile: 14px base
   - Tablet: 15px base
   - Desktop: 16px base
3. Add text truncation for long content

## Priority 4: Mobile Responsiveness

### Issues:
- Hero text too large
- Feature cards not stacking properly
- CTA buttons cut off

### Solutions:
1. Hero section mobile styles:
   - H1: 2rem (mobile) → 3.5rem (desktop)
   - P: 1rem (mobile) → 1.25rem (desktop)
2. Feature cards:
   - Stack vertically on mobile (<768px)
   - 2 columns on tablet (768px-1024px)
   - 3 columns on desktop (>1024px)
3. CTA buttons:
   - Full width on mobile
   - Fixed width on desktop

## Priority 5: Visual Hierarchy

### Issues:
- Insufficient contrast
- CTA buttons not prominent
- Inconsistent spacing

### Solutions:
1. Hero section:
   - Add overlay gradient for better text contrast
   - Increase CTA button size and add shadow
2. Feature sections:
   - Add hover effects
   - Consistent card heights
   - Better icon alignment
3. Pricing section:
   - Highlight recommended plan
   - Add subtle animations
   - Fix alignment issues

## Implementation Order:

1. **Phase 1: Critical Fixes (Today)**
   - Fix logo display
   - Resolve CSS syntax errors
   - Fix mobile navigation

2. **Phase 2: Responsive Design (Tomorrow)**
   - Add tablet breakpoints
   - Fix hero section scaling
   - Optimize feature cards

3. **Phase 3: Visual Polish (Day 3)**
   - Add animations
   - Improve contrast
   - Enhance CTAs

## Testing Checklist:
- [ ] Logo displays correctly on all devices
- [ ] Navigation works on mobile/tablet/desktop
- [ ] No CSS warnings in build
- [ ] Text readable on all screen sizes
- [ ] CTAs are clickable and prominent
- [ ] Smooth animations and transitions
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Page loads under 3 seconds
- [ ] Accessibility score > 90

## Success Metrics:
- Zero console errors
- Build warnings reduced by 100%
- Mobile usability score > 95
- Desktop performance score > 90
- User engagement increase by 25%