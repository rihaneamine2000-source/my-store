const csvURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBHhkKDmlaHCIVPN5jM4Va7ybGVVSauPBp2nIJ4XrH977e7e3rVCpEjlqzbNRgF4tl6KK8PfW1_Bsy/pub?output=csv';
const scriptURL = 'https://script.google.com/macros/s/AKfycbw8RJtznp3SxIBxPLLbFq2xlMVOAac2WxSfWhH9a-Lp9E2w5ZwOTaXSj-ZUatms3bac5g/exec';

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
                const imgUrl = cols[4]?.replace(/"/g, "").trim() || "https://via.placeholder.com/200";

                if (name) {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img src="${imgUrl}" class="product-img" onclick="window.location.href='product.html?id=${id}'">
                        <h3>${name}</h3>
                        <div class="price-box">
                            <span class="new-price">${priceN} دج</span>
                            ${priceO ? `<span class="old-price">${priceO} دج</span>` : ""}
                        </div>
                        <div class="btn-group">
                            <button class="order-btn" onclick="openForm('${id}', '${name}')">اطلب الآن</button>
                            <a href="product.html?id=${id}" class="details-btn">عرض التفاصيل</a>
                        </div>
                    `;
                    grid.appendChild(card);
                }
            }
        }
    } catch (e) {
        document.getElementById('products-grid').innerHTML = "خطأ في تحميل البيانات.";
    }
}

function openForm(id, name) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('p_id').value = id;
    document.getElementById('p_name').value = name;
}

function closeForm() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// تشغيل الوظيفة
loadProducts();

// إرسال الطلب (POST)
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "جاري الإرسال...";
    btn.disabled = true;

    fetch(scriptURL, { method: 'POST', body: new FormData(this), mode: 'no-cors' })
    .then(() => {
        alert("تم استلام طلبك!");
        closeForm();
        btn.innerText = "تأكيد الشراء";
        btn.disabled = false;
        this.reset();
    })
    .catch(() => {
        alert("حدث خطأ!");
        btn.disabled = false;
    });
});