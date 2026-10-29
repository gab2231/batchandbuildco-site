(function(){'use strict';
var cfg=window.BB_HG||{},API=(cfg.endpoint||'').replace(/\/checkout$/,''),R=document.documentElement.getAttribute('data-root')||'';
function api(p,o){o=o||{};o.credentials='include';if(o.body){o.method='POST';o.headers={'content-type':'application/json'};o.body=JSON.stringify(o.body)}
 return fetch(API+p,o).then(function(r){return r.json().catch(function(){return{}}).then(function(d){d._status=r.status;return d})})}
function $(s){return document.querySelector(s)}
function money(c){return'$'+(c/100).toFixed(2)}
function esc(s){return String(s).replace(/[&<>"']/g,function(m){return'&#'+m.charCodeAt(0)+';'})}
function setPills(me){document.querySelectorAll('.hg-acct').forEach(function(a){a.textContent=me?'My account':'Sign in';a.href=R+'account.html'+(me?'':'#signin')});
 document.querySelectorAll('.hg-earn').forEach(function(n){n.innerHTML=me?'Signed in as '+esc(me.email)+(me.rewards&&me.rewards.enabled?' &middot; '+me.points+' points':'')+(sessionStorage.getItem('bb_hg_redeem')?' &middot; using '+esc(sessionStorage.getItem('bb_hg_redeem'))+' points at checkout':''):'<a href="'+R+'account.html#signin">Sign in</a> or <a href="'+R+'account.html#signup">join free</a> to earn points on orders.'})}
var ME=null;
function loadMe(){if(!API){setPills(null);return Promise.resolve(null)}return api('/me').then(function(d){ME=d._status===200?d:null;setPills(ME);return ME}).catch(function(){setPills(null)})}
// ---- account page ----
function tab(which){['signup','signin'].forEach(function(t){var b=$('#tab-'+t),p=$('#panel-'+t);if(!b)return;var on=t===which;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;p.hidden=!on})}
function msg(el,t,bad){el.textContent=t;el.className='hg-msg'+(bad?' bad':'');el.hidden=false}
function sendLink(form,mode){var m=form.querySelector('.hg-msg'),btn=form.querySelector('button[type=submit]'),em=form.querySelector('input[type=email]').value;
 btn.disabled=true;api('/auth/start',{body:{email:em,mode:mode,consent:mode==='signup'&&form.querySelector('[name=consent]').checked,remember:form.querySelector('[name=remember]').checked}})
 .then(function(d){btn.disabled=false;if(d._status===200)msg(m,mode==='signin'?'If you have an account with that email, a sign-in link is on its way. Check your inbox — it works once and expires in 15 minutes.':'Check your inbox for a link to finish joining. It works once and expires in 15 minutes.');else msg(m,d.error||'Something went wrong. Try again.',true)})
 .catch(function(){btn.disabled=false;msg(m,'Accounts are not open yet.',true)})}
function renderMe(me){$('#acct-out').hidden=!!me;$('#acct-in').hidden=!me;if(!me)return;
 $('#acct-email').textContent=me.email;$('#acct-consent').checked=!!me.marketing_consent;
 var rw=me.rewards||{};$('#acct-points').textContent=me.points;
 $('#acct-rewards-note').textContent=rw.enabled?'':'Rewards are coming soon. Points you earn will appear here once the program opens.';
 var rd=$('#form-redeem');rd.hidden=!rw.enabled;
 if(rw.enabled){$('#redeem-pts').min=rw.minRedeem;$('#redeem-pts').max=me.points;$('#redeem-help').textContent='Minimum '+rw.minRedeem+' points. Each point is worth '+money(rw.centsPerPoint)+' off, up to '+rw.maxRedeemPct+'% of your cart. Applied once at your next checkout.'}
 $('#acct-orders').innerHTML=me.orders.length?'<ul class="hg-orders">'+me.orders.map(function(o){return'<li><span>'+new Date(o.created_at*1000).toLocaleDateString()+'</span><b>'+money(o.amount_total)+'</b></li>'}).join('')+'</ul>':'<p>No orders yet.</p>'}
function initAccount(){if(!$('#acct'))return;
 ['signup','signin'].forEach(function(t){$('#tab-'+t).addEventListener('click',function(){tab(t);location.hash=t})});
 $('#acct-tabs').addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=$('#tab-signup').getAttribute('aria-selected')==='true'?'signin':'signup';tab(n);$('#tab-'+n).focus()}});
 tab(location.hash==='#signup'?'signup':'signin');
 $('#form-signup').addEventListener('submit',function(e){e.preventDefault();sendLink(e.target,'signup')});
 $('#form-signin').addEventListener('submit',function(e){e.preventDefault();sendLink(e.target,'signin')});
 $('#acct-signout').addEventListener('click',function(){api('/auth/logout',{body:{}}).then(function(){sessionStorage.removeItem('bb_hg_redeem');ME=null;setPills(null);renderMe(null);tab('signin');msg($('#acct-status'),'You are signed out.')})});
 $('#acct-consent').addEventListener('change',function(e){api('/me/consent',{body:{consent:e.target.checked}})});
 $('#acct-export').addEventListener('click',function(){api('/me/export').then(function(d){delete d._status;var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='batch-and-build-my-data.json';a.click()})});
 $('#acct-delete').addEventListener('click',function(){var c=prompt('This permanently deletes your account and points. Type DELETE to confirm.');if(c!=='DELETE')return;api('/me/delete',{body:{confirm:'DELETE'}}).then(function(d){if(d._status===200){ME=null;setPills(null);renderMe(null);msg($('#acct-status'),'Your account was deleted.')}})});
 $('#form-redeem').addEventListener('submit',function(e){e.preventDefault();var n=parseInt($('#redeem-pts').value,10),rw=ME&&ME.rewards;var m=e.target.querySelector('.hg-msg');
  if(!rw||!rw.enabled||!(n>=rw.minRedeem)||n>ME.points)return msg(m,'Enter between '+(rw?rw.minRedeem:0)+' and '+(ME?ME.points:0)+' points.',true);
  sessionStorage.setItem('bb_hg_redeem',String(n));msg(m,n+' points will be applied at your next checkout. Final check happens on our server.');setPills(ME)});
 var tok=(location.hash.match(/token=([A-Za-z0-9_-]+)/)||[])[1];
 var go=tok?api('/auth/verify',{body:{token:tok}}).then(function(d){history.replaceState(null,'',location.pathname);if(d._status!==200)msg($('#acct-status'),d.error||'That link did not work.',true);else msg($('#acct-status'),'You are signed in.')}):Promise.resolve();
 go.then(loadMe).then(renderMe)}
document.addEventListener('DOMContentLoaded',function(){if($('#acct'))initAccount();else loadMe()});
window.addEventListener('hashchange',function(){if(/token=/.test(location.hash))location.reload()});
})();
