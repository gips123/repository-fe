# Chatbot Integration - Setup & Fungsi

## 🎯 Fungsi Chatbot

Chatbot ini membantu user menemukan folder di sistem repository, **bahkan folder yang tidak bisa mereka akses**.

### Fitur Utama:
1. **Mencari folder** berdasarkan nama
2. **Memberi tahu folder yang tidak accessible** - Jika user bertanya tentang folder yang tidak bisa diakses, chatbot akan:
   - Memberi tahu bahwa folder tersebut **ada di sistem**
   - Memberi tahu **role mana yang punya akses**
   - Menyarankan untuk **hubungi admin** untuk request permission
3. **Menjawab dalam Bahasa Indonesia**

### Contoh Skenario:
**WD1 bertanya:** "dimana folder ijasah?"

**Chatbot menjawab:**
> "Folder 'ijasah' ada di sistem, namun Anda (wd1) tidak memiliki akses. Folder ini dapat diakses oleh role 'dosen'. Silakan hubungi admin untuk meminta permission."

---

## ⚙️ Setup

### 1. Install Ollama

```bash
# Download dari https://ollama.ai/
# Atau via homebrew (Mac)
brew install ollama

# Start Ollama
ollama serve
```

### 2. Pull Model

```bash
# Pilih salah satu model
ollama pull llama2
# atau
ollama pull mistral
```

### 3. Install Dependencies

```bash
npm install axios
```

### 4. Update .env

Tambahkan ke file `.env`:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 5. Restart Server

```bash
npm run start:dev
```

---

## 📡 API Endpoints

### Chat dengan Bot

```http
POST /api/chatbot/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "dimana folder ijasah?"
}
```

**Response:**
```json
{
  "response": "Folder 'ijasah' ada di sistem...",
  "timestamp": "2024-01-26T18:00:00.000Z"
}
```

### Search Folders

```http
POST /api/chatbot/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "ijasah"
}
```

**Response:**
```json
{
  "query": "ijasah",
  "results": [
    {
      "id": "uuid",
      "name": "Ijasah",
      "accessible": false,
      "roles_with_access": ["dosen"],
      "needs_admin_permission": true
    }
  ],
  "count": 1
}
```

---

## 🔧 Konfigurasi

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | URL Ollama server |
| `OLLAMA_MODEL` | `llama2` | Model yang digunakan |

### Model yang Bisa Digunakan

- `llama2` (default)
- `llama3`
- `mistral`
- `codellama`
- Model lain yang sudah di-pull

---

## ✅ Checklist Setup

- [ ] Ollama terinstall dan berjalan (`ollama serve`)
- [ ] Model sudah di-pull (`ollama pull llama2`)
- [ ] Dependencies terinstall (`npm install axios`)
- [ ] `.env` sudah di-update (OLLAMA_URL, OLLAMA_MODEL)
- [ ] Server sudah restart

---

## 🧪 Test

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wd1@example.com","password":"password"}'

# 2. Chat (gunakan token dari step 1)
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"dimana folder ijasah?"}'
```

---

## 🐛 Troubleshooting

**Ollama connection refused?**
```bash
# Check Ollama running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

**Model not found?**
```bash
ollama pull llama2
```

**Response timeout?**
- Increase timeout di `chatbot.service.ts` (default: 30s)
- Atau gunakan model yang lebih kecil

---

## 📝 Catatan Penting

1. **Chatbot melihat SEMUA folder** - Termasuk yang tidak accessible oleh user
2. **Memberi tahu role yang punya akses** - User tahu harus hubungi siapa
3. **Fallback response** - Jika Ollama tidak tersedia, tetap ada response
4. **Bahasa Indonesia** - System prompt sudah dikonfigurasi untuk Bahasa Indonesia

---

**Selesai! Chatbot siap digunakan. 🚀**

