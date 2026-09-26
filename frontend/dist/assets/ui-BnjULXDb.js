let n=null;function r(){return n||(n=document.createElement("div"),n.className="toast-host",document.body.appendChild(n),n)}function u(o,i=2200){if(!o)return;const t=document.createElement("div");t.className="toast-item",t.textContent=o,r().appendChild(t),setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity .25s",setTimeout(()=>t.remove(),260)},i)}function m({title:o="提示",body:i="",okText:t="确定",cancelText:c="取消",danger:l=!1}={}){return new Promise(d=>{const e=document.createElement("div");e.className="dialog-mask",e.innerHTML=`
      <div class="dialog">
        <div class="dialog-title">${o}</div>
        ${i?`<div class="dialog-body">${i}</div>`:""}
        <div class="dialog-actions">
          <button class="btn btn-outline cancel-btn">${c}</button>
          <button class="btn ${l?"btn-danger":"btn-primary"} ok-btn">${t}</button>
        </div>
      </div>`,document.body.appendChild(e);const a=s=>{e.remove(),d(s)};e.querySelector(".cancel-btn").onclick=()=>a(!1),e.querySelector(".ok-btn").onclick=()=>a(!0),e.addEventListener("click",s=>{s.target===e&&a(!1)})})}export{m as confirmDialog,u as toast};
