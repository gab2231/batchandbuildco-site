(function(){'use strict';
var R=document.documentElement.getAttribute('data-root')||'',KEY='bb_hg_cart_v1',CAT={},cfg=window.BB_HG||{};
function load(){try{var c=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(c)?c.filter(function(l){return l&&typeof l.id==='string'&&l.qty>0}):[]}catch(e){return[]}}
function save(c){localStorage.setItem(KEY,JSON.stringify(c));render()}
function K(l){return l.id+(l.opt?'|'+l.opt:'')}
function optLabel(p,o){if(!p||!p.options||!o)return'';var v=p.options.values.find(function(x){return x.id===o});return v?v.label:''}
function money(c){return'$'+(c/100).toFixed(2)}
function esc(s){return String(s).replace(/[&<>"']/g,function(m){return'&#'+m.charCodeAt(0)+';'})}
function live(m){var a=document.getElementById('hg-live');if(a){a.textContent='';setTimeout(function(){a.textContent=m},30)}}
function setQty(key,q){var c=load(),l=c.find(function(x){return K(x)===key});q=Math.max(0,Math.min(10,q|0));
 if(!l&&q>0){var s=key.split('|'),n={id:s[0],qty:q};if(s[1])n.opt=s[1];c.push(n)}else if(l){if(q===0)c=c.filter(function(x){return K(x)!==key});else l.qty=q}save(c)}
function add(id){var p=CAT[id],sel=document.querySelector('select[data-opt-for="'+id+'"]'),o=p&&p.options?(sel&&sel.value)||p.options.default:'';var key=id+(o?'|'+o:''),c=load(),l=c.find(function(x){return K(x)===key});setQty(key,(l?l.qty:0)+1);live((p?p.name:'Item')+(o?' ('+optLabel(p,o)+')':'')+' added to cart');}
function lines(){return load().filter(function(l){var p=CAT[l.id];if(!p)return false;if(p.options){if(!l.opt)l.opt=p.options.default;return!!optLabel(p,l.opt)}return!l.opt})}
function listHTML(){var ls=lines();if(!ls.length)return'<p class="hg-empty">Your cart is empty.</p>';
 return'<ul class="hg-lines">'+ls.map(function(l){var p=CAT[l.id],ol=optLabel(p,l.opt),n=esc(p.name+(ol?' – '+ol:''));return'<li data-id="'+esc(K(l))+'"><div class="hg-li"><p class="hg-n">'+esc(p.name)+'</p>'+(ol?'<p class="hg-o">'+esc(p.options.name)+': '+esc(ol)+'</p>':'')+'<p>'+money(p.price_cents)+' each</p></div><div class="hg-q" role="group" aria-label="Quantity for '+n+'"><button type="button" class="hg-dec" aria-label="Decrease quantity of '+n+'">&minus;</button><span aria-live="polite">'+l.qty+'</span><button type="button" class="hg-inc" aria-label="Increase quantity of '+n+'"'+(l.qty>=10?' disabled':'')+'>+</button></div><p class="hg-lt">'+money(p.price_cents*l.qty)+'</p><button type="button" class="hg-rm" aria-label="Remove '+n+'">Remove</button></li>'}).join('')+'</ul>'}
function subtotal(){return lines().reduce(function(s,l){return s+CAT[l.id].price_cents*l.qty},0)}
function render(){var n=lines().reduce(function(s,l){return s+l.qty},0);
 document.querySelectorAll('.hg-count').forEach(function(e){e.textContent=n});
 document.querySelectorAll('.hg-list').forEach(function(e){e.innerHTML=listHTML()});
 document.querySelectorAll('.hg-sub').forEach(function(e){e.textContent=money(subtotal())});
 document.querySelectorAll('.hg-checkout').forEach(function(b){b.disabled=!n})}
var drawer,opener;
function openD(){opener=document.activeElement;drawer.hidden=false;document.getElementById('hg-bg').hidden=false;document.querySelectorAll('.hg-open').forEach(function(b){b.setAttribute('aria-expanded','true')});drawer.querySelector('.hg-close').focus()}
function closeD(){drawer.hidden=true;document.getElementById('hg-bg').hidden=true;document.querySelectorAll('.hg-open').forEach(function(b){b.setAttribute('aria-expanded','false')});if(opener&&opener.focus)opener.focus()}
function redeemPts(){var n=parseInt(sessionStorage.getItem('bb_hg_redeem')||'0',10);return n>0?n:0}
async function checkout(btn){var err=document.querySelectorAll('.hg-err');err.forEach(function(e){e.hidden=true});
 if(!cfg.endpoint){err.forEach(function(e){e.textContent='Checkout is not open yet.';e.hidden=false});return}
 btn.disabled=true;btn.textContent='Starting secure checkout…';
 try{var r=await fetch(cfg.endpoint,{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify(Object.assign({items:lines().map(function(l){return l.opt?{id:l.id,qty:l.qty,opt:l.opt}:{id:l.id,qty:l.qty}})},redeemPts()?{redeem:redeemPts()}:{}))});var d=await r.json();
  if(r.ok&&d.url)sessionStorage.removeItem('bb_hg_redeem');if(!r.ok||!d.url)throw new Error(d.error||'Checkout failed');window.BB_HG_LAST=d.url;if(!cfg.noRedirect)location.href=d.url;else{btn.textContent='Checkout ready';live('Checkout ready')}}
 catch(e){err.forEach(function(x){x.textContent='Sorry, checkout could not start: '+e.message;x.hidden=false});btn.disabled=false;btn.textContent='Checkout'}}
document.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var li=t.closest('[data-id]'),id=li&&li.getAttribute('data-id');
 if(t.classList.contains('hg-add'))add(t.getAttribute('data-add'));
 else if(t.classList.contains('hg-open'))openD();else if(t.classList.contains('hg-close'))closeD();
 else if(t.classList.contains('hg-inc'))setQty(id,(load().find(function(x){return K(x)===id})||{qty:0}).qty+1);
 else if(t.classList.contains('hg-dec'))setQty(id,(load().find(function(x){return K(x)===id})||{qty:1}).qty-1);
 else if(t.classList.contains('hg-rm')){setQty(id,0);live('Item removed')}
 else if(t.classList.contains('hg-checkout'))checkout(t)});
document.addEventListener('keydown',function(e){if(!drawer||drawer.hidden)return;if(e.key==='Escape')closeD();
 if(e.key==='Tab'){var f=drawer.querySelectorAll('button:not([disabled]),a[href]');if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
document.addEventListener('DOMContentLoaded',function(){drawer=document.getElementById('hg-drawer');document.getElementById('hg-bg').addEventListener('click',closeD);
 fetch(R+'assets/products.json').then(function(r){return r.json()}).then(function(d){d.products.forEach(function(p){CAT[p.id]=p});render()})});
window.addEventListener('storage',render);
})();
