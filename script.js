const music=document.querySelector("#music"),sound=document.querySelector("#sound");
sound.onclick=async()=>{if(music.paused){try{await music.play();sound.textContent="♬"}catch(e){}}else{music.pause();sound.textContent="♫"}};
let count=1;document.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{count=Math.max(1,Math.min(10,count+Number(b.dataset.n)));document.querySelector("#count").value=count;document.querySelector("#guests").value=count});
const form=document.querySelector("#form"),status=document.querySelector("#status");
form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));const all=JSON.parse(localStorage.getItem("wedding_rsvp")||"[]");all.push({...d,date:new Date().toISOString()});localStorage.setItem("wedding_rsvp",JSON.stringify(all));status.textContent="Рақмет! Жауабыңыз сақталды.";form.reset();count=1;document.querySelector("#count").value=1;document.querySelector("#guests").value=1};
