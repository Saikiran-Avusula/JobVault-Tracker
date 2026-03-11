# Liquid Glass UI — Quick Reference

## 🎨 GLASS COMPONENT CLASSES

### `.glass-panel`
**Use for:** Cards, containers, sections
**Effect:** Medium blur, light fill, directional borders, specular highlight
**Hover:** Lifts up 3px with larger shadow

```tsx
<div className="glass-panel p-6">
  <h2>Section Title</h2>
  <p>Content here...</p>
</div>
```

---

### `.glass-button`
**Use for:** All buttons, clickable elements
**Effect:** Small blur, medium fill, pill radius, directional borders
**Hover:** Lifts up 1px
**Active:** Scales down to 0.97

```tsx
{/* Default */}
<button className="glass-button px-6 py-3">
  Click Me
</button>

{/* With tint */}
<button className="glass-button px-6 py-3" style={{ background: 'var(--tint-blue)' }}>
  Primary
</button>
```

---

### `.glass-input`
**Use for:** Text inputs, textareas, select elements
**Effect:** Extra small blur, minimal fill, rounded corners
**Focus:** Brighter fill, stronger border, blue ring

```tsx
<input 
  className="glass-input w-full px-4 py-2.5 text-sm text-glass-primary" 
  placeholder="Enter text..."
/>

<textarea 
  className="glass-input w-full p-5 text-sm text-glass-primary min-h-[150px] resize-none"
  placeholder="Enter notes..."
/>
```

---

### `.glass-modal-overlay`
**Use for:** Modal/dialog overlays
**Effect:** Dark semi-transparent with blur

```tsx
<div className="glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Modal content */}
</div>
```

---

### `.glass-modal`
**Use for:** Modal/dialog panels
**Effect:** Large blur, medium fill, extra large shadow, directional borders

```tsx
<div className="glass-modal w-full max-w-md p-8">
  <h2>Modal Title</h2>
  <p>Modal content...</p>
</div>
```

---

### `.glass-badge`
**Use for:** Tags, labels, status indicators
**Effect:** Extra small blur, light fill, pill radius

```tsx
<span className="glass-badge px-3 py-1.5 text-xs">
  Status
</span>

{/* With tint */}
<span className="glass-badge px-3 py-1.5 text-xs" style={{ background: 'var(--tint-amber)' }}>
  Warning
</span>
```

---

## 🎨 TEXT COLORS

### `.text-glass-primary`
**Opacity:** 0.95 (95%)
**Use for:** Headings, primary text, important content

### `.text-glass-secondary`
**Opacity:** 0.65 (65%)
**Use for:** Body text, descriptions, secondary content

### `.text-glass-tertiary`
**Opacity:** 0.40 (40%)
**Use for:** Placeholders, hints, disabled text, icons

```tsx
<h1 className="text-glass-primary">Main Heading</h1>
<p className="text-glass-secondary">Body text here</p>
<span className="text-glass-tertiary">Hint text</span>
```

---

## 🎨 VIBRANT TINTS

Use as inline styles for colored glass surfaces:

```tsx
{/* Blue — Primary actions */}
<button style={{ background: 'var(--tint-blue)' }}>Primary</button>

{/* Rose — Danger/delete actions */}
<button style={{ background: 'var(--tint-rose)' }}>Delete</button>

{/* Amber — Warnings */}
<span style={{ background: 'var(--tint-amber)' }}>Warning</span>

{/* Green — Success */}
<div style={{ background: 'var(--tint-green)' }}>Success</div>

{/* Purple — Special/premium */}
<div style={{ background: 'var(--tint-purple)' }}>Premium</div>
```

---

## 🎨 CUSTOM RADIUS

Use as inline styles for concentric design:

```tsx
{/* Extra large — Modals, large panels */}
<div style={{ borderRadius: 'var(--radius-2xl)' }}>...</div>

{/* Large — Panels, cards */}
<div style={{ borderRadius: 'var(--radius-xl)' }}>...</div>

{/* Medium — Nested elements */}
<div style={{ borderRadius: 'var(--radius-md)' }}>...</div>

{/* Small — Inner nested elements */}
<div style={{ borderRadius: 'var(--radius-sm)' }}>...</div>

{/* Pill — Buttons, badges */}
<button style={{ borderRadius: 'var(--radius-pill)' }}>...</button>
```

---

## 🎨 ICON RULES

### **Always use strokeWidth={1.5}**
```tsx
import { Search, X, Plus } from 'lucide-react'

<Search size={18} strokeWidth={1.5} />
<X size={20} strokeWidth={1.5} />
<Plus size={16} strokeWidth={1.5} />
```

### **Icon Colors on Glass**
```tsx
{/* Primary action */}
<Icon className="text-glass-primary" />

{/* Secondary/decorative */}
<Icon className="text-glass-tertiary" />

{/* Colored context */}
<Icon className="text-primary-400" />
<Icon className="text-rose-400" />
```

---

## 🎨 COMMON PATTERNS

### **Glass Card with Hover**
```tsx
<div className="glass-panel p-6 cursor-pointer">
  <h3 className="text-glass-primary font-bold">Card Title</h3>
  <p className="text-glass-secondary">Card description</p>
</div>
```

### **Glass Button Group**
```tsx
<div className="flex gap-3">
  <button className="glass-button px-6 py-2.5 text-glass-secondary">
    Cancel
  </button>
  <button className="glass-button px-6 py-2.5 text-white" style={{ background: 'var(--tint-blue)' }}>
    Confirm
  </button>
</div>
```

### **Glass Form Field**
```tsx
<div className="space-y-2">
  <label className="text-xs font-bold text-glass-tertiary uppercase">
    Field Label
  </label>
  <input 
    className="glass-input w-full px-4 py-2.5 text-sm text-glass-primary"
    placeholder="Enter value..."
  />
</div>
```

### **Glass Status Badge**
```tsx
<span 
  className="glass-badge flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
  style={{ background: 'var(--tint-green)' }}
>
  <Check size={12} strokeWidth={1.5} />
  Active
</span>
```

---

## 🎨 ANIMATION TIMING

Use CSS variables for consistent motion:

```tsx
{/* Fast — Micro-interactions */}
<button style={{ transition: 'all var(--dur-fast) var(--ease-glass)' }}>
  Quick
</button>

{/* Normal — Standard transitions */}
<div style={{ transition: 'all var(--dur-normal) var(--ease-glass)' }}>
  Standard
</div>

{/* Slow — Large movements */}
<div style={{ transition: 'all var(--dur-slow) var(--ease-liquid)' }}>
  Smooth
</div>

{/* Spring — Modals, popovers */}
<div style={{ animationTimingFunction: 'var(--ease-spring)' }}>
  Bouncy
</div>
```

---

## ✅ DO's

✅ Use glass classes for all interactive surfaces
✅ Apply tints for colored actions (blue = primary, rose = danger)
✅ Use text-glass-* classes for proper contrast
✅ Set strokeWidth={1.5} on all Lucide icons
✅ Use CSS variables for radius, timing, and colors
✅ Layer glass elements for depth

---

## ❌ DON'Ts

❌ Don't use solid opaque backgrounds on glass surfaces
❌ Don't use strokeWidth={2} (default) on icons
❌ Don't mix glass and non-glass styles in the same component
❌ Don't use pure white (#ffffff) or black (#000000) on glass
❌ Don't skip the specular highlight (::before) on custom glass elements
❌ Don't use instant transitions (always use timing variables)

---

## 🎉 RESULT

With these classes and patterns, you can maintain the Liquid Glass aesthetic across your entire app while keeping code clean and consistent.
