(function(){var f=document.getElementById('calc');if(!f)return;var rows=document.getElementById('rows');
function money(n){return(n<0?'-':'')+'$'+Math.abs(n).toFixed(2)}
function addRow(n,c){var d=document.createElement('div');d.className='row';d.innerHTML='<input type="text" class="ing" placeholder="Ingredient" aria-label="Ingredient name" maxlength="60"><input type="number" class="cost" placeholder="Cost $" aria-label="Ingredient cost in dollars" min="0" max="10000" step="0.01" inputmode="decimal"><button type="button" class="rm" aria-label="Remove ingredient">&times;</button>';d.querySelector('.ing').value=n||'';d.querySelector('.cost').value=c==null?'':c;d.querySelector('.rm').onclick=function(){if(rows.children.length>1)d.remove()};rows.appendChild(d)}
[['Chicken thighs (3 lb)',9.5],['Rice (2 lb)',2.5],['Broccoli (2 lb)',4]].forEach(function(x){addRow(x[0],x[1])});
document.getElementById('addrow').onclick=function(){addRow();rows.lastChild.querySelector('.ing').focus()};
f.onsubmit=function(ev){ev.preventDefault();var err=document.getElementById('err'),out=document.getElementById('out'),msgs=[],total=0,n=0;
[].forEach.call(rows.querySelectorAll('.row'),function(r,i){var ci=r.querySelector('.cost'),v=ci.value.trim(),nm=r.querySelector('.ing').value.trim();ci.removeAttribute('aria-invalid');if(v===''&&nm==='')return;var x=Number(v);if(v===''||!isFinite(x)||x<0||x>10000){msgs.push('Ingredient '+(i+1)+': enter a cost between $0 and $10,000.');ci.setAttribute('aria-invalid','true')}else{total+=x;n++}});
var s=Number(document.getElementById('servings').value),eo=Number(document.getElementById('eatout').value);
if(!n&&!msgs.length)msgs.push('Add at least one ingredient with a cost.');
if(!Number.isInteger(s)||s<1||s>200)msgs.push('Servings must be a whole number from 1 to 200.');
if(document.getElementById('eatout').value===''||!isFinite(eo)||eo<0||eo>500)msgs.push('Eat-out cost must be between $0 and $500.');
if(msgs.length){err.textContent=msgs.join(' ');err.hidden=false;out.hidden=true;return}
err.hidden=true;var per=total/s,week=s*eo-total,month=week*52/12;
document.getElementById('o-total').textContent=money(total);document.getElementById('o-per').textContent=money(per);document.getElementById('o-week').textContent=money(week);document.getElementById('o-month').textContent=money(month);
document.getElementById('o-note').textContent=week>=0?'You save '+money(eo-per)+' per meal compared with eating out at '+money(eo)+'.':'At these prices, prepping costs '+money(per-eo)+' more per meal than eating out at '+money(eo)+'.';
out.hidden=false;var c=document.getElementById('cta');if(c)c.hidden=false};
var sh=document.getElementById('share');if(sh)sh.onclick=function(){var u=location.href.split('#')[0],m=document.getElementById('share-msg');function copy(){(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){m.textContent='Link copied.'},function(){m.textContent=u})}
if(navigator.share)navigator.share({title:document.title,url:u}).catch(function(e){if(e&&e.name!=='AbortError')copy()});else copy()};
var ce=document.getElementById('copyembed');if(ce)ce.onclick=function(){var t=document.getElementById('embedcode'),m=document.getElementById('embed-msg');t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(function(){m.textContent='Copied.'},function(){try{document.execCommand('copy');m.textContent='Copied.'}catch(e){m.textContent='Select the code and copy it.'}})};
})();
