/* =============================================================================
   PLOT TO PEAK — SITE CONFIG (reviews + contact/consent forms)
   -----------------------------------------------------------------------------
   Edit the two values below. Full instructions in FORMS-SETUP.md (repo root).
   These values are public and safe to ship in a website.
   ============================================================================= */
window.SITE_CONFIG = {

  /* (1) FORMSPREE ENDPOINT — where the review form + contact form submissions go.
     Create free forms at https://formspree.io (one form is fine for both, or make
     two and set them per-form via data-endpoint). Paste the endpoint URL, e.g.
       https://formspree.io/f/abcdwxyz
     Submissions are emailed to the address you connect in Formspree. */
  formspreeEndpoint: "<<PASTE_FORMSPREE_ENDPOINT>>",

  /* (2) GOOGLE REVIEW LINK — your Google Business Profile "write a review" link.
     Get it from Google Business Profile → Ask for reviews → copy link, e.g.
       https://g.page/r/XXXXXXXXXXXX/review
     Powers the "Review us on Google" buttons. */
  googleReviewUrl: "<<PASTE_GOOGLE_REVIEW_LINK>>"
};


/* =============================================================================
   WIRING — no need to edit below.
   ============================================================================= */
(function () {
  function isSet(v){ return typeof v==="string" && v.length>0 && v.indexOf("<<")===-1; }
  function stars(n){
    n = Math.max(0, Math.min(5, Math.round(n||0)));
    return '<span class="stars" aria-label="'+n+' out of 5 stars">'+
           '★★★★★'.slice(0,n)+'<span class="star-empty">'+'★★★★★'.slice(0,5-n)+'</span></span>';
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  function init(){
    var cfg = window.SITE_CONFIG || {};
    wireGoogle(cfg);
    loadReviews();
    wireForms(cfg);
  }

  /* ---- Google review buttons ---------------------------------------------- */
  function wireGoogle(cfg){
    var url = isSet(cfg.googleReviewUrl) ? cfg.googleReviewUrl : "";
    document.querySelectorAll('[data-review="google"]').forEach(function(el){
      if(url){ el.href = url; }
      else { el.setAttribute('aria-disabled','true'); el.style.opacity='0.55';
             el.style.cursor='not-allowed'; el.title='Add your Google review link in assets/site-config.js';
             el.addEventListener('click',function(e){e.preventDefault();}); }
    });
  }

  /* ---- Load + render curated reviews from assets/reviews.json -------------- */
  function loadReviews(){
    fetch('assets/reviews.json', {cache:'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        var list = (data && Array.isArray(data.reviews)) ? data.reviews : [];
        renderTicker(list);
        renderGrid(list);
      })
      .catch(function(){ renderTicker([]); renderGrid([]); });
  }

  function renderTicker(list){
    var track = document.getElementById('reviews-ticker-track');
    var band  = document.getElementById('reviews-ticker');
    if(!track) return;
    if(!list.length){ if(band) band.style.display='none'; return; }
    var items = list.map(function(rv){
      return '<span class="tick"><span class="tick-stars">'+ '★'.repeat(Math.max(1,Math.min(5,rv.rating||5))) +
             '</span> '+ esc(rv.name) +'</span>';
    }).join('');
    // duplicate for a seamless loop
    track.innerHTML = items + items;
  }

  function renderGrid(list){
    var grid = document.getElementById('reviews-grid');
    if(!grid) return;
    if(!list.length){ grid.innerHTML=''; return; }
    grid.innerHTML = list.map(function(rv){
      return '<article class="review-card">'+
               '<div class="review-top">'+ stars(rv.rating) +'</div>'+
               '<p class="review-text">“'+ esc(rv.text) +'”</p>'+
               '<p class="review-name">'+ esc(rv.name) +
                 (rv.location ? ' <span>· '+esc(rv.location)+'</span>' : '') +'</p>'+
             '</article>';
    }).join('');
  }

  /* ---- Forms (review submit + contact/consent) via Formspree --------------- */
  function wireForms(cfg){
    var endpoint = isSet(cfg.formspreeEndpoint) ? cfg.formspreeEndpoint : "";

    document.querySelectorAll('form[data-formspree]').forEach(function(form){
      var status = form.querySelector('.form-status');
      var ep = form.getAttribute('data-endpoint') || endpoint;

      if(!ep){
        if(status){ status.hidden=false; status.className='form-status warn';
          status.innerHTML='This form isn\'t connected yet. Meanwhile, email '+
            '<a href="mailto:plottopeak@gmail.com">plottopeak@gmail.com</a> or call '+
            '<a href="tel:+19729400182">972-940-0182</a>.'; }
        form.querySelectorAll('button[type="submit"]').forEach(function(b){ b.disabled=true; });
        return;
      }

      form.addEventListener('submit', function(e){
        e.preventDefault();
        // stamp when the form (incl. any consent) was submitted
        var ts = form.querySelector('input[name="submitted_at"]');
        if(ts) ts.value = new Date().toISOString();

        var btn = form.querySelector('button[type="submit"]');
        if(btn){ btn.disabled=true; btn.dataset.label=btn.textContent; btn.textContent='Sending…'; }

        fetch(ep, { method:'POST', body:new FormData(form), headers:{'Accept':'application/json'} })
          .then(function(res){
            if(res.ok){
              form.reset();
              if(status){ status.hidden=false; status.className='form-status ok';
                status.textContent = form.getAttribute('data-success') || 'Thanks! We received your submission.'; }
            } else {
              return res.json().then(function(d){ throw new Error((d && d.error) || 'Submission failed'); });
            }
          })
          .catch(function(){
            if(status){ status.hidden=false; status.className='form-status warn';
              status.innerHTML='Sorry, something went wrong. Please email '+
                '<a href="mailto:plottopeak@gmail.com">plottopeak@gmail.com</a>.'; }
          })
          .finally(function(){ if(btn){ btn.disabled=false; btn.textContent=btn.dataset.label||'Submit'; } });
      });
    });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
