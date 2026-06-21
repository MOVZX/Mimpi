# Mimpi

#### A Web-to-ComfyUI API Bridge for Seamless Image Creation

Mimpi is a full-featured web application that provides a user-friendly interface for generating images via the ComfyUI API. It supports multi-user authentication, dual generation modes (Z-Image and SDXL), preset management, image gallery, and statistics — all accessible from any device with a browser.

---

## Key Features

### 🎨 Image Generation

- **Dual Mode**: Switch between **Z-Image** (Turbo workflow with 2-pass generation) and **SDXL** generation modes
- **Z-Image Workflow**: Uses a coarse-then-refine approach (4 steps + configurable steps) with latent upscaling
- **SDXL Workflow**: Supports dynamic prompts, DMD2 acceleration, custom CLIP layers, and optional upscaling
- **Seed Control**: Dynamic random seeds, incrementing seeds, or manual seed input
- **LoRA Management**: Built-in LoRA loader with multiple slots (SDXL) or dynamic LoRA list (Z-Image)

### 📚 Preset System

- **Z-Image Presets**: Save and load complete generation configurations (prompt, model, sampler, steps, CFG, resolution)
- **SDXL Presets**: Pre-configured templates with theme, style, and location presets
- **Dynamic Prompts**: Auto-generate prompts with random hair colors, styles, rooms, and ages (SDXL mode)
- **Preset Management**: Create, edit, and delete presets from the UI

### 🖼️ Gallery & Statistics

- **Image Gallery**: Browse generated images with pagination (48 per page)
- **Search & Filter**: Search by prompt, checkpoint, or seed; filter by model
- **Sort Options**: Newest first or oldest first
- **Lightbox**: Full-screen image viewing
- **Statistics Dashboard**: View usage by model, sampler, and monthly trends

### 👥 Multi-User System

- **Authentication**: Session-based login with bcrypt password hashing
- **User Roles**: Admin and regular user roles
- **Session Management**: 7-day session expiry with cookie-based auth
- **Admin Features**: User management (create, update, delete), view all users' images
- **Ownership**: Regular users can only see/delete their own images

### ⚙️ Configuration

- **Multi-Server Support**: Manage and switch between multiple ComfyUI instances
- **Storage Modes**: Choose between local filesystem, SeaweedFS, or hybrid storage for generated images
- **Auto-Migration**: Database schema auto-upgrades on startup (current version: 8)
- **Checkpoint Auto-Apply**: Selecting a checkpoint auto-configures sampler, scheduler, steps, and CFG
- **Dark Mode**: Full dark theme support

### 🛠️ Technical Features

- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages for API failures
- **Image Management**: Download or delete generated images
- **Thumbnail Generation**: Automatic 400x400 thumbnails for gallery view
- **Auto-Scroll**: Automatically scrolls to generated image after completion

---

## Architecture

### Backend (Python/FastAPI)

- **Framework**: FastAPI with Uvicorn ASGI server
- **Database**: MariaDB/MySQL with auto-migration (current version: 8)
- **Authentication**: Cookie-based sessions with bcrypt password hashing
- **API**: RESTful endpoints for all operations

### Frontend (React + TypeScript + Vite)

- **Framework**: React 19 with TypeScript 5.8
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

---

## How It Works

1. **User Login**: Users authenticate via the login page using credentials stored in the database
2. **Generation Mode Selection**: Choose between Z-Image (turbo) or SDXL mode
3. **Configure Parameters**: Set prompt, negative prompt, model, sampler, scheduler, steps, CFG, and resolution
4. **Apply Presets**: Optionally load a saved preset or use dynamic prompt generation
5. **Generate**: Send the workflow to the active ComfyUI instance
6. **Poll for Results**: Wait for ComfyUI to complete generation (up to 90 seconds)
7. **Save & Display**: Download the image, save to gallery with metadata, and display in the UI

---

## Installation and Setup

### Prerequisites

- **ComfyUI** — Running instance with API access
    - Optional: [comfyui_extra_api](https://github.com/MOVZX/comfyui_extra_api) extension for image deletion
- **MariaDB/MySQL** — Database server
- **Python 3.11+** — For the backend server
- **Node.js 20+** — For building the frontend

### Step 1: Clone the Repository

```bash
git clone https://github.com/MOVZX/Mimpi.git
cd Mimpi
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
# ComfyUI Connection
COMFY_URI=http://localhost:8188
COMFY_TOKEN=your_token_here

# Database (MariaDB/MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mimpi
DB_USER=mimpi
DB_PASSWORD=your_password

# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=admin

# Server
HOST=0.0.0.0
PORT=8001

# Storage (optional - for SeaweedFS integration)
S3_FILER_URL=http://localhost:8888
S3_BUCKET=mimpi-images
```

### Step 3: Install Python Dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4: Build the Frontend

```bash
cd mimpi
npm install
npm run build
cd ..
```

### Step 5: Start the Server

```bash
python server/main.py
```

The application will be available at `http://localhost:8001` (or the configured PORT).

---

## Database Schema

The database auto-creates the following tables on first run:

| Table            | Description                    |
| ---------------- | ------------------------------ |
| `images`         | Generated images with metadata |
| `users`          | User accounts with roles       |
| `sessions`       | Authentication sessions        |
| `comfy_servers`  | ComfyUI server configurations  |
| `zimage_presets` | Z-Image generation presets     |
| `sdxl_presets`   | SDXL generation presets        |
| `settings`       | Application settings           |
| `_migration`     | Migration version tracking     |

---

## API Endpoints

### Authentication

- `POST /api/login` — Login with username/password
- `POST /api/logout` — Logout and invalidate session
- `GET /api/verify` — Verify authentication status

### Gallery

- `GET /api/gallery` — Fetch gallery items (with pagination, search, filter)
- `DELETE /api/gallery/{id}` — Delete a single image
- `POST /api/gallery/batch-delete` — Delete multiple images

### Generation

- `POST /api/generate` — Send workflow to ComfyUI
- `POST /api/comfy/free` — Unload models from GPU memory
- `GET /api/history/{prompt_id}` — Poll generation status
- `GET /api/view` — View generated image from ComfyUI
- `POST /api/save` — Save generated image to gallery

### Presets

- `GET /api/zimage-presets` — List Z-Image presets
- `POST /api/zimage-presets` — Create Z-Image preset
- `PUT /api/zimage-presets/{id}` — Update Z-Image preset
- `DELETE /api/zimage-presets/{id}` — Delete Z-Image preset
- `GET /api/sdxl-presets` — List SDXL presets
- `POST /api/sdxl-presets` — Create SDXL preset
- `PUT /api/sdxl-presets/{id}` — Update SDXL preset
- `DELETE /api/sdxl-presets/{id}` — Delete SDXL preset

### Settings

- `GET /api/settings` — Get application settings
- `PUT /api/settings` — Update application settings

### Servers

- `GET /api/comfy-servers` — List ComfyUI servers
- `POST /api/comfy-servers` — Add server
- `PUT /api/comfy-servers` — Update server
- `DELETE /api/comfy-servers/{name}` — Delete server
- `POST /api/comfy-servers/activate` — Activate server

### Users

- `GET /api/users` — List users (admin only)
- `POST /api/users` — Create user (admin only)
- `PUT /api/users/{id}` — Update user (admin only)
- `DELETE /api/users/{id}` — Delete user (admin only)
- `PUT /api/user/password` — Change current user's password
- `PUT /api/user/username` — Change current user's username

### Stats & Config

- `GET /api/stats` — Usage statistics
- `GET /api/models` — List used checkpoints
- `GET /api/checkpoints` — Available checkpoints
- `GET /api/presets` — Built-in prompt presets
- `GET /api/zimage-models` — Z-Image models and LoRA registry

---

## Z-Image Model Registry

The application includes a built-in registry of Z-Image compatible models and LoRAs:

**Checkpoints** (28 models):

- `beyondREALITY_V30` (default)
- `asianUtopian_v36TurboFFV`
- `bigLove_zt3`
- `copaxTimeless_xplusZ13`
- `cyberrealisticZImage_v50`
- And many more...

**LoRAs** (55+ models):

- `REDZ15_DetailDaemonZ_lora_v1.1`
- `Softmute_SoloLoRA_ZIBv1`
- `skin texture Photorealistic style v4.5`
- `Kook_Zimage_Turbo`
- `hina_zImageTurbo_asianMix_v4.57-bf16`
- And many more...

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

## Personal Motivation

This project was initially created out of my own need for convenience. As someone who frequently uses ComfyUI for image generation, I found it cumbersome to rely on desktop setups or manually configure parameters through the API. I wanted a simpler way to interact with ComfyUI directly from my smartphone, allowing me to generate images on the go without needing access to a full desktop environment.

With this web interface, I achieved a streamlined workflow that works seamlessly on mobile devices. Whether I'm commuting, traveling, or simply away from my computer, I can now generate high-quality images anytime, anywhere, using just my phone.
