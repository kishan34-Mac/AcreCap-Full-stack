# 📱 Responsive Design - Quick Reference Card

## 🎯 Breakpoints at a Glance

```
Mobile:     320px-480px    (default styles apply)
Tablet:     481px-1024px   (sm:, md:, lg: prefixes)
Desktop:    1025px+        (lg:, xl:, 2xl: prefixes)
```

## 🔧 Most Used Responsive Patterns

### Typography

```tsx
<h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Title
</h1>

<p className="text-xs sm:text-sm md:text-base lg:text-lg">
  Body text that scales smoothly
</p>
```

### Spacing

```tsx
<div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
  Content with responsive margin
</div>

<div className="gap-3 sm:gap-4 md:gap-6 lg:gap-8">
  Grid with responsive gap
</div>
```

### Grid Layouts

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Items automatically rearrange at breakpoints */}
</div>
```

### Visibility

```tsx
{
  /* Hide on mobile, show on tablet+ */
}
<div className="hidden sm:block">Desktop content</div>;

{
  /* Show on mobile only */
}
<div className="sm:hidden">Mobile content</div>;

{
  /* Different on each breakpoint */
}
<div className="text-center sm:text-left lg:text-right">Alignment changes</div>;
```

### Padding & Sizing

```tsx
<div className="px-3 sm:px-4 md:px-6 lg:px-8">
  Responsive horizontal padding
</div>

<button className="px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
  Button that grows on larger screens
</button>
```

## ✅ Component Template

Copy this for new components:

```tsx
export const MyComponent = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 text-center">
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Title
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Description
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Item */}
          <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
            Card content
          </div>
        </div>
      </div>
    </section>
  );
};
```

## 🚀 Quick Testing

### In Browser DevTools (Chrome/Firefox)

1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)
3. Select device or set custom width

### Device Sizes to Test

```
iPhone SE:         375px
iPhone 12:         390px
Galaxy S10:        360px
iPad:              768px
iPad Pro:          1024px
MacBook Air:       1440px
```

## 📏 Font Size Scale (Recommended)

```
Mobile (320px):
- H1: 20px (text-lg)
- H2: 18px (text-base)
- Body: 14px (text-sm)
- Small: 12px (text-xs)

Tablet (768px):
- H1: 28px (text-2xl)
- H2: 20px (text-lg)
- Body: 16px (text-base)
- Small: 14px (text-sm)

Desktop (1024px+):
- H1: 36px (text-4xl)
- H2: 28px (text-2xl)
- Body: 18px (text-lg)
- Small: 14px (text-sm)
```

## 🎨 Spacing Scale (Recommended)

```
Mobile (320px):
- Section padding: 32px (py-8)
- Container padding: 12px (px-3)
- Gap between items: 12px (gap-3)
- Component pad: 12px (p-3)

Tablet (768px):
- Section padding: 56px (py-14)
- Container padding: 16px (px-4)
- Gap between items: 16px (gap-4)
- Component pad: 16px (p-4)

Desktop (1024px+):
- Section padding: 96px (py-24)
- Container padding: 32px (px-8)
- Gap between items: 24px (gap-6)
- Component pad: 32px (p-8)
```

## ❌ Common Mistakes to Avoid

```tsx
// ❌ BAD - Hardcoded widths
<div className="w-1200">Too wide for mobile</div>

// ✅ GOOD - Responsive width
<div className="w-full md:w-4/5 lg:max-w-5xl">Responsive width</div>

// ❌ BAD - Same size everywhere
<div className="text-3xl p-10">Same everywhere</div>

// ✅ GOOD - Scales by breakpoint
<div className="text-xl sm:text-2xl md:text-3xl p-3 sm:p-6 lg:p-10">
  Responsive scaling
</div>

// ❌ BAD - Overflow on mobile
<div className="flex gap-10">Too much gap</div>

// ✅ GOOD - Responsive gap
<div className="flex gap-2 sm:gap-4 md:gap-6">Responsive gap</div>

// ❌ BAD - Hide entirely on mobile
<div className="block">Always visible</div>

// ✅ GOOD - Show appropriate content
<div className="block sm:hidden">Mobile menu</div>
<div className="hidden sm:block">Desktop menu</div>
```

## 🔍 Debugging Responsive Issues

### Check Viewport Meta Tag

```html
<!-- Should be in <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Check Container Width

```tsx
// Remove constraints for full-width testing
<div className="w-full max-w-none">{/* Remove max-w to test on mobile */}</div>
```

### Check Text Overflow

```tsx
// Add overflow wrapping
<p className="break-words text-base">Long text that should wrap</p>
```

### Check Touch Targets

```tsx
// Ensure buttons are ≥44px
<button className="h-11 w-11">Touch-friendly button</button>
```

## 📊 At-a-Glance Cheat Sheet

```
Tailwind      → Pixels   → Use When
text-xs       → 12px     → Small labels, captions
text-sm       → 14px     → Secondary text, small body
text-base     → 16px     → Default body text
text-lg       → 18px     → Subheadings
text-xl       → 20px     → Titles
text-2xl      → 24px     → Section headings
text-3xl      → 30px     → Large headings
text-4xl      → 36px     → Hero titles
text-5xl      → 48px     → Major headings

p-2           → 8px      → Tight spacing
p-3           → 12px     → Normal padding (mobile)
p-4           → 16px     → Normal padding (tablet)
p-6           → 24px     → Comfortable spacing
p-8           → 32px     → Generous spacing (desktop)

gap-2         → 8px      → Tight grid gap
gap-3         → 12px     → Normal gap (mobile)
gap-4         → 16px     → Normal gap (tablet)
gap-6         → 24px     → Large gap (desktop)
```

## 🎯 Mobile-First Development Process

1. **Write mobile-first** (no prefixes)

   ```tsx
   <h1 className="text-xl font-bold">Mobile size</h1>
   ```

2. **Add tablet breakpoint** (sm: prefix for 640px+)

   ```tsx
   <h1 className="text-xl sm:text-2xl font-bold">Mobile & Tablet</h1>
   ```

3. **Add desktop breakpoint** (lg: prefix for 1024px+)

   ```tsx
   <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold">All sizes</h1>
   ```

4. **Test on real devices** to ensure readability and usability

## 🚀 Performance Tips

✅ **DO:**

- Use `hidden sm:block` to hide decorative elements on mobile
- Test with DevTools throttling (Network: Slow 4G)
- Use responsive images with `srcset`
- Keep animations simple on mobile

❌ **DON'T:**

- Use `display: none` for anything critical (SEO impact)
- Add huge images without sizing
- Use fixed widths/heights everywhere
- Ignore touch device needs

---

**Quick Link**: [Full Guide](./RESPONSIVE_DESIGN_GUIDE.md)

**Last Updated**: April 1, 2026
