export const DEMO_REPO = { owner: 'commitbureau', repo: 'case-zero' }

const PEOPLE = {
  mara: { name: 'Mara Quinn', login: 'mquinn' },
  theo: { name: 'Theo Park', login: 'tpark' },
  ines: { name: 'Ines Duarte', login: 'iduarte' },
  sam: { name: 'Sam Okafor', login: 'sokafor' },
}

const HISTORY = [
  {
    id: 'c1', who: 'ines', at: '2026-03-02T09:14:00Z', msg: 'Initial commit: README and package.json',
    files: [
      { name: 'README.md', status: 'added', patch: `@@ -0,0 +1,4 @@
+# Night Owl Cafe
+
+Order coffee online before you get to the counter.
+Built by the Night Owl team.` },
      { name: 'package.json', status: 'added', patch: `@@ -0,0 +1,6 @@
+{
+  "name": "night-owl-cafe",
+  "version": "0.1.0",
+  "private": true,
+  "scripts": { "start": "node server/orders.js" }
+}` },
    ],
  },
  {
    id: 'c2', who: 'mara', at: '2026-03-03T10:02:00Z', msg: 'Add menu page',
    files: [
      { name: 'index.html', status: 'added', patch: `@@ -0,0 +1,8 @@
+<!doctype html>
+<html>
+  <head><title>Night Owl Cafe</title></head>
+  <body>
+    <ul id="menu"></ul>
+    <script src="src/menu.js"></script>
+  </body>
+</html>` },
      { name: 'src/menu.js', status: 'added', patch: `@@ -0,0 +1,9 @@
+const MENU = [
+  { name: 'Espresso', price: 2.5 },
+  { name: 'Latte', price: 3.5 },
+]
+
+const list = document.getElementById('menu')
+for (const item of MENU) {
+  list.insertAdjacentHTML('beforeend', '<li>' + item.name + ' - $' + item.price + '</li>')
+}` },
    ],
  },
  {
    id: 'c3', who: 'theo', at: '2026-03-04T15:40:00Z', msg: 'Add order API',
    files: [
      { name: 'server/orders.js', status: 'added', patch: `@@ -0,0 +1,10 @@
+const http = require('http')
+
+const orders = []
+
+http.createServer((req, res) => {
+  if (req.method === 'POST' && req.url === '/orders') {
+    orders.push({ id: orders.length + 1, at: Date.now() })
+    res.end(JSON.stringify(orders.at(-1)))
+  }
+}).listen(3000)` },
    ],
  },
  {
    id: 'c4', who: 'sam', at: '2026-03-06T11:20:00Z', msg: 'Add mocha and flat white to the menu',
    files: [
      { name: 'src/menu.js', status: 'modified', patch: `@@ -1,4 +1,6 @@
 const MENU = [
   { name: 'Espresso', price: 2.5 },
   { name: 'Latte', price: 3.5 },
+  { name: 'Mocha', price: 4 },
+  { name: 'Flat white', price: 3.75 },
 ]` },
    ],
  },
  {
    id: 'c5', who: 'mara', at: '2026-03-07T13:05:00Z', msg: 'Add cart with running total',
    files: [
      { name: 'src/cart.js', status: 'added', patch: `@@ -0,0 +1,11 @@
+const cart = []
+
+function addToCart(item) {
+  cart.push(item)
+  renderTotal()
+}
+
+function renderTotal() {
+  const total = cart.reduce((sum, item) => sum + item.price, 0)
+  document.getElementById('total').textContent = '$' + total.toFixed(2)
+}` },
      { name: 'index.html', status: 'modified', patch: `@@ -3,6 +3,8 @@
   <head><title>Night Owl Cafe</title></head>
   <body>
     <ul id="menu"></ul>
+    <p>Total: <span id="total">$0.00</span></p>
     <script src="src/menu.js"></script>
+    <script src="src/cart.js"></script>
   </body>
 </html>` },
    ],
  },
  {
    id: 'c6', who: 'ines', at: '2026-03-09T09:30:00Z', msg: 'Add cart tests',
    files: [
      { name: 'tests/cart.test.js', status: 'added', patch: `@@ -0,0 +1,8 @@
+const assert = require('assert')
+const { addToCart, cartTotal } = require('../src/cart')
+
+addToCart({ name: 'Latte', price: 3.5 })
+addToCart({ name: 'Mocha', price: 4 })
+assert.strictEqual(cartTotal(), 7.5)
+
+console.log('cart tests passed')` },
    ],
  },
  {
    id: 'c7', who: 'theo', at: '2026-03-10T16:45:00Z', msg: 'Fix order IDs repeating after a restart',
    files: [
      { name: 'server/orders.js', status: 'modified', patch: `@@ -1,10 +1,11 @@
 const http = require('http')
+const crypto = require('crypto')

 const orders = []

 http.createServer((req, res) => {
   if (req.method === 'POST' && req.url === '/orders') {
-    orders.push({ id: orders.length + 1, at: Date.now() })
+    orders.push({ id: crypto.randomUUID(), at: Date.now() })
     res.end(JSON.stringify(orders.at(-1)))
   }
 }).listen(3000)` },
    ],
  },
  {
    id: 'c8', who: 'mara', at: '2026-03-11T10:15:00Z', msg: 'Add oat milk option', parents: ['c7'],
    files: [
      { name: 'src/menu.js', status: 'modified', patch: `@@ -4,3 +4,6 @@
   { name: 'Mocha', price: 4 },
   { name: 'Flat white', price: 3.75 },
 ]
+
+// Any drink can be made with oat milk for 50 cents more.
+const OAT_MILK_EXTRA = 0.5` },
    ],
  },
  {
    id: 'c9', who: 'ines', at: '2026-03-11T14:50:00Z', msg: 'Document how to run the tests', parents: ['c7'],
    files: [
      { name: 'README.md', status: 'modified', patch: `@@ -2,3 +2,7 @@

 Order coffee online before you get to the counter.
 Built by the Night Owl team.
+
+## Tests
+
+Run node tests/cart.test.js` },
    ],
  },
  {
    id: 'c10', who: 'sam', at: '2026-03-12T09:00:00Z', parents: ['c9', 'c8'],
    msg: 'Merge pull request #12 from mquinn/oat-milk\n\nAdd oat milk option', files: [],
  },
  {
    id: 'c11', who: 'sam', at: '2026-03-13T11:35:00Z', msg: 'Return 400 for empty orders',
    files: [
      { name: 'server/orders.js', status: 'modified', patch: `@@ -6,6 +6,10 @@ const orders = []

 http.createServer((req, res) => {
   if (req.method === 'POST' && req.url === '/orders') {
+    if (req.headers['content-length'] === '0') {
+      res.statusCode = 400
+      return res.end('Order is empty')
+    }
     orders.push({ id: crypto.randomUUID(), at: Date.now() })
     res.end(JSON.stringify(orders.at(-1)))
   }` },
    ],
  },
  {
    id: 'c12', who: 'theo', at: '2026-03-14T15:10:00Z', msg: 'Serve the menu from the API', parents: ['c11'],
    files: [
      { name: 'server/orders.js', status: 'modified', patch: `@@ -14,4 +14,8 @@ http.createServer((req, res) => {
     orders.push({ id: crypto.randomUUID(), at: Date.now() })
     res.end(JSON.stringify(orders.at(-1)))
   }
+  if (req.method === 'GET' && req.url === '/menu') {
+    res.setHeader('Content-Type', 'application/json')
+    res.end(JSON.stringify(require('../src/menu-data.json')))
+  }
 }).listen(3000)` },
      { name: 'src/menu-data.json', status: 'added', patch: `@@ -0,0 +1,6 @@
+[
+  { "name": "Espresso", "price": 2.5 },
+  { "name": "Latte", "price": 3.5 },
+  { "name": "Mocha", "price": 4 },
+  { "name": "Flat white", "price": 3.75 }
+]` },
    ],
  },
  {
    id: 'c13', who: 'ines', at: '2026-03-15T10:25:00Z', msg: 'Fix total showing NaN for free items', parents: ['c11'],
    files: [
      { name: 'src/cart.js', status: 'modified', patch: `@@ -6,6 +6,6 @@ function addToCart(item) {
 }

 function renderTotal() {
-  const total = cart.reduce((sum, item) => sum + item.price, 0)
+  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0)
   document.getElementById('total').textContent = '$' + total.toFixed(2)
 }` },
    ],
  },
  {
    id: 'c14', who: 'theo', at: '2026-03-16T09:40:00Z', parents: ['c13', 'c12'],
    msg: 'Merge pull request #15 from tpark/menu-endpoint\n\nServe the menu from the API', files: [],
  },
  {
    id: 'c15', who: 'mara', at: '2026-03-17T13:55:00Z', msg: 'Load the menu from the API instead of hardcoding it',
    files: [
      { name: 'src/menu.js', status: 'modified', patch: `@@ -1,9 +1,4 @@
-const MENU = [
-  { name: 'Espresso', price: 2.5 },
-  { name: 'Latte', price: 3.5 },
-  { name: 'Mocha', price: 4 },
-  { name: 'Flat white', price: 3.75 },
-]
+const MENU = await fetch('/menu').then((res) => res.json())

 // Any drink can be made with oat milk for 50 cents more.
 const OAT_MILK_EXTRA = 0.5` },
    ],
  },
  {
    id: 'c16', who: 'ines', at: '2026-03-18T10:10:00Z', msg: 'Test that empty orders are rejected',
    files: [
      { name: 'tests/orders.test.js', status: 'added', patch: `@@ -0,0 +1,7 @@
+const assert = require('assert')
+
+const res = await fetch('http://localhost:3000/orders', { method: 'POST' })
+assert.strictEqual(res.status, 400)
+assert.strictEqual(await res.text(), 'Order is empty')
+
+console.log('order tests passed')` },
    ],
  },
  {
    id: 'c17', who: 'sam', at: '2026-03-19T16:20:00Z', msg: 'Show a pastry section on the menu',
    files: [
      { name: 'index.html', status: 'modified', patch: `@@ -3,6 +3,8 @@
   <body>
     <ul id="menu"></ul>
+    <h2>Pastries</h2>
+    <ul id="pastries"></ul>
     <p>Total: <span id="total">$0.00</span></p>
     <script src="src/menu.js"></script>
     <script src="src/cart.js"></script>` },
    ],
  },
  {
    id: 'c18', who: 'theo', at: '2026-03-20T09:05:00Z', msg: 'Bump version to 0.2.0',
    files: [
      { name: 'package.json', status: 'modified', patch: `@@ -1,6 +1,6 @@
 {
   "name": "night-owl-cafe",
-  "version": "0.1.0",
+  "version": "0.2.0",
   "private": true,
   "scripts": { "start": "node server/orders.js" }
 }` },
    ],
  },
  {
    id: 'c19', who: 'theo', at: '2026-03-21T11:45:00Z', msg: 'Explain the order API in the README',
    files: [
      { name: 'README.md', status: 'modified', patch: `@@ -6,3 +6,8 @@ Built by the Night Owl team.
 ## Tests

 Run node tests/cart.test.js
+
+## API
+
+- GET /menu lists drinks and prices.
+- POST /orders places an order. Empty orders get a 400.` },
    ],
  },
  {
    id: 'c20', who: 'mara', at: '2026-03-23T14:30:00Z', msg: 'Remember the cart between visits',
    files: [
      { name: 'src/cart.js', status: 'modified', patch: `@@ -1,6 +1,7 @@
-const cart = []
+const cart = JSON.parse(localStorage.getItem('cart') || '[]')

 function addToCart(item) {
   cart.push(item)
+  localStorage.setItem('cart', JSON.stringify(cart))
   renderTotal()
 }` },
    ],
  },
  {
    id: 'c21', who: 'theo', at: '2026-03-24T17:15:00Z', msg: 'Log every order to the console',
    files: [
      { name: 'server/orders.js', status: 'modified', patch: `@@ -15,6 +15,7 @@ http.createServer((req, res) => {
       return res.end('Order is empty')
     }
     orders.push({ id: crypto.randomUUID(), at: Date.now() })
+    console.log('New order', orders.at(-1).id)
     res.end(JSON.stringify(orders.at(-1)))
   }` },
    ],
  },
]

function fakeSha(seed) {
  let h = 2166136261
  let out = ''
  for (let round = 0; out.length < 40; round++) {
    for (const ch of seed + ':' + round) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
    out += h.toString(16).padStart(8, '0')
  }
  return out.slice(0, 40)
}

const SHAS = Object.fromEntries(HISTORY.map((c) => [c.id, fakeSha(c.id)]))
const COMMITS = HISTORY.map((c, i) => {
  const person = PEOPLE[c.who]
  const parentIds = c.parents || (i > 0 ? [HISTORY[i - 1].id] : [])
  return {
    sha: SHAS[c.id],
    parents: parentIds.map((id) => ({ sha: SHAS[id] })),
    author: { login: person.login },
    commit: {
      message: c.msg,
      author: { name: person.name, date: c.at },
      committer: { name: person.name, date: c.at },
      tree: { sha: fakeSha('tree-' + c.id) },
    },
    files: c.files.map((f) => {
      const lines = f.patch.split('\n')
      const additions = lines.filter((l) => l.startsWith('+')).length
      const deletions = lines.filter((l) => l.startsWith('-')).length
      return { filename: f.name, status: f.status, additions, deletions, changes: additions + deletions, patch: f.patch }
    }),
  }
}).reverse()

const listForm = (c) => {
  const { files: _files, ...rest } = c
  return rest
}

export function demoResponse(path) {
  const prefix = `/repos/${DEMO_REPO.owner}/${DEMO_REPO.repo}/`
  if (!path.toLowerCase().startsWith(prefix)) return undefined
  const rest = path.slice(prefix.length)

  const one = rest.match(/^commits\/([0-9a-f]{40})$/)
  if (one) return COMMITS.find((c) => c.sha === one[1])

  if (rest.startsWith('commits?')) {
    const file = new URLSearchParams(rest.slice('commits?'.length)).get('path')
    const matching = file ? COMMITS.filter((c) => c.files.some((f) => f.filename === file)) : COMMITS
    return matching.map(listForm)
  }
  return undefined
}
