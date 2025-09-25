/* product.js - CRUD produk + lightbox + notifikasi */

const btnAdd = document.getElementById("btnAdd");
const modal = document.getElementById("modalForm");
const btnCancel = document.getElementById("btnCancel");
const btnSave = document.getElementById("btnSave");
const notif = document.getElementById("notif");

const formName = document.getElementById("formName");
const formPrice = document.getElementById("formPrice");
const formStock = document.getElementById("formStock");
const formDesc = document.getElementById("formDesc");
const formFile = document.getElementById("formFile");
const uploadArea = document.getElementById("uploadArea");
const previewImgs = document.getElementById("previewImgs");

let tempImages = [];
let editIndex = null;
const MAX_IMAGES = 5;

/* ================== MODAL ================== */
btnAdd.onclick = () => openModal();
btnCancel.onclick = () => closeModal();

function openModal(edit=false, index=null){
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  if(edit){
    const products = getProducts();
    const p = products[index];
    formName.value = p.name;
    formPrice.value = p.price;
    formStock.value = p.stock;
    formDesc.value = p.desc || "";
    tempImages = p.images || [];
    editIndex = index;
    document.getElementById("modalTitle").textContent = "Edit Produk";
  } else {
    formName.value="";
    formPrice.value="";
    formStock.value="";
    formDesc.value="";
    tempImages=[];
    editIndex=null;
    document.getElementById("modalTitle").textContent = "Tambah Produk";
  }
  renderPreviews();
}

function closeModal(){
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

/* ================== LOCAL STORAGE ================== */
function getProducts(){
  return JSON.parse(localStorage.getItem("products")||"[]");
}
function saveProducts(arr){
  localStorage.setItem("products",JSON.stringify(arr));
}

/* ================== SIMPAN PRODUK ================== */
btnSave.onclick=()=>{
  const name=formName.value.trim();
  const price=parseInt(formPrice.value);
  const stock=parseInt(formStock.value);
  const desc=formDesc.value.trim();

  if(!name||isNaN(price)||isNaN(stock)){
    alert("Lengkapi semua data!");
    return;
  }

  let products=getProducts();
  const data={name,price,stock,desc,images:tempImages};

  let msg="";
  if(editIndex!==null){
    products[editIndex]=data;
    msg="Produk berhasil diperbarui!";
  } else {
    products.push(data);
    msg="Produk berhasil ditambahkan!";
  }
  saveProducts(products);
  loadProducts();
  closeModal();
  showNotif(msg);
};

/* ================== PREVIEW GAMBAR ================== */
function renderPreviews(){
  previewImgs.innerHTML="";
  tempImages.forEach((src,idx)=>{
    const div=document.createElement("div");
    div.className="preview-box";
    div.innerHTML=`<img src="${src}" alt="">
      <button type="button" class="remove">✕</button>`;
    div.querySelector(".remove").onclick=()=>{
      tempImages.splice(idx,1);
      renderPreviews();
    };
    previewImgs.appendChild(div);
  });
}

/* handle upload & drag-drop */
uploadArea.onclick=()=>formFile.click();

formFile.addEventListener("change",()=>{
  handleFiles(formFile.files);
  formFile.value="";
});
uploadArea.addEventListener("dragover",e=>{
  e.preventDefault();
  uploadArea.classList.add("dragover");
});
uploadArea.addEventListener("dragleave",()=>uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop",e=>{
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files){
  const remaining=MAX_IMAGES-tempImages.length;
  if(remaining<=0){
    alert("Maksimal 5 gambar per produk!");
    return;
  }
  [...files].slice(0,remaining).forEach(file=>addImage(file));
}

function addImage(file){
  const reader=new FileReader();
  reader.onload=e=>{
    tempImages.push(e.target.result);
    renderPreviews();
  };
  reader.readAsDataURL(file);
}

/* ================== RENDER GRID ================== */
function loadProducts(){
  const grid=document.getElementById("productGrid");
  grid.innerHTML="";
  const products=getProducts();
  products.forEach((p,i)=>{
    const card=document.createElement("div");
    card.className="product-card";
    card.innerHTML=`
      <div class="p-stock">Stok ${p.stock}</div>
      <img src="${p.images && p.images[0] ? p.images[0] : 'no-image.jpg'}" alt="">
      <div class="p-name">${p.name}</div>
      <div class="p-price">Rp ${p.price.toLocaleString()}</div>
      <div class="p-actions">
        <button class="btn-small edit">✎</button>
        <button class="btn-small delete">🗑</button>
      </div>
    `;
    // Klik card → buka lightbox
    card.querySelector("img").addEventListener("click",()=>openLightbox(i,0));
    // Edit
    card.querySelector(".edit").onclick=(e)=>{
      e.stopPropagation();
      openModal(true,i);
    };
    // Delete
    card.querySelector(".delete").onclick=(e)=>{
      e.stopPropagation();
      if(confirm("Hapus produk ini?")){
        products.splice(i,1);
        saveProducts(products);
        loadProducts();
        showNotif("Produk dihapus!");
      }
    };
    grid.appendChild(card);
  });
}
loadProducts();

/* ================== LIGHTBOX ================== */
const lb=document.getElementById("lightbox");
const lbImg=document.getElementById("lbImg");
const lbName=document.getElementById("lbName");
const lbDesc=document.getElementById("lbDesc");
const lbClose=document.getElementById("lbClose");
const lbPrev=document.getElementById("lbPrev");
const lbNext=document.getElementById("lbNext");

let lbIndex=0, lbImgIndex=0, lbProducts=[];

function openLightbox(pIndex,imgIndex){
  lbProducts=getProducts();
  lbIndex=pIndex;
  lbImgIndex=imgIndex;
  updateLightbox();
  lb.classList.add("show");
  document.body.style.overflow="hidden";
}
function updateLightbox(){
  const p=lbProducts[lbIndex];
  lbImg.src=p.images[lbImgIndex] || "no-image.jpg";
  lbName.textContent=p.name+" (Stok "+p.stock+")";
  lbDesc.textContent=p.desc || "";
}
function closeLightbox(){
  lb.classList.remove("show");
  document.body.style.overflow="";
}
function prevImg(){
  const imgs=lbProducts[lbIndex].images;
  lbImgIndex=(lbImgIndex-1+imgs.length)%imgs.length;
  updateLightbox();
}
function nextImg(){
  const imgs=lbProducts[lbIndex].images;
  lbImgIndex=(lbImgIndex+1)%imgs.length;
  updateLightbox();
}

lbClose.onclick=closeLightbox;
lbPrev.onclick=prevImg;
lbNext.onclick=nextImg;

/* klik luar gambar menutup */
lb.addEventListener("click",e=>{
  if(e.target===lb) closeLightbox();
});

/* keyboard nav */
document.addEventListener("keydown",e=>{
  if(!lb.classList.contains("show")) return;
  if(e.key==="Escape") closeLightbox();
  if(e.key==="ArrowLeft") prevImg();
  if(e.key==="ArrowRight") nextImg();
});

/* ================== NOTIFIKASI ================== */
function showNotif(msg){
  notif.textContent=msg;
  notif.classList.add("show");
  setTimeout(()=>notif.classList.remove("show"),1500);
}
