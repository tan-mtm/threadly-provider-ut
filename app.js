const providers = [
  { id: 'quick-hem', name: 'Priya', studio: 'Quick Hem Studio', area: 'Goleta', rating: '4.6', services: ['Hemming','Alterations','Repairs'], price: 12, turnaround: 'Same-day hemming when booked before noon', avatar: 'P', tone: 'sage', verified: true },
  { id: 'taytum', name: 'Taytum', studio: 'Taytum Nykelle', area: 'Goleta', rating: '5.0', services: ['Hemming','Custom garment','Alterations'], price: 15, turnaround: 'Hemming 2–3 days; custom orders 2–4 weeks', avatar: 'T', tone: '', verified: true },
  { id: 'odette', name: 'Odette', studio: 'Odette Bridal Atelier', area: 'Santa Barbara', rating: '4.9', services: ['Wedding dress','Alterations','Custom garment'], price: 45, turnaround: 'Bridal fittings by appointment; 1–2 weeks typical', avatar: 'O', tone: '', verified: true },
  { id: 'marisol', name: 'Marisol', studio: 'Vega Stitch & Alter', area: 'Santa Barbara', rating: '4.8', services: ['Alterations','Tailoring','Repairs'], price: 20, turnaround: 'Most jobs in 3–5 days', avatar: 'M', tone: 'sage', verified: true }
];

const defaultRequests = [
  { id: 'r1', customer: 'Maya Chen', initials: 'MC', service: 'Bridal hemming', item: 'Silk wedding guest dress', submitted: 'Today, 9:42 AM', deadline: 'November 14', status: 'new', budget: 'Not provided', description: 'The dress is about 2 inches too long with the shoes I plan to wear. I would like to keep the original hem if possible.', location: 'Santa Barbara', photo: true },
  { id: 'r2', customer: 'Luis Ortega', initials: 'LO', service: 'Repairs', item: 'Denim jacket', submitted: 'Yesterday, 4:18 PM', deadline: 'No deadline', status: 'quoted', budget: '$40–60', description: 'The elbow has a tear about three inches long. I am open to visible mending.', location: 'Goleta', photo: true, quote: '$48' },
  { id: 'r3', customer: 'Elena Park', initials: 'EP', service: 'Alterations', item: 'Vintage wool trousers', submitted: 'Oct 28, 1:05 PM', deadline: 'November 20', status: 'accepted', budget: '$60–90', description: 'The waist needs to come in and the legs are wider than I prefer.', location: 'Santa Barbara', photo: false, quote: '$72' }
];

const profileDefault = { name:'Odette', studio:'Odette Bridal Atelier', location:'Riviera, Santa Barbara', bio:'Bridal and formal-wear specialist, from last-minute bustle fixes to full gown alterations.', experience:'18', response:'Within 24 hours', visible:true };
let state = {
  requests: JSON.parse(localStorage.getItem('threadly-requests') || 'null') || defaultRequests,
  profile: JSON.parse(localStorage.getItem('threadly-profile') || 'null') || profileDefault,
  availability: JSON.parse(localStorage.getItem('threadly-availability') || 'null') || {Mon:false,Tue:false,Wed:true,Thu:true,Fri:true,Sat:true,Sun:true},
  filter: { service:'All services', area:'All areas' }
};

const main = document.querySelector('#main');
const modalRoot = document.querySelector('#modal-root');
const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const money = n => `$${Number(n).toFixed(0)}`;
const statusLabel = s => ({new:'New request',quoted:'Quote sent',accepted:'Accepted',declined:'Declined'}[s] || s);
function persist(){ localStorage.setItem('threadly-requests',JSON.stringify(state.requests)); localStorage.setItem('threadly-profile',JSON.stringify(state.profile)); localStorage.setItem('threadly-availability',JSON.stringify(state.availability)); }
function toast(message){ const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600); }

function setActive(area){ document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===area)); }
function route(){
  const hash = location.hash || '#/search';
  if(hash.startsWith('#/provider')){ setActive('provider'); renderProvider(hash.replace('#/provider','') || '/'); }
  else { setActive('search'); renderCustomer(hash); }
  window.scrollTo({top:0});
}

function renderCustomer(hash){
  const profileMatch = hash.match(/^#\/seamstress\/(.+)$/);
  if(profileMatch) return renderPublicProfile(profileMatch[1]);
  const filtered = providers.filter(p => (state.filter.service==='All services'||p.services.includes(state.filter.service)) && (state.filter.area==='All areas'||p.area===state.filter.area));
  main.innerHTML = `<div class="page">
    <section class="hero">
      <div><div class="eyebrow">Local skill, easier to find</div><h1>Connecting you to the people who sew.</h1><p class="lead">Compare local seamstresses, see their work and starting prices, and prepare a quote request.</p>
        <div class="search-panel" role="search">
          <div class="field"><label for="service-filter">What do you need?</label><select id="service-filter">${['All services','Hemming','Alterations','Repairs','Custom garment','Wedding dress','Tailoring'].map(x=>`<option ${x===state.filter.service?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label for="area-filter">Where?</label><select id="area-filter">${['All areas','Santa Barbara','Goleta'].map(x=>`<option ${x===state.filter.area?'selected':''}>${x}</option>`).join('')}</select></div>
          <button class="btn" id="search-btn">Search</button>
        </div>
      </div><div class="hero-art" aria-label="Abstract sewing illustration"><div class="stitch-scene"></div></div>
    </section>
    <section aria-labelledby="results-title"><div class="section-head"><div><div class="eyebrow">${filtered.length} matches</div><h2 id="results-title">Find a seamstress</h2></div><div class="segmented" aria-label="View"><button class="active">List</button><button onclick="toast('Map view is represented in the original prototype')">Map</button></div></div>
      <div class="listing-grid">${filtered.length?filtered.map(providerCard).join(''):`<div class="empty-note">No seamstresses match these filters. Try another service or area.</div>`}</div>
    </section>
  </div>`;
  document.querySelector('#search-btn').onclick=()=>{ state.filter.service=document.querySelector('#service-filter').value;state.filter.area=document.querySelector('#area-filter').value;renderCustomer('#/search'); };
}

function providerCard(p){ return `<a class="card provider-card" href="#/seamstress/${p.id}"><div class="avatar ${p.tone}">${p.avatar}</div><div><div class="card-top"><div><h3>${esc(p.name)}</h3><div class="small muted">${esc(p.studio)} · ${esc(p.area)}</div></div><div class="rating">★ ${p.rating}</div></div>${p.verified?'<div class="verified">✓ Verified profile</div>':''}<div class="tag-row">${p.services.map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div><div class="card-top"><span class="price">From ${money(p.price)}</span><span class="small muted">${esc(p.turnaround)}</span></div></div></a>`; }

function renderPublicProfile(id){
  const p=providers.find(x=>x.id===id)||providers[2];
  main.innerHTML=`<div class="page"><a href="#/search" class="small muted">← Back to results</a><section class="card profile-hero"><div class="avatar ${p.tone}">${p.avatar}</div><div class="profile-title"><div class="verified">✓ Verified · ${esc(p.studio)}</div><h1>${esc(p.name)}</h1><div class="profile-meta"><span>★ ${p.rating}</span><span>${esc(p.area)}</span><span>Replies within 24 hours</span></div></div><button class="btn" onclick="openCustomerQuote('${p.id}')">Request a quote</button></section>
    <div class="content-grid"><div><section class="card content-card"><h2>Meet ${esc(p.name)}</h2><p class="lead">${p.id==='odette'?esc(state.profile.bio):`A local specialist focused on ${p.services.join(', ').toLowerCase()}.`}</p></section><section class="card content-card" style="margin-top:20px"><h2>Portfolio</h2><div class="portfolio"><div>Portfolio image 1</div><div>Portfolio image 2</div><div>Portfolio image 3</div></div></section></div><aside class="card content-card"><h2>Services & starting prices</h2>${p.services.map((s,i)=>`<div class="service-row"><span>${esc(s)}</span><strong>From ${money(p.price+i*18)}</strong></div>`).join('')}<h3 style="margin-top:22px">Turnaround</h3><p class="muted">${esc(p.turnaround)}</p></aside></div></div>`;
}

function openCustomerQuote(id){
  const p=providers.find(x=>x.id===id);
  modalRoot.innerHTML=`<div class="modal-backdrop" role="presentation" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="quote-title"><div class="modal-head"><div><div class="eyebrow">Test form</div><h2 id="quote-title">Request a quote from ${esc(p.name)}</h2></div><button class="icon-btn" onclick="closeModal()" aria-label="Close">×</button></div><form id="customer-quote"><div class="form-grid"><div class="field"><label>Service</label><select required>${p.services.map(s=>`<option>${esc(s)}</option>`).join('')}</select></div><div class="field"><label>Preferred deadline</label><input type="date"></div><div class="field full"><label>Describe the garment and what you need</label><textarea required placeholder="Include fabric, fit, damage, or other useful details"></textarea></div><div class="field"><label>Your name</label><input required value="Prototype tester"></div><div class="field"><label>Email</label><input type="email" required value="tester@example.com"></div></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn">Preview request</button></div></form><p class="small muted">This test prototype does not send the request to a real business.</p></div></div>`;
  document.querySelector('#customer-quote').onsubmit=e=>{e.preventDefault();closeModal();toast('Request preview completed — nothing was sent');};
}
function closeModal(){ modalRoot.innerHTML=''; }

const providerNav = (active) => `<aside class="sidebar"><div class="studio-switcher"><strong>${esc(state.profile.studio)}</strong><span class="small muted">Seamstress workspace</span></div><nav class="workspace-nav" aria-label="Seamstress workspace">
  ${[['/','Overview'],['/requests','Requests'],['/profile','Profile'],['/services','Services & pricing'],['/availability','Availability'],['/jobs','Jobs']].map(([path,label])=>`<a class="${active===path?'active':''}" href="#/provider${path==='/'?'':path}">${label}</a>`).join('')}</nav></aside>`;

function providerShell(active, content){ main.innerHTML=`<div class="workspace">${providerNav(active)}<section class="workspace-main">${content}</section></div>`; }
function renderProvider(path){
  if(path.startsWith('/request/')) return renderRequest(path.split('/').pop());
  if(path==='/requests') return renderRequests();
  if(path==='/profile') return renderProfileEditor();
  if(path==='/services') return renderServices();
  if(path==='/availability') return renderAvailability();
  if(path==='/jobs') return renderJobs();
  renderOverview();
}

function renderOverview(){
  const newCount=state.requests.filter(r=>r.status==='new').length;
  providerShell('/',`<div class="workspace-title"><div><div class="eyebrow">Seamstress workspace</div><h1>Good morning, ${esc(state.profile.name)}</h1><p class="muted">Here is what needs your attention today.</p></div><a class="btn btn-secondary" href="#/seamstress/odette">View public profile</a></div>
  <div class="stats"><div class="card stat"><span class="muted small">New requests</span><strong>${newCount}</strong><span class="small">Needs review</span></div><div class="card stat"><span class="muted small">Quotes awaiting reply</span><strong>${state.requests.filter(r=>r.status==='quoted').length}</strong><span class="small">Customer decision</span></div><div class="card stat"><span class="muted small">Active jobs</span><strong>${state.requests.filter(r=>r.status==='accepted').length}</strong><span class="small">In progress</span></div><div class="card stat"><span class="muted small">Profile completeness</span><strong>86%</strong><span class="small">Add policies</span></div></div>
  <div class="dashboard-grid"><section class="card panel"><div class="panel-head"><h2>Recent requests</h2><a href="#/provider/requests" class="small">View all</a></div><div class="request-list">${state.requests.slice(0,3).map(requestItem).join('')}</div></section><aside class="card panel"><div class="panel-head"><h2>Setup checklist</h2></div><ul class="checklist"><li><span class="check">✓</span><div><strong>Profile details</strong><div class="small muted">Studio, bio, and location</div></div></li><li><span class="check">✓</span><div><strong>Services and prices</strong><div class="small muted">Three services published</div></div></li><li><span class="check">✓</span><div><strong>Availability</strong><div class="small muted">Wed–Sun enabled</div></div></li><li><span class="check">!</span><div><strong>Business policies</strong><div class="small muted">Add cancellation guidance</div></div></li></ul></aside></div>`);
}
function requestItem(r){ return `<button class="request-item" onclick="location.hash='#/provider/request/${r.id}'"><span class="mini-avatar">${r.initials}</span><span><strong>${esc(r.item)}</strong><span class="small muted">${esc(r.customer)} · ${esc(r.service)}</span></span><span class="status status-${r.status}">${statusLabel(r.status)}</span></button>`; }
function renderRequests(){ providerShell('/requests',`<div class="workspace-title"><div><div class="eyebrow">Inbox</div><h1>Customer requests</h1><p class="muted">Review each request before deciding what to do.</p></div><select class="filter-select" id="request-filter"><option>All statuses</option><option>New request</option><option>Quote sent</option><option>Accepted</option></select></div><section class="card panel"><div class="request-list">${state.requests.map(requestItem).join('')}</div></section>`); }

function renderRequest(id){
  const r=state.requests.find(x=>x.id===id)||state.requests[0];
  providerShell('/requests',`<div class="workspace-title"><div><a href="#/provider/requests" class="small muted">← All requests</a><h1>${esc(r.item)}</h1><p class="muted">Submitted by ${esc(r.customer)} · ${esc(r.submitted)}</p></div><span class="status status-${r.status}">${statusLabel(r.status)}</span></div><div class="detail-layout"><div><section class="card detail-section"><h2>Request details</h2><div class="info-grid"><div><span class="info-label">Service</span>${esc(r.service)}</div><div><span class="info-label">Preferred deadline</span>${esc(r.deadline)}</div><div><span class="info-label">Customer location</span>${esc(r.location)}</div><div><span class="info-label">Budget</span>${esc(r.budget)}</div></div><h3 style="margin-top:22px">Customer description</h3><p class="lead" style="font-size:16px">${esc(r.description)}</p></section><section class="card detail-section"><h2>Reference photo</h2>${r.photo?'<div class="image-placeholder">Customer garment photo placeholder</div>':'<div class="empty-note">No photo was provided</div>'}</section><section class="card detail-section"><h2>Activity</h2><ol class="timeline"><li><strong>Request received</strong><div class="small muted">${esc(r.submitted)}</div></li>${r.quote?`<li><strong>Quote sent · ${esc(r.quote)}</strong><div class="small muted">Prototype activity</div></li>`:''}</ol></section></div><aside><div class="card panel action-stack"><h3>Choose a next step</h3><button class="btn" onclick="openQuote('${r.id}')">${r.status==='quoted'?'Edit quote':'Send a quote'}</button><button class="btn btn-secondary" onclick="requestInfo('${r.id}')">Request more information</button><button class="btn btn-secondary" onclick="acceptRequest('${r.id}')">Accept without quote</button><button class="btn btn-danger" onclick="declineRequest('${r.id}')">Decline request</button><p class="small muted">Actions update this browser only. No customer is contacted.</p></div></aside></div>`);
}

function openQuote(id){ const r=state.requests.find(x=>x.id===id); modalRoot.innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="send-quote-title"><div class="modal-head"><div><div class="eyebrow">Test action</div><h2 id="send-quote-title">Quote ${esc(r.customer)}</h2></div><button class="icon-btn" onclick="closeModal()" aria-label="Close">×</button></div><form id="quote-form"><div class="form-grid"><div class="field"><label>Estimated price</label><input id="quote-price" type="number" min="0" required value="${r.quote?esc(r.quote.replace(/\D/g,'')):'85'}"></div><div class="field"><label>Estimated turnaround</label><select><option>2–3 days</option><option>1 week</option><option>1–2 weeks</option><option>Requires fitting first</option></select></div><div class="field full"><label>Message to customer</label><textarea>Thanks for the details. This estimate may change after I inspect the garment in person.</textarea></div><div class="field full"><label><input type="checkbox" style="width:auto"> A fitting is required before the price is final</label></div></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn">Save test quote</button></div></form><p class="small muted">Nothing is sent outside this prototype.</p></div></div>`; document.querySelector('#quote-form').onsubmit=e=>{e.preventDefault();r.quote=money(document.querySelector('#quote-price').value);r.status='quoted';persist();closeModal();toast('Test quote saved locally');location.hash=`#/provider/request/${r.id}`;route();}; }
function requestInfo(id){ toast('Test message drafted — nothing was sent'); }
function acceptRequest(id){ const r=state.requests.find(x=>x.id===id);r.status='accepted';persist();toast('Request marked accepted locally');renderRequest(id); }
function declineRequest(id){ const r=state.requests.find(x=>x.id===id);r.status='declined';persist();toast('Request marked declined locally');location.hash='#/provider/requests';route(); }

function renderProfileEditor(){ const p=state.profile; providerShell('/profile',`<div class="workspace-title"><div><div class="eyebrow">Public presence</div><h1>Edit profile</h1><p class="muted">Control what customers see before they contact you.</p></div><a href="#/seamstress/odette" class="btn btn-secondary">Preview profile</a></div><form id="profile-form" class="card form-card"><div class="form-grid"><div class="field"><label for="owner-name">Display name</label><input id="owner-name" value="${esc(p.name)}" required></div><div class="field"><label for="studio-name">Studio name</label><input id="studio-name" value="${esc(p.studio)}" required></div><div class="field full"><label for="location">Location</label><input id="location" value="${esc(p.location)}"></div><div class="field full"><label for="bio">About your work</label><textarea id="bio">${esc(p.bio)}</textarea></div><div class="field"><label for="experience">Years of experience</label><input id="experience" type="number" min="0" value="${esc(p.experience)}"></div><div class="field"><label for="response">Typical response time</label><select id="response">${['Same day','Within 24 hours','Within 2 days','Within a week'].map(x=>`<option ${x===p.response?'selected':''}>${x}</option>`).join('')}</select></div><div class="field full"><div class="toggle-row"><div><strong>Profile visible to customers</strong><div class="small muted">Turn this off to hide the profile from search</div></div><button type="button" id="visibility-toggle" class="switch ${p.visible?'on':''}" aria-pressed="${p.visible}" aria-label="Profile visibility"></button></div></div></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="renderProfileEditor()">Discard changes</button><button class="btn">Save profile</button></div><p class="small muted">Saved only in this browser for testing.</p></form>`);
  document.querySelector('#visibility-toggle').onclick=e=>{p.visible=!p.visible;e.currentTarget.classList.toggle('on',p.visible);e.currentTarget.setAttribute('aria-pressed',p.visible);};
  document.querySelector('#profile-form').onsubmit=e=>{e.preventDefault();state.profile={...p,name:document.querySelector('#owner-name').value,studio:document.querySelector('#studio-name').value,location:document.querySelector('#location').value,bio:document.querySelector('#bio').value,experience:document.querySelector('#experience').value,response:document.querySelector('#response').value};persist();toast('Profile changes saved locally');renderProfileEditor();};
}

function renderServices(){ providerShell('/services',`<div class="workspace-title"><div><div class="eyebrow">Offerings</div><h1>Services & starting prices</h1><p class="muted">Starting prices set customer expectations; final quotes may vary.</p></div><button class="btn" onclick="toast('New service row added in prototype')">Add service</button></div><section class="card form-card"><div class="service-row"><div><strong>Wedding dress alterations</strong><div class="small muted">Fittings required</div></div><div><input aria-label="Wedding dress starting price" style="width:110px" value="$85"></div></div><div class="service-row"><div><strong>Bridal hemming</strong><div class="small muted">Original hem when possible</div></div><div><input aria-label="Bridal hemming starting price" style="width:110px" value="$45"></div></div><div class="service-row"><div><strong>Custom garment</strong><div class="small muted">Consultation required</div></div><div><input aria-label="Custom garment starting price" style="width:110px" value="$200"></div></div><div class="form-actions"><button class="btn" onclick="event.preventDefault();toast('Service prices saved locally')">Save prices</button></div></section>`); }

function renderAvailability(){ providerShell('/availability',`<div class="workspace-title"><div><div class="eyebrow">Schedule</div><h1>Availability</h1><p class="muted">Choose days when customers can request fittings or drop-offs.</p></div></div><section class="card form-card"><h2>Weekly availability</h2>${Object.entries(state.availability).map(([d,on])=>`<div class="toggle-row"><div><strong>${d}</strong><div class="small muted">${on?'11:00 AM–7:00 PM':'Not available'}</div></div><button class="switch ${on?'on':''}" aria-pressed="${on}" aria-label="Toggle ${d}" onclick="toggleDay('${d}')"></button></div>`).join('')}<p class="small muted">This prototype does not publish live appointment slots.</p></section>`); }
function toggleDay(day){state.availability[day]=!state.availability[day];persist();renderAvailability();toast(`${day} availability updated locally`);}

function renderJobs(){ const jobs=state.requests.filter(r=>r.status==='accepted'); providerShell('/jobs',`<div class="workspace-title"><div><div class="eyebrow">Work in progress</div><h1>Jobs</h1><p class="muted">Track accepted work from fitting to pickup.</p></div></div><section class="card panel">${jobs.length?`<table class="jobs-table"><thead><tr><th>Customer</th><th>Item</th><th>Deadline</th><th>Status</th><th></th></tr></thead><tbody>${jobs.map(r=>`<tr><td>${esc(r.customer)}</td><td>${esc(r.item)}</td><td>${esc(r.deadline)}</td><td><span class="status status-accepted">In progress</span></td><td><button class="btn btn-secondary btn-small" onclick="toast('Job status updated locally')">Update</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty-note">Accepted requests will appear here.</div>'}</section>`); }

window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',route);
