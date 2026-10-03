# LexiFlow

A local English vocabulary trainer. Look up a word, save a Chinese meaning, pinyin, and an example sentence, then review it with spaced repetition.

The app runs on your computer. Your deck stays in `data/vocabulary.json`. API keys stay in `.env` and are never written into the deck.

## Features

- Word lookup with Gemini, Qwen, or Groq when you add a key
- Free dictionary and translation fallback when no key is set
- Flashcards (space to flip, `1` hard, `2` easy)
- Quiz, word duel, story forge, and an AI tutor
- Command console (`help`, `add`, `deck`, `due`, `quiz`)
- Activity log of lookups, reviews, and quiz answers

## Requirements

- Node.js 20 or later

## Setup

```bash
git clone https://github.com/ELBAZANAS/vocabulary-assistant.git
cd vocabulary-assistant
copy .env.example .env
npm install
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Open [http://localhost:3000](http://localhost:3000).

## Add your own API keys

1. Copy `.env.example` to `.env` in the project folder.
2. Paste a key on the matching line. You only need one provider.
3. Save the file and restart `npm run dev`.
4. In the app, open **Settings**, choose that provider, and click **Test API keys**.

| Variable | Provider | Where to create a key |
| --- | --- | --- |
| `GEMINI_API_KEY` | Google Gemini | [Google AI Studio](https://aistudio.google.com/apikey) |
| `QWEN_API_KEY` | Alibaba Qwen | [DashScope](https://dashscope.console.aliyun.com/) |
| `GROQ_API_KEY` | Groq | [Groq console](https://console.groq.com/keys) |
| `TAVILY_API_KEY` | Tavily web snippets (optional) | [Tavily](https://tavily.com) |

Leave unused keys blank. Without any key, lookups still work through the public dictionary fallback. Choose **Offline dictionary fallback** in Settings to force that path.

Do not commit `.env`. Do not paste keys into issues or screenshots.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API and UI on port 3000 |
| `npm run build` | Production client and server bundle |
| `npm start` | Run the production build |
| `npm run lint` | Typecheck |

For production, set `NODE_ENV=production` before `npm start`.

## Layout

```
backend/   Express API, model calls, JSON store, commands
src/       React UI
data/      Local deck (sample words are included)
```

## License

This project is published so you can read and run it. It is not open source.

You may use it for yourself. You may not sell it, charge for it, or ship it inside a product you sell. See [LICENSE](LICENSE).
