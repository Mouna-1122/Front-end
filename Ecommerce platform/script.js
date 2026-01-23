// Short DOM helpers
const $=(sel,el=document)=>el.querySelector(sel);
const $$=(sel,el=document)=>Array.from(el.querySelectorAll(sel));

// Live state (persisted)
const LS_KEY="shop-sphere-cart";
let cart=JSON.parse(localStorage.getItem(LS_KEY)||"[]"); // [{id,name,price,qty,img,category}]

// Elements
const cartBtn=$(".cart-toggle");
const cartPanel=$(".cart");
const cartClose=$(".cart-close");
const cartItems=$("#cartItems");
const cartSubtotal=$("#cartSubtotal");
const cartTotal=$("#cartTotal");
const cartCount=$(".cart-count");
const placeOrderBtn=$("#placeOrder");

// --- Accessibility: announce changes
const announce=(msg)=>{
  const el=document.createElement("div");
  el.setAttribute("aria-live","polite");
  el.className="sr";
  el.style.cssText="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;";
  el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),800);
};

// ---------- CART LOGIC ----------
function saveCart(){ localStorage.setItem(LS_KEY, JSON.stringify(cart)); }
function cartQty(){ return cart.reduce((n,i)=>n+i.qty,0); }
function cartSum(){ return cart.reduce((n,i)=>n+i.qty*i.price,0); }
function formatINR(n){ return "₹"+ n.toLocaleString("en-IN"); }

function renderCart(){
  cartItems.innerHTML=cart.map(item=>(
    `<li class="cart__item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${item.category}</div>
        <div class="qty">
          <button class="dec" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button class="inc" aria-label="Increase quantity">+</button>
          <button class="rem" title="Remove" aria-label="Remove item">✕</button>
        </div>
      </div>
      <div><strong>${formatINR(item.price*item.qty)}</strong></div>
    </li>`
  )).join("") || `<li class="muted" style="padding:.6rem">Your cart is empty.</li>`;
  cartSubtotal.textContent=formatINR(cartSum());
  cartTotal.textContent=formatINR(cartSum()); // shipping free
  cartCount.textContent=cartQty();
}

function addToCart(data){
  const existing=cart.find(i=>i.id===data.id);
  if(existing){ existing.qty+=1; } else { cart.push({...data,qty:1}); }
  saveCart(); renderCart(); announce(`${data.name} added to cart.`);
  openCart();
}

function updateQty(id,delta){
  const item=cart.find(i=>i.id===id);
  if(!item) return;
  item.qty+=delta;
  if(item.qty<=0){ cart=cart.filter(i=>i.id!==id); }
  saveCart(); renderCart();
}

function removeItem(id){
  cart=cart.filter(i=>i.id!==id);
  saveCart(); renderCart();
}

// ---------- UI WIRING ----------
function bindProductButtons(){
  $$(".products .card").forEach(card=>{
    const btn=$(".add",card);
    btn.addEventListener("click",()=>{
      const data={
        id:card.dataset.id,
        name:card.dataset.name,
        price:Number(card.dataset.price),
        img:card.dataset.img,
        category:card.dataset.category
      };
      addToCart(data);
    });
  });
}

function openCart(){ cartPanel.classList.add("open"); }
function closeCart(){ cartPanel.classList.remove("open"); }

cartBtn.addEventListener("click",openCart);
cartClose.addEventListener("click",closeCart);
cartPanel.addEventListener("click",(e)=>{ if(e.target===cartPanel) closeCart(); });

// Delegate qty/update actions
cartItems.addEventListener("click",(e)=>{
  const li=e.target.closest(".cart__item"); if(!li) return;
  const id=li.dataset.id;
  if(e.target.classList.contains("inc")) updateQty(id,+1);
  if(e.target.classList.contains("dec")) updateQty(id,-1);
  if(e.target.classList.contains("rem")) removeItem(id);
});

// Place order -> show confirmation “page” (section)
placeOrderBtn.addEventListener("click",()=>{
  if(!cart.length){ alert("Your cart is empty."); return; }
  cart=[]; saveCart(); renderCart();
  document.location.hash="#confirm";
  $("#confirm").hidden=false;
  announce("Order placed successfully.");
});

// Contact form (basic UX)
$("#contactForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const form=e.currentTarget;
  if(!form.reportValidity()) return;
  $(".contact__note").textContent="Thanks! We'll reply within 24 hours.";
  form.reset();
});

// Hash navigation: reveal sections (acts like multi page)
function handleHash(){
  const target=location.hash||"#home";
  $$("#confirm").forEach(sec=>sec.hidden=(target!=="#confirm" && sec.id==="confirm"));
  const el=$(target);
  if(el){ el.scrollIntoView({behavior:"smooth",block:"start"}); }
}
window.addEventListener("hashchange",handleHash);

// Footer year
$("#year").textContent=new Date().getFullYear();

// Init
bindProductButtons();
renderCart();
handleHash();

/* ---- Micro-optimizations ----
 - Single CSS + single JS (defer) to minimize requests
 - Product images lazy loaded in HTML
 - No external fonts/libs for smaller payloads
 - Lightweight DOM & event delegation
*/