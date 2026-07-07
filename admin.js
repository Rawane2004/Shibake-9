/* ===== Demo data (frontend only) ===== */
let products = [];
let orders = [];



const statusMap = {

new:{
label:"جديد",
cls:"new"
},

preparing:{
label:"قيد التجهيز",
cls:"preparing"
},

ready:{
label:"جاهز للاستلام",
cls:"ready"
},

done:{
label:"تم التسليم",
cls:"done"
}

};

/* ===== Navigation ===== */
const titles = {home:"الرئيسية",products:"المنتجات",orders:"الطلبات",settings:"الإعدادات"};
document.querySelectorAll(".nav-item[data-page]").forEach(el=>{
  el.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
    el.classList.add("active");
    const page = el.dataset.page;
    document.querySelectorAll(".page").forEach(p=>p.hidden=true);
    document.getElementById("page-"+page).hidden=false;
    document.getElementById("page-title").textContent = titles[page];
    document.getElementById("sidebar").classList.remove("open");
  });
});

/* ===== Render ===== */



async function renderProducts(){

 const snapshot = await firebase
  .firestore()
  .collection("products")
  .get();

products = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

 

  const grid = document.getElementById("products-grid");

 grid.innerHTML = products.map(p=>`
<div class="product-card">

    <div class="product-placeholder">

<i class="${
p.category=="برجر"   ? "fa-solid fa-burger" :
p.category=="سلطات"  ? "fa-solid fa-bowl-food" :
p.category=="فرايز"  ? "fa-solid fa-bacon" :
p.category=="فلافل"  ? "fa-solid fa-cookie" :
p.category=="الفطور" ? "fa-solid fa-egg" :
p.category=="إضافات" ? "fa-solid fa-cheese" :
"fa-solid fa-utensils"
}"></i>

</div>

    <div class="body">
        <span class="cat">${p.category}</span>

        <h3>${p.name}</h3>

<p class="product-description">
    ${p.description || ""}
</p>

<span class="price">${p.price} ر.س</span>

<div class="product-status">

    <button
        class="btn ${p.available ? 'success' : 'warning'}"
        onclick="toggleAvailability('${p.id}', ${p.available})">

        ${p.available ? " متوفر" : "غير متوفر"}

    </button>

</div>

<div class="product-actions">

    <button class="icon-btn edit" onclick="editProduct('${p.id}')">
    <i class="fa-solid fa-pen"></i>
</button>

<button class="icon-btn delete" onclick="deleteProduct('${p.id}')">
    <i class="fa-solid fa-trash"></i>
</button>

</div>

    </div>

</div>
`).join("");

 }
function statusDropdown(order){

return `

<div class="status-dropdown">

<div
class="status-selected ${order.status}"
onclick="toggleDropdown(this)">

${statusMap[order.status].label}

<i class="fa-solid fa-chevron-down"></i>

</div>

<div class="status-options">

<div onclick="setOrderStatus('${order.id}','new')">
 جديد
</div>

<div onclick="setOrderStatus('${order.id}','preparing')">
قيد التحضير
</div>

<div onclick="setOrderStatus('${order.id}','done')">
تم التسليم
</div>

</div>

</div>

`;

}


firebase.firestore()
.collection("orders")
.orderBy("createdAt","desc")
.onSnapshot((snapshot)=>{

    orders = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));

    const tbody = document.getElementById("orders-body");
    const recent = document.getElementById("recent-orders");

    const html = orders.map(o=>`

<tr>

<td>#${o.id.substring(0,5)}</td>

<td>${o.customer || "عميل"}</td>

<td>
${(o.items || []).map(i=>`${i.name} × ${i.qty}`).join("<br>")}
</td>

<td>${o.total} ر.س</td>

<td>
${statusDropdown(o)}
</td>

<td>
<button
class="btn sm danger"
onclick="deleteOrder('${o.id}')">
إلغاء الطلب
</button>
</td>

</tr>

`).join("");

    tbody.innerHTML = html;
    recent.innerHTML = html;
    renderStats();

});

   

 



 function toggleDropdown(el){

    document.querySelectorAll(".status-dropdown").forEach(d=>{

        if(d !== el.parentElement){
            d.classList.remove("open");
        }

    });

    el.parentElement.classList.toggle("open");

}

async function setOrderStatus(id,status){

    try{

        await firebase.firestore()
        .collection("orders")
        .doc(id)
        .update({

            status:status,

            updatedAt:firebase.firestore.FieldValue.serverTimestamp()

        });

        
        renderStats();

    }catch(error){

        console.log(error);

    }

}


/* ===== Product modal ===== */
const modal = document.getElementById("product-modal");
function openProductModal(){
  document.getElementById("modal-title").textContent="إضافة منتج";
  document.getElementById("product-form").reset();
  document.getElementById("p-description").value = "";
  document.getElementById("p-id").value="";
  modal.classList.add("open");
}
function closeProductModal(){ modal.classList.remove("open"); }
modal.addEventListener("click",e=>{ if(e.target===modal) closeProductModal(); });

function editProduct(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  document.getElementById("modal-title").textContent="تعديل منتج";
  document.getElementById("p-id").value=p.id;
  document.getElementById("p-name").value=p.name;
  document.getElementById("p-price").value=p.price;
document.getElementById("p-cat").value = p.category; 
document.getElementById("p-description").value = p.description || "";
 modal.classList.add("open");
}
async function deleteProduct(id){

    if(!confirm("هل أنت متأكد من حذف المنتج؟")) return;

    try{

        await firebase.firestore()
            .collection("products")
            .doc(id)
            .delete();

        await renderProducts();
        await renderStats();

        alert("تم حذف المنتج بنجاح");

    }catch(error){

        console.error(error);

        alert("فشل حذف المنتج");

    }

}

async function toggleAvailability(id, currentStatus){

    try{

        await firebase.firestore()
            .collection("products")
            .doc(id)
            .update({

                available: !currentStatus,

                updatedAt: firebase.firestore.FieldValue.serverTimestamp()

            });

        await renderProducts();

    }catch(error){

        console.log(error);

        alert("تعذر تغيير الحالة");

    }

}





async function deleteOrder(id){

    if(!confirm("هل تريد إلغاء هذا الطلب؟")) return;

    try{

        await firebase.firestore()
        .collection("orders")
        .doc(id)
        .delete();

        
        await renderStats();

        alert("تم إلغاء الطلب");

    }catch(error){

        console.log(error);

        alert("تعذر حذف الطلب");

    }

}


document.getElementById("product-form").addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = document.getElementById("p-id").value;

    const product = {

        name: document.getElementById("p-name").value.trim(),

        price: Number(document.getElementById("p-price").value),

        category: document.getElementById("p-cat").value,

        description: document.getElementById("p-description").value.trim(),


        available: true,

        order: 0,

        updatedAt: firebase.firestore.FieldValue.serverTimestamp()

    };

    try{

        if(id){

            await firebase.firestore()
                .collection("products")
                .doc(id)
                .update(product);

            alert("تم تعديل المنتج");

        }else{

            product.createdAt = firebase.firestore.FieldValue.serverTimestamp();

            await firebase.firestore()
                .collection("products")
                .add(product);

            alert("تم إضافة المنتج");

        }

        closeProductModal();

        await renderProducts();

        await renderStats();

    }catch(error){

        console.error(error);

        alert("حدث خطأ");

    }

});




async function renderStats() {

    const productsSnapshot = await firebase.firestore()
        .collection("products")
        .get();

    document.getElementById("stat-products").textContent =
        productsSnapshot.size;

    const ordersSnapshot = await firebase.firestore()
        .collection("orders")
        .get();

    document.getElementById("stat-orders").textContent =
        ordersSnapshot.size;

    let revenue = 0;

    ordersSnapshot.forEach(doc=>{

        const order = doc.data();

        if(order.status == "done"){

            revenue += order.total || 0;

        }

    });

    document.getElementById("stat-revenue").textContent = revenue;

}



/* ===== Init ===== */
async function init(){

    await renderProducts();

    

    await renderStats();

}

window.onclick = function(e){

    if(!e.target.closest(".status-dropdown")){

        document.querySelectorAll(".status-dropdown").forEach(d=>{

            d.classList.remove("open");

        });

    }

}

init();

