# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Project Name: Theory of the Soul (TOTS) - Immersive Maze Game
**Version:** 1.0.0  
**Author:** AI Coding Assistant  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Purpose:** Dokumen Panduan Desain Figma & Pengembangan Lanjutan

---

## 1. Project Overview & Objectives
**Theory of the Soul (TOTS)** adalah sebuah game maze web interaktif bernuansa atmosferik-misterius yang memadukan elemen visual minimalis retro modern dengan Sound Engine dinamis berbasis Web Audio API. 

### Core Objectives:
*   **Immersive Experience:** Membawa pemain ke dalam suasana misterius menggunakan narasi onboarding yang kuat dan suara latar belakang (ambience synth + music cross-fade).
*   **Accessibility:** Menyediakan navigasi instan, onboarding yang ramah pengguna, dan dukungan multi-bahasa (i18n).
*   **Competition:** Fitur Leaderboard untuk meningkatkan *replayability* pemain berdasarkan catatan waktu tercepat dalam menyelesaikan labirin.

---

## 2. Key Features & Functional Requirements

### A. Onboarding & Story Module
*   **Interactive Narration:** Tampilan pembuka yang menceritakan lore game sebelum masuk ke gameplay utama.
*   **Language Selection (i18n):** Menu ganti bahasa (English & Bahasa Indonesia) yang tersimpan secara lokal.
*   **Auto-Music Trigger:** Sistem inisialisasi suara instan saat interaksi pertama user (klik/sentuh) untuk mematuhi regulasi *autoplay blocker* browser.

### B. Gameplay (The Maze Board)
*   **Grid-Based Movement:** Kontrol pergerakan karakter menggunakan Keyboard (Arrow / WASD) atau Tombol Kontrol On-Screen (Mobile Friendly).
*   **Dynamic Sound Engine Integration:** Langkah kaki, interaksi dinding, dan efek penyelesaian labirin menghasilkan bunyi audio sintetis (synthesizer) secara langsung.

### C. Advanced Sound Engine (The Audio Core)
*   **Dual Sound Source:** Memadukan synth prosedural (Web Audio API) untuk SFX dan pemutaran file musik eksternal (MP3).
*   **Autoplay Engine:** Memutar lagu tema secara otomatis begitu user melakukan interaksi pertama di halaman web.
*   **Cross-Fade System:** Transisi volume halus (fade-in dan fade-out berdurasi 1 detik) saat musik dinyalakan atau dimatikan guna menghindari bunyi jeda yang kasar/mendadak (*abrupt stops*).

### D. Scoring & Leaderboard
*   **Time-Based Scoring:** Waktu penyelesaian labirin dihitung presisi hingga milidetik.
*   **Local & Cloud Persistence:** Papan peringkat (Leaderboard) yang melacak 10 pemain terbaik untuk meningkatkan daya saing global.

---

## 3. UI/UX Figma Design Blueprint (Panduan Desain)

Untuk melanjutkan proyek ini di Figma, ikuti pedoman visual berikut:

### A. Color Palette (Aesthetic: Cosmic Twilight)
*   **Primary Background:** Slate / Charcoal gelap (`#0F172A` atau `#1E293B`) untuk menghidupkan suasana misterius.
*   **Accent Color (Energy/Soul):** Violet hangat (`#8B5CF6`) atau Emerald cerah (`#10B981`) untuk membedakan jalan keluar dan karakter utama.
*   **Text / Interface Contrast:** Off-White (`#F8FAFC`) untuk readability maksimal dengan intensitas cahaya rendah.

### B. Typography Pairings
*   **Display / Headings (Title, Level, Story):** Gunakan font bergaya modern-tech seperti **Space Grotesk** atau **Outfit** (font sans-serif dengan tracking lebar).
*   **Data, Timer, Leaderboard, & Codes:** Gunakan font monospace seperti **JetBrains Mono** atau **Fira Code** untuk presisi dan kesan brutalist/retro.
*   **Body Text:** Gunakan **Inter** (sans-serif) dengan baris yang renggang agar teks narasi panjang nyaman dibaca.

### C. Layout & Component Structures (Figma Frame Setup)
1.  **Frame 1: Onboarding Screen**
    *   Desain minimalis berfokus pada teks narasi tengah.
    *   Tombol pilihan bahasa mengambang (floating) di pojok kanan atas.
    *   Tombol "Mulai Perjalanan" besar di tengah bawah beranimasi lembut.
2.  **Frame 2: Main Maze Screen**
    *   Sisi kiri/tengah: Container Maze Board berbentuk bento-grid atau outline solid dengan efek bayangan neon tipis.
    *   Sisi kanan (Desktop) / Atas (Mobile): Panel Status (Timer, Steps, & Audio Controls).
    *   *Micro-interaction:* Tombol Mute Musik harus menampilkan ikon toggle audio dengan indikator visual dinamis (soundwave bar yang bergerak saat aktif, silang saat mute).
3.  **Frame 3: Leaderboard Modal**
    *   Desain card melayang (modal overlay) dengan latar belakang transparan-blur (*backdrop-filter: blur*).
    *   Tabel skor bergaya minimalis menggunakan grid dengan jarak baris longgar.

---

## 4. Technical Architecture Stack
*   **Frontend Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite (Supercepat, Hot Module Replacement)
*   **Styling Engine:** Tailwind CSS Utility Classes
*   **Animations:** Motion (Framer Motion)
*   **Audio Synthesis:** Web Audio API (untuk sound synthesis) & HTML5 Audio (untuk MP3 file proxy).
*   **Localization:** Custom i18n JSON mapping (English & Indonesian).
