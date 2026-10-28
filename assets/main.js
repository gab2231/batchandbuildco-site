(function(){
 var side=document.querySelector('.sidebar'),tg=document.querySelector('.sidetoggle');
 if(tg)tg.addEventListener('click',function(){var o=side.classList.toggle('open');tg.setAttribute('aria-expanded',o)});
 var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
})();
