# Bullet Gown Studio

3D fashion design tool for a high-end gown covered in ammunition. Built with Three.js + React.

Part of the **bullet-clothing portfolio** by Kojo.

Live demo: https://owenheidenreich.github.io/sea-urchin-parka/

![Bullet Gown Studio live interface](docs/screenshots/bullet-gown-studio.png)

## Reviewer Summary

- **What it is:** interactive 3D fashion design tool with configurable garment shape, bullet placement, materials, and camera controls.
- **Tech stack:** React, Vite, Three.js, Zustand, Tailwind CSS.
- **Hosting:** GitHub Pages through the repository Actions workflow.
- **Status:** public web demo is live; branch history contains related garment explorations.

---

## Quick Start — Computer (Mac, Windows, or Linux)

### What you need first

1. **Node.js** — this is the engine that runs the app. Download it free from [nodejs.org](https://nodejs.org/). Click the big green button that says "LTS" (Long Term Support). Run the installer, click Next through everything — the defaults are fine.

2. **A terminal** — this is where you type commands.
   - **Mac**: Open the app called **Terminal** (search for it in Spotlight with Cmd + Space, type "Terminal")
   - **Windows**: Open **Command Prompt** (search "cmd" in Start menu) or **PowerShell**
   - **Linux**: You already know where the terminal is

3. **A code editor** (optional, for making changes) — [VS Code](https://code.visualstudio.com/) is free and popular.

### Steps to launch

Open your terminal and type these commands one at a time, pressing Enter after each:

```bash
# Navigate to the project folder (replace with your actual path)
cd ~/Documents/Kojo-Folder/sea-urchin-parka

# Install all the libraries the app needs (only needed the first time)
npm install

# Start the app
npm run dev
```

After the last command, you'll see something like:

```
  VITE v8.0.3  ready in 100 ms

  ➜  Local:   http://localhost:5173/
```

**Open your web browser** (Chrome, Safari, Firefox — any will work) and go to that URL: `http://localhost:5173`

The studio should load with a 3D gown on screen.

### How to stop the app

Go back to your terminal and press **Ctrl + C**.

### How to start it again later

You only need two commands from now on (no need to `npm install` again):

```bash
cd ~/Documents/Kojo-Folder/sea-urchin-parka
npm run dev
```

---

## Quick Start — iPad

The iPad cannot run Node.js directly, so you have two options:

### Option A: Run on your computer, view on iPad (easiest)

If your computer and iPad are on the **same Wi-Fi network**:

1. Start the app on your computer with this modified command:

```bash
cd ~/Documents/Kojo-Folder/sea-urchin-parka
npx vite --host
```

2. The terminal will now show two URLs:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

3. On your iPad, open **Safari** and type the **Network** URL (the one with numbers like `192.168.1.42`). It will be different on your network — use whatever your terminal shows.

4. The studio loads fullscreen on iPad. Bookmark it for quick access.

### Option B: Deploy to the web (view anywhere, no computer needed)

Build the app and upload it to a free hosting service:

```bash
cd ~/Documents/Kojo-Folder/sea-urchin-parka
npm run build
```

This creates a `dist/` folder with the finished app. Upload that folder to any of these free services:
- [Netlify Drop](https://app.netlify.com/drop) — drag and drop the `dist` folder onto the page
- [Vercel](https://vercel.com/) — connect your GitHub repo and it auto-deploys
- [GitHub Pages](https://pages.github.com/) — free hosting from your repo

You'll get a public URL like `https://your-app.netlify.app` that works on any device.

---

## Using the Studio

### On a Computer

The screen is split into three columns:

```
 GOWN PANEL        3D VIEWPORT          BULLETS PANEL
 (left side)        (center)             (right side)
 ┌──────────┐  ┌─────────────────┐  ┌────────────────┐
 │ Bodice   │  │                 │  │ Ammo Count     │
 │ Waist    │  │    [3D GOWN]    │  │ Size Min/Max   │
 │ Bust     │  │                 │  │ Spread         │
 │ Hip      │  │   drag to spin  │  │ Flat vs Urchin │
 │ Hem      │  │  scroll to zoom │  │ Layers         │
 │ Flare    │  │                 │  │ Theme          │
 │ Slit     │  │                 │  │                │
 │ Train    │  │                 │  │ [Save Preset]  │
 │ Wheels   │  │                 │  │ [Load Preset]  │
 └──────────┘  └─────────────────┘  └────────────────┘
```

**3D controls (mouse):**
- **Left-click drag** — Rotate the gown
- **Scroll wheel** — Zoom in/out
- **Right-click drag** — Pan (move sideways)

**Top toolbar buttons:**
- **BULLETS** — Show/hide all the ammunition
- **MANNEQUIN** — Show/hide the body figure inside the dress
- **MEDALLION** — Show/hide the daisy medallion
- **WHEELS** — Show/hide the embedded wheels
- **AXES** — Show/hide the XYZ axis helper (red = X, green = Y, blue = Z)
- **WIRE** — Toggle wireframe view to see the mesh structure
- **Camera buttons** (FRONT, BACK, LEFT, RIGHT, TOP, 3/4) — Snap to preset angles
- **Background shade buttons** — Change background brightness

### On an iPad

The layout switches to a tabbed view since the screen is narrower:

```
 ┌────────────────────────────────────┐
 │          GOWN STUDIO        toolbar│
 ├────────────────────────────────────┤
 │                                    │
 │           [3D GOWN]                │
 │                                    │
 │       touch to spin                │
 │       pinch to zoom                │
 │       two-finger drag to pan       │
 │                                    │
 ├──────────┬───────────┬─────────────┤
 │ 3D VIEW  │   GOWN    │   BULLETS   │
 └──────────┴───────────┴─────────────┘
       ^          ^            ^
    (viewport)  (shape)    (ammo config)
    tap a tab to switch between them
```

**Touch controls:**
- **One finger drag** — Rotate the gown
- **Pinch** — Zoom in/out
- **Two finger drag** — Pan (move sideways)

Tap **GOWN** tab to see shape sliders. Tap **BULLETS** tab to configure ammunition. Tap **3D VIEW** to go back to the viewport.

---

## What the Sliders Do

### Gown Shape (left panel / GOWN tab)

| Slider | What it controls |
|---|---|
| **Bodice Height** | How high the top of the dress goes (neckline height) |
| **Waist Width** | How narrow or wide the waist is |
| **Bust Width** | How wide the chest/bust area is |
| **Hip Width** | How wide the hip area is |
| **Hem Height** | Where the bottom of the dress sits (raise it up or drop it lower) |
| **Skirt Flare** | How much the skirt flares out at the bottom (1.0 = fitted, 2.0 = full) |
| **Slit Height** | How high the front slit goes (lower = more leg showing) |
| **Slit Width** | How wide the front slit opening is |
| **Train Length** | How far the fabric trails behind on the floor |
| **Train Width** | How wide the trailing fabric is |
| **Wheel Count** | Number of tiny wheels embedded in the hem |
| **Wheel Size** | Size of each wheel |

### Bullets (right panel / BULLETS tab)

| Slider | What it controls |
|---|---|
| **Ammo Count** | Total number of bullets on the dress (100–12000) |
| **Size Min** | Smallest bullet size |
| **Size Max** | Largest bullet size |
| **Spread** | How far bullets angle away from the surface (0 = flat, 90 = straight out) |
| **Flat vs Urchin** | 0% = all bullets point outward like a sea urchin. 100% = all lay flat against fabric |
| **Layers** | Stack 1–3 layers of bullets |
| **Theme** | Color palette for the bullets (brass, pink, urchin, biolum, coral, abyss) |

### Saving Presets

In the BULLETS panel, type a name and hit **Save**. Your settings are saved in the browser. Select a saved preset from the dropdown and hit **Load** to restore it. Presets persist across sessions.

---

## Branches

This project has multiple garments saved on different branches:

| Branch | What's on it |
|---|---|
| `main` | Base parka studio (sea urchin spine garment) |
| `artist-drawing-version` | Parka with daisy medallion, bullet presets, axes helper |
| `bullet-dress` | Fitted bullet gown with wheels, train, body shape sliders |

To switch between garments:

```bash
# See all branches
git branch

# Switch to the parka version
git checkout artist-drawing-version

# Switch to the gown version
git checkout bullet-dress

# After switching, restart the app
npm run dev
```

---

## Project Structure

```
sea-urchin-parka/
  README.md                  <-- You are here
  index.html                 <-- The web page shell
  package.json               <-- App dependencies and scripts

  src/                       <-- All the source code
    App.jsx                  # Layout (desktop grid / mobile tabs)
    main.jsx                 # React entry point
    index.css                # Global styles + responsive breakpoints

    components/              <-- UI panels and viewport
      Viewport.jsx           # Three.js 3D scene + lighting + controls
      GarmentPanel.jsx       # Gown shape sliders
      DecorationPanel.jsx    # Bullet config + presets
      Toolbar.jsx            # Top bar toggles + camera presets

    engine/                  <-- 3D geometry builders
      GownBody.js            # The dress shape (silhouette, neckline, slit)
      GownTrain.js           # Floor-trailing fabric behind the dress
      GownDetails.js         # Waist band, hem band, back seam
      GownWheels.js          # Tiny wheels along the hem and train
      GownMannequin.js       # The body figure inside the dress
      FlowerMedallion.js     # Daisy medallion decoration
      AmmoPlacement.js       # Places bullets across any mesh surface

    store/                   <-- App state
      store.js               # All slider values, toggles, and actions

    utils/
      themes.js              # Color themes (brass, pink, urchin, etc.)

  archive-prototypes/        <-- Old standalone HTML prototypes (reference only)
```

---

## Tech Stack

- **Three.js** — 3D rendering in the browser (WebGL)
- **React 19** — User interface components
- **Zustand** — Manages all the slider/toggle state
- **Vite** — Development server + production builder
- **Tailwind CSS** — Styling utilities

---

## Troubleshooting

**"npm: command not found"**
Node.js isn't installed yet. Download it from [nodejs.org](https://nodejs.org/) and restart your terminal.

**"Cannot find module..." errors on `npm run dev`**
Run `npm install` first to download all dependencies.

**The 3D scene is black or blank**
Try a different browser. Chrome works best for WebGL. Make sure your device supports WebGL (most modern devices do).

**iPad won't connect to the computer's URL**
Make sure both devices are on the same Wi-Fi network. Make sure you used `npx vite --host` (not just `npm run dev`). Check that your firewall isn't blocking port 5173.

**Sliders aren't doing anything**
The scene rebuilds every time you move a slider. If you have a high ammo count (6000+), it may take a moment. Try lowering ammo count first.
