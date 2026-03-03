# UI Style Guide

## 1. Color Palette

| Category | Role | Tailwind Class | Notes |
| :--- | :--- | :--- | :--- |
| **Primary** | Main Action | `blue-600` | Hover state: `blue-700` |
| **Backgrounds** | Page Base | `white` & `gray-50` | Use `gray-50` for app background, `white` for cards. |
| **Borders** | Dividers/Inputs | `gray-300` | Standard structural borders. |

## 2. Semantic Alerts & States

| State | Background | Text Color | Border | Font Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Alert / Error** | `bg-red-100` | `text-red-600` | `border-red-400` | `font-medium` |
| **Warning** | `bg-yellow-100` | `text-yellow-600` | `border-yellow-400` | `font-medium` |
| **Success** | `bg-green-100` | `text-green-600` | `border-green-400` | `font-medium` |

## 3. Typography
**Font Families:**
* **Headings/Hero:** Manrope (`font-manrope`)
* **Body/UI:** DM Sans (`font-dm-sans`)

**Font Weights:**
* `font-bold`: Hero text, main page titles, strong calls to action.
* `font-semibold`: Secondary headings, small card titles.
* `font-medium`: Form labels, buttons, navigation links, alerts.

**Responsive Text Scale (Mobile-First):**
* **Standard Page Titles:** `text-2xl md:text-4xl`
* **Section Headers / Navbar Logo:** `text-lg md:text-xl`
* **Standard Body Paragraphs:** `text-sm md:text-base`
* **Helper Text / Badges / Footer:** `text-xs md:text-sm`

## 4. UI Components

**Buttons:**
* **Primary (Default):** `bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors`
* **Secondary (Outlined):** `bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors`
* **Destructive (Delete):** `bg-red-600 text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg shadow-sm transition-colors`
* **Small Buttons:** Change rounding to `rounded-md`.

**Form Inputs:**
* **Base Style:** `bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors`
* **Focus State:** `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
* **Disabled State:** `disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50`
* **Error State:** `border-red-300 focus:ring-red-500`

**Cards & Content Boxes:**
* **Base Style:** `bg-white rounded-lg shadow-md border border-gray-100`

## 5. Spacing & Layout

| Element | Mobile Class | Desktop Class |
| :--- | :--- | :--- |
| **Page Container Padding** | `px-4` | `md:px-8` |
| **Standard Gap (Feed items)** | `gap-4` | `md:gap-6` |
| **Section Margin Bottom** | `mb-6` | `md:mb-10` |

## 6. Z-Index Scale
* `z-10`: Dropdowns, tooltips.
* `z-20`: Sticky Navbars, bottom mobile navigation.
* `z-50`: Modals, dialogs, fullscreen overlays.

## 7. Animations & Page Loading
* **Hover Styles:** `transition-colors duration-200` for buttons and links.
* **Page Transitions:** `animate-fade-in` for smooth route changes.
* **Data Loading:** `animate-pulse bg-gray-200 rounded-md` for the feed and profiles while fetching data.