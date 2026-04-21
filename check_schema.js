import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const urlMatch = envFile.match(/VITE_SUPABASE_URL="(.+)"/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY="(.+)"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const payload = {
    name: 'test',
    description: 'test desc',
    price: 15,
    category: 'ensemble',
    stock: 5,
    images: [],
    sizes_stock: { S: 1 },
    variants: []
  };

  const { error } = await supabase.from('products').insert([payload]);
  if (error) {
    console.log('Error during test insert:', error.message);
  } else {
    console.log('Test insert SUCCESSFUL. All columns exist and are named correctly.');
  }
}
check();
