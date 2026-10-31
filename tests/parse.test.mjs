// node --test tests/parse.test.mjs — ελέγχει την ανάγνωση αποδείξεων χωρίς browser
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('function parseReceipt'), src.indexOf('/* ---------- toast'));
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const parseReceipt = new Function('round', `${body}; return parseReceipt;`)(round);

test('καθαρή απόδειξη: ποσό από ΣΥΝΟΛΟ, όχι από ΜΕΤΡΗΤΑ', () => {
  const r = parseReceipt('ΠΟΣΟΤΗΤΑ 25,43 LT\nΤΙΜΗ ΜΟΝ. 1,869 €/LT\nΦΠΑ 24% 9,20\nΣΥΝΟΛΟ 47,53\nΜΕΤΡΗΤΑ 50,00\nΡΕΣΤΑ 2,47');
  assert.deepEqual([r.amount, r.liters, r.price], [47.53, 25.43, 1.869]);
  assert.equal(r.src.amount.line, 3);
});

test('ΣΥΝΟΛΟ διαβάστηκε λάθος: ποσό από λίτρα × τιμή (πραγματική έξοδος Tesseract)', () => {
  const r = parseReceipt(['AMOAYBAH 95', 'ΠΟΣΟΤΗΤΑ 25,43 LT', 'TTIMH ΜΟΝ. 1,869 €/LT', 'ΦΠΑ 245 9,20', 'ΣΥΝΟΛΟ η, 58', 'ΜΕΤΡΗΤΑ 50,00']);
  assert.deepEqual([r.amount, r.liters, r.price], [47.53, 25.43, 1.869]);
  assert.equal(r.src.amount.line, null);
  assert.equal(r.src.liters.line, 1);
});

test('μόνο ποσό', () => {
  const r = parseReceipt('ΣΥΝΟΛΟ 30,00\nΜΕΤΡΗΤΑ 50,00');
  assert.deepEqual([r.amount, r.liters, r.price], [30, null, null]);
});
