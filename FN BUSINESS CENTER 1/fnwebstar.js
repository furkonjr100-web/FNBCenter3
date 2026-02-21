// DATA PRODUK (contoh) — bisa diganti atau tarik dari API
const products = [
  { id:1, name:"Website 2 halaman standar", price:200000, category:"website 2 halaman standar", img:"Tampilan-website2.png" },
  { id:2, name:"Website 3 halaman premium", price:300000, category:"website 3 halaman premium", img:"Tampilan-website2.png" },
  { id:3, name:"Website 3 halaman VIP", price:1000000, category:"website 3 halaman VIP", img:"Tampilan-website3.png" },
  { id:4, name:"Website VVIP", price:3000000, category:"website VVIP", img:"Tampilan-website3.png" },
  { id:5, name:"Akun shoppyfood", price:25000, category:"akun", img:"shoppy-partner1.png" },
  { id:6, name:"Akun gofood", price:25000, category:"akun", img:"Akun-online.png" },
  { id:6, name:"Akun grab food", price:25000, category:"akun", img:"Akun-online.png" },
//   { id:2, name:"Sablon Topi Costum", price:55000, category:"sablon topi Costum", img:"sablon_topi.png" },
];

const produkGrid = document.getElementById('produk-grid');
const filterCategory = document.getElementById('filter-category');
const searchInput = document.getElementById('search');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Utility: format rupiah
function formatRupiah(number){
  return 'Rp ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Render produk ke grid (filterable)
function renderProducts(list){
  produkGrid.innerHTML = '';
  if(list.length === 0){
    produkGrid.innerHTML = '<p>Tidak ada produk.</p>';
    return;
  }
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="meta">
        <h3>${p.name}</h3>
        <div class="price">${formatRupiah(p.price)}</div>
      </div>
      <p class="muted" style="color:#777;margin:6px 0 0">Kategori: ${p.category}</p>
      <div class="card-actions">
        <button class="btn" data-id="${p.id}">Lihat</button>
        <button class="btn primary" data-add="${p.id}">Tambah ke Keranjang</button>
      </div>
    `;
    produkGrid.appendChild(card);
  });
}

// Filter & search
function applyFilter(){
  const cat = filterCategory.value;
  const q = searchInput.value.trim().toLowerCase();
  const filtered = products.filter(p => {
    const matchCat = cat === 'all' ? true : p.category === cat;
    const matchQ = q === '' ? true : (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return matchCat && matchQ;
  });
  renderProducts(filtered);
}

// Cart functions
function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI(){
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p>Keranjang kosong.</p>';
    cartTotalEl.textContent = formatRupiah(0);
    return;
  }
  let total = 0;
  cart.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}">
      <div class="ci-info">
        <div style="font-weight:600">${prod.name}</div>
        <div style="color:#666">${formatRupiah(prod.price)} x ${item.qty}</div>
      </div>
      <div class="ci-actions">
        <button class="btn" data-dec="${item.id}">-</button>
        <button class="btn" data-inc="${item.id}">+</button>
        <button class="btn" style="background:#ffe8e8;color:#b00" data-rem="${item.id}">Hapus</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
    total += prod.price * item.qty;
  });
  cartTotalEl.textContent = formatRupiah(total);
}

// Add product to cart
function addToCart(id){
  const idx = cart.findIndex(c => c.id === id);
  if(idx > -1) cart[idx].qty += 1;
  else cart.push({ id, qty:1 });
  saveCart();
  openCart();
}

// Modify qty or remove
function changeQty(id, delta){
  const idx = cart.findIndex(c => c.id === id);
  if(idx === -1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveCart();
}
function removeFromCart(id){
  cart = cart.filter(c => c.id !== id);
  saveCart();
}

// Modal controls
function openCart(){
  cartModal.setAttribute('aria-hidden','false');
}
function closeCartModal(){
  cartModal.setAttribute('aria-hidden','true');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // render
  renderProducts(products);
  applyFilter();
  updateCartUI();

  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // delegasi klik produk (add/view)
  produkGrid.addEventListener('click', e => {
    const idAdd = e.target.closest('[data-add]')?.dataset.add;
    const idView = e.target.closest('[data-id]')?.dataset.id;
    if(idAdd){
      addToCart(+idAdd);
    } else if(idView){
      alert('Fitur lihat produk belum diimplementasikan.\nNama produk: ' + products.find(p=>p.id===+idView).name);
    }
  });

  // filter & search events
  filterCategory.addEventListener('change', applyFilter);
  searchInput.addEventListener('input', applyFilter);

  // cart button
  cartBtn.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartModal);

  // cart actions (delegation)
  cartItemsEl.addEventListener('click', e => {
    const dec = e.target.closest('[data-dec]')?.dataset.dec;
    const inc = e.target.closest('[data-inc]')?.dataset.inc;
    const rem = e.target.closest('[data-rem]')?.dataset.rem;
    if(dec) changeQty(+dec, -1);
    if(inc) changeQty(+inc, +1);
    if(rem) removeFromCart(+rem);
  });

  // checkout (demo)
  checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0){ alert('Keranjang kosong'); return; }
    // demo: buat ringkasan & "kosongkan" cart
    alert('Sistem Sedang Error, Langsung Hubungi Penjual');
    cart = [];
    saveCart();
    closeCartModal();
  });

  // nav toggle (mobile)
  navToggle.addEventListener('click', () => {
    const visible = mainNav.style.display === 'block';
    mainNav.style.display = visible ? 'none' : 'block';
  });

  // klik luar modal untuk tutup
  cartModal.addEventListener('click', (ev) => {
    if(ev.target === cartModal) closeCartModal();
  });

  // contact form simple validation
  const contactForm = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');
  contactForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    if(!name || !email || !phone){
      contactFeedback.textContent = 'Nama, email, dan nomor WhatsApp wajib diisi.';
      contactFeedback.style.color = 'red';
      return;
    }
    // demo: "kirim" pesan
    contactFeedback.style.color = 'green';
    contactFeedback.textContent = 'Pesan berhasil dikirim. Kami akan menghubungi Anda melalui WhatsApp/Email.';
    contactForm.reset();
  });

});