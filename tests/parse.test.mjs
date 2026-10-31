// node --test tests/parse.test.mjs — ελέγχει την ανάγνωση αποδείξεων χωρίς browser
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('function toRows'), src.indexOf('/* ---------- toast'));
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const { toRows, parseReceipt } = new Function('round', 'DAY', `${body}; return { toRows, parseReceipt };`)(round, 864e5);

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

test('δύο στήλες: ετικέτα και αριθμός στο ίδιο ύψος γίνονται μία γραμμή', () => {
  const w = (t, x, y) => ({ t, c: 90, b: [x, y, x + 60, y + 20] });
  const rows = toRows([w('8,66', 400, 502), w('Ποσότητα', 40, 500), w('LT', 480, 503), w('Τιμή', 40, 540), w('2,014', 400, 538)]);
  assert.deepEqual(rows.map(r => r.map(x => x.t).join(' ')), ['Ποσότητα 8,66 LT', 'Τιμή 2,014']);
});

test('πραγματική απόδειξη (BP, 30/10): λίτρα, τιμή, ποσό και ημερομηνία', () => {
  const d = new Date(Date.now() - 864e5);
  const day = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const r = parseReceipt([`Ημερ/νία: ${day} 17:56`, 'Αριθμός: 1737689', 'Ποσότητα 8,66 LT', 'Τψή: 2,014 Ευρώ', 'Καθ. Αξία 14,06 Ευρώ', 'ΦΠΑ 24.00 %: 3,38 Ευρώ', 'Σύνολο: 17,44 Ευρώ', 'ΣΥΝΟΛΟ: 17,44 Ευρώ']);
  assert.deepEqual([r.amount, r.liters, r.price], [17.44, 8.66, 2.014]);
  assert.equal(r.date, `${day.slice(6)}-${day.slice(3, 5)}-${day.slice(0, 2)}T17:56`);
});

test('τιμή λίτρου που δεν διαβάστηκε: υπολογίζεται από ποσό ÷ λίτρα', () => {
  const r = parseReceipt(['Ποσότητα 8,66 LT', 'Τψή: 2014 Ευρώ', 'ΣΥΝΟΛΟ 17,44']);
  assert.deepEqual([r.amount, r.liters, r.price], [17.44, 8.66, 2.014]);
  assert.equal(r.src.price.line, null);
});

test('παλιά ή αδύνατη ημερομηνία αγνοείται', () => {
  assert.equal(parseReceipt(['01/01/2019 10:00', 'ΣΥΝΟΛΟ 10,00']).date, null);
  assert.equal(parseReceipt(['31/02/2026', 'ΣΥΝΟΛΟ 10,00']).date, null);
});

test('ώρα που διαβάστηκε με παύλα αντί για άνω-κάτω τελεία', () => {
  const d = new Date(Date.now() - 864e5);
  const day = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  assert.equal(parseReceipt([`Ημερ/νία: ${day} 17-56`]).date?.slice(11), '17:56');
});
