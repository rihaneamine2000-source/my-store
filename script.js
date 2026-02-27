// الروابط الخاصة بك
const csvURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBHhkKDmlaHCIVPN5jM4Va7ybGVVSauPBp2nIJ4XrH977e7e3rVCpEjlqzbNRgF4tl6KK8PfW1_Bsy/pub?output=csv';
const scriptURL = 'https://script.google.com/macros/s/AKfycbzgYjd7fNJaHgg-rbptutMStoozrjeHTqTRu5AZpxMIHgjNIGv7BgjcurnypOm8aqlyTA/exec';
// وظيفة جلب المنتجات
async function loadProducts() {
    try {
        const response = await fetch(csvURL + "&t=" + new Date().getTime());
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "");
        const grid = document.getElementById('products-grid');
        grid.innerHTML = ''; 

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].includes(';') ? rows[i].split(';') : rows[i].split(',');
            
            if (cols.length >= 3) {
                const id = cols[0]?.replace(/"/g, "").trim();    
                const name = cols[1]?.replace(/"/g, "").trim();  
                const priceN = cols[2]?.replace(/"/g, "").trim(); 
                const priceO = cols[3]?.replace(/"/g, "").trim();
                const imgUrl = cols[4]?.replace(/"/g, "").trim() || "https://via.placeholder.com/220x220?text=No+Image";

                if (name) {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img src="${imgUrl}" class="product-img" alt="${name}" onerror="this.src='https://via.placeholder.com/220x220?text=Error+Loading'">
                        <div class="product-badge">ID: #${id}</div>
                        <h3>${name}</h3>
                        <div class="price-box">
                            <span class="new-price">${priceN} دج</span>
                            ${priceO ? `<span class="old-price">${priceO} دج</span>` : ""}
                        </div>
                        <button class="order-btn" onclick="openForm('${id}', '${name}')">اطلب الآن</button>
                    `;
                    grid.appendChild(card);
                }
            }
        }
    } catch (e) {
        console.error("خطأ:", e);
        document.getElementById('products-grid').innerHTML = "فشل تحميل المنتجات.";
    }
}

loadProducts();

// وظائف المودال
function openForm(id, name) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('p_id').value = id;
    document.getElementById('p_name').value = name;
    document.body.style.overflow = 'hidden';
}

function closeForm() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeSuccess() {
    document.getElementById('successOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// إرسال الطلب (تم التعديل ليتناسب مع HTML الخاص بك)
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerText = "جاري إرسال طلبك...";

    // FormData تأخذ البيانات مباشرة من أسماء (name) الحقول في HTML
    const formData = new FormData(this);

    fetch(scriptURL, { 
        method: 'POST', 
        body: formData,
        mode: 'no-cors' 
    })
    .then(() => {
        // بما أن الإرسال تم، نغلق النافذة ونظهر رسالة النجاح
        const pName = document.getElementById('p_name').value;
        closeForm();
        document.getElementById('orderSummary').innerHTML = `شكرًا لك! تم تسجيل طلبك لـ (<strong>${pName}</strong>). سنتواصل معك قريباً.`;
        document.getElementById('successOverlay').style.display = 'block';
        
        btn.disabled = false;
        btn.innerText = "تأكيد الشراء الآن";
        this.reset();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("حدث خطأ. يرجى المحاولة مرة أخرى.");
        btn.disabled = false;
        btn.innerText = "تأكيد الشراء الآن";
    });
});