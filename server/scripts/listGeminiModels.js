import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: './server/.env' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY not set in server/.env');
  process.exit(1);
}

const listModels = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('status:', res.status);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Failed to list models:', err?.message || err);
    process.exit(1);
  }
};

listModels();
