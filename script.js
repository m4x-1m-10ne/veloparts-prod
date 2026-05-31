window.addEventListener('scroll', function() {
    let btn = document.getElementById('scrollTopBtn');
    if (btn) {
        if (window.scrollY > 300) btn.classList.add('show');
        else btn.classList.remove('show');
    }
});

(function() {
    const products = [
        { id: 1, name: "Цепь Shimano HG40", price: 500, category: "Цепи", img: "./img/products/Shimano_HG40.png" },
        { id: 2, name: "Кассета Sunrace M88", price: 1500, category: "Кассеты", img: "./img/products/Sunrace_M88.png" },
        { id: 3, name: "Колодки Avid SD7", price: 350, category: "Тормоза", img: "./img/products/Avid_SD7.png" },
        { id: 4, name: "Shimano Tourney RD", price: 800, category: "Переключатели", img: "./img/products/Shimano_Tourney_RD.png" },
        { id: 5, name: "Цепь KMC X8", price: 650, category: "Цепи", img: "./img/products/KMC_X8.png" },
        { id: 6, name: "Кассета Shimano CS-HG41", price: 1800, category: "Кассеты", img: "./img/products/Shimano_CS-HG41.png" },
        { id: 7, name: "Колодки Shimano B01S", price: 400, category: "Тормоза", img: "./img/products/Shimano_B01S.png" },
        { id: 8, name: "Shimano Altus RD-M310", price: 1200, category: "Переключатели", img: "./img/products/Shimano_Altus_RD-M310.png" },
        { id: 9, name: "Руль Ritchey Comp", price: 1500, category: "Рули", img: "./img/products/Ritchey_Comp.png" },
        { id: 10, name: "Седло Selle Royal", price: 2000, category: "Сёдла", img: "./img/products/Selle_Royal.png" },
        { id: 11, name: "Покрышка Schwalbe", price: 1200, category: "Покрышки", img: "./img/products/Schwalbe.png" },
        { id: 12, name: "Камера CST 26''", price: 300, category: "Камеры", img: "./img/products/CST_26''.png" },
        { id: 13, name: "Смазка Muc-Off", price: 500, category: "Смазки", img: "./img/products/Muc-Off.png" },
        { id: 14, name: "Насос Topeak", price: 800, category: "Насосы", img: "./img/products/Topeak.png" },
        { id: 15, name: "Переключатель передний Tourney", price: 600, category: "Переключатели", img: "./img/products/Tourney.png" }
    ];

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let currentCategory = '';
    let productsGridElement = null;
    let filterChipsElement = null;

    function showNotify(msg, isError = false) {
        let div = document.createElement('div');
        div.className = 'toast-notify' + (isError ? ' error' : '');
        div.innerHTML = `<i class="bi ${isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2" style="color:${isError ? '#dc2626' : '#e67e22'};"></i> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function validateEmail(email) {
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        let digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 12;
    }

    function validateNamePart(name) {
        return /^[а-яА-ЯёЁa-zA-Z-]{2,30}$/.test(name);
    }

    function validateFullName(name) {
        let parts = name.trim().split(/\s+/);
        if (parts.length < 2 || parts.length > 3) return false;
        return parts.every(part => validateNamePart(part));
    }

    function validateAddress(address) {
        return /^[а-яА-ЯёЁa-zA-Z0-9\s\.,\-/]{5,150}$/.test(address.trim());
    }

    function validateZipCode(zip) {
        if (!zip) return true;
        return /^\d{6}$/.test(zip.trim());
    }

    function validateComment(comment) {
        if (!comment) return true;
        return comment.trim().length <= 500;
    }

    function validateDeliveryDate(date) {
        if (!date) return true;
        let selected = new Date(date);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
    }

    function validateDeliveryTime(time) {
        if (!time) return true;
        let validTimes = ["10:00-14:00", "14:00-18:00", "18:00-22:00"];
        return validTimes.includes(time);
    }

    function validatePasswordStrength(password) {
        let minLength = 6;
        let hasUpperCase = /[A-ZА-Я]/.test(password);
        let hasLowerCase = /[a-zа-я]/.test(password);
        let hasNumbers = /\d/.test(password);
        let hasSpecial = /[!@#$%^&*(),?":{}|<>]/.test(password);
        let isValidLength = password.length >= minLength;
        let strength = 0;
        if (isValidLength) strength++;
        if (hasUpperCase && hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecial) strength++;
        let weakPatterns = [
            /^[a-zа-я]+\.[0-9]+$/i, /^[a-zа-я]+[0-9]+$/i, /^[0-9]+[a-zа-я]+$/i,
            /^password\d*$/i, /^qwerty\d*$/i, /^admin\d*$/i, /^user\d*$/i,
            /^12345+$/, /^qwerty+$/i, /^abcdef+$/i, /^[a-zа-я]{3,}\d{3,}$/i
        ];
        let isWeakPattern = weakPatterns.some(pattern => pattern.test(password));
        if (isWeakPattern && strength >= 2) strength = 1;
        return {
            isValid: strength >= 2 && isValidLength && !isWeakPattern,
            strength: strength,
            message: strength >= 3 ? 'Надёжный' : (strength === 2 ? 'Средний' : 'Слабый')
        };
    }

    function onlyNumbers(input) {
        input.value = input.value.replace(/[^0-9]/g, '');
    }

    function onlyLetters(input) {
        input.value = input.value.replace(/[^а-яА-ЯёЁa-zA-Z\s-]/g, '');
    }

    function formatPhone(input) {
        let cleaned = input.value.replace(/\D/g, '');
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
        let formatted = '';
        if (cleaned.length > 0) {
            if (cleaned[0] === '7' || cleaned[0] === '8') {
                formatted = '+' + cleaned[0] + ' ';
                let rest = cleaned.slice(1);
                if (rest.length > 0) formatted += '(' + rest.slice(0, 3);
                if (rest.length > 3) formatted += ') ' + rest.slice(3, 6);
                if (rest.length > 6) formatted += '-' + rest.slice(6, 8);
                if (rest.length > 8) formatted += '-' + rest.slice(8, 10);
            } else {
                formatted = cleaned;
            }
        }
        input.value = formatted;
    }

    function getCartKey() {
        return currentUser ? `cart_${currentUser.email}` : null;
    }

    function loadCart() {
        let key = getCartKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function saveCart(cart) {
        let key = getCartKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(cart));
            updateCartCount();
        }
    }

    function updateCartCount() {
        let cart = loadCart();
        let total = cart.reduce((s, i) => s + i.quantity, 0);
        let span = document.getElementById('cartCount');
        if (span) span.innerText = total;
        let mobileSpan = document.getElementById('mobileCartCount');
        if (mobileSpan) mobileSpan.innerText = total;
    }

    function addToCart(productId) {
        if (!currentUser) {
            showNotify('Необходимо войти в профиль', true);
            showPage('profile');
            return;
        }
        let cart = loadCart();
        let existing = cart.find(i => i.id === productId);
        if (existing) existing.quantity++;
        else cart.push({ id: productId, quantity: 1 });
        saveCart(cart);
        showNotify('Товар добавлен в корзину');
    }

    function updateQuantity(id, qty) {
        let val = parseInt(qty) || 1;
        let cart = loadCart();
        let item = cart.find(i => i.id === id);
        if (item) item.quantity = val;
        saveCart(cart);
        renderCartPage();
    }

    function removeFromCart(id) {
        let cart = loadCart();
        cart = cart.filter(i => i.id !== id);
        saveCart(cart);
        renderCartPage();
        showNotify('Товар удалён');
    }

    function clearCart() {
        saveCart([]);
        renderCartPage();
        showNotify('Корзина очищена');
    }

    function proceedToCheckout() {
        if (!currentUser) {
            showNotify('Войдите в профиль', true);
            showPage('profile');
            return;
        }
        let cart = loadCart();
        if (cart.length === 0) {
            showNotify('Корзина пуста', true);
            return;
        }
        showPage('checkout');
    }

    function updateProductsDisplay() {
        if (!productsGridElement) return;
        let searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
        let filtered = products.filter(p => p.name.toLowerCase().includes(searchValue));
        if (currentCategory) filtered = filtered.filter(p => p.category === currentCategory);
        if (filtered.length === 0) {
            productsGridElement.innerHTML = '<div class="empty-state"><i class="bi bi-search" style="font-size:2rem; display:block; margin-bottom:16px;"></i>Товары не найдены</div>';
            return;
        }
        if (!currentUser) {
            productsGridElement.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <div class="product-image"><img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/600x600/f4f6f9/e67e22?text=${encodeURIComponent(p.name)}'"></div>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">${p.price.toLocaleString()} ₽</div>
                        <button class="btn-add-cart" onclick="showNotify('Необходимо войти в профиль', true)"><i class="bi bi-cart-plus me-2"></i> В корзину</button>
                    </div>
                </div>
            `).join('');
        } else {
            productsGridElement.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <div class="product-image"><img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/600x600/f4f6f9/e67e22?text=${encodeURIComponent(p.name)}'"></div>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">${p.price.toLocaleString()} ₽</div>
                        <button class="btn-add-cart" onclick="addToCart(${p.id})"><i class="bi bi-cart-plus me-2"></i> В корзину</button>
                    </div>
                </div>
            `).join('');
        }
    }

    function setCategory(cat) {
        if (!currentUser) {
            showNotify('Авторизуйтесь для просмотра категорий', true);
            return;
        }
        currentCategory = cat;
        updateActiveFilter();
        updateProductsDisplay();
    }

    function updateActiveFilter() {
        if (!filterChipsElement) return;
        let chips = filterChipsElement.querySelectorAll('.chip');
        chips.forEach(chip => {
            let cat = chip.getAttribute('data-cat');
            if ((cat === '' && currentCategory === '') || cat === currentCategory) chip.classList.add('active');
            else chip.classList.remove('active');
        });
    }

    function renderCatalogInterface() {
        let container = document.getElementById('catalogContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="auth-banner">
                    <i class="bi bi-person-lock"></i>
                    <h3>Доступ к каталогу</h3>
                    <p>Чтобы просматривать категории товаров и оформлять заказы, необходимо авторизоваться</p>
                    <button class="btn-primary-custom" onclick="showPage('profile')">Войти в профиль</button>
                </div>
                <div class="products-grid" id="productsGrid"></div>
            `;
            productsGridElement = document.getElementById('productsGrid');
            updateProductsDisplay();
            return;
        }
        let cats = ['', ...new Set(products.map(p => p.category))];
        let filterLabels = {
            '': 'Все', 'Цепи': 'Цепи', 'Кассеты': 'Кассеты', 'Тормоза': 'Тормоза',
            'Переключатели': 'Переключатели', 'Рули': 'Рули', 'Сёдла': 'Сёдла',
            'Покрышки': 'Покрышки', 'Камеры': 'Камеры', 'Смазки': 'Смазки', 'Насосы': 'Насосы'
        };
        container.innerHTML = `
            <div class="filter-section">
                <span class="filter-title"><i class="bi bi-tags me-1"></i> Категории</span>
                <div class="filter-chips" id="categoryFilters"></div>
            </div>
            <div class="products-grid" id="productsGrid"></div>
        `;
        filterChipsElement = document.getElementById('categoryFilters');
        productsGridElement = document.getElementById('productsGrid');
        filterChipsElement.innerHTML = cats.map(cat => `
            <span class="chip ${currentCategory === cat ? 'active' : ''}" data-cat="${cat}" onclick="setCategory('${cat}')">${filterLabels[cat] || cat}</span>
        `).join('');
        updateProductsDisplay();
    }

    function searchProducts() {
        updateProductsDisplay();
        let hero = document.getElementById('heroSection');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderCartPage() {
        let container = document.getElementById('cartContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-lock" style="font-size:2rem; display:block; margin-bottom:16px;"></i>
                    Войдите в профиль, чтобы просмотреть корзину<br>
                    <button class="btn-primary-custom mt-3" onclick="showPage('profile')">Войти</button>
                </div>
            `;
            return;
        }
        let cart = loadCart();
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-basket" style="font-size:2rem; display:block; margin-bottom:16px;"></i>
                    Корзина пуста<br>
                    <button class="btn-primary-custom mt-3" onclick="showPage('catalog')">Перейти в каталог</button>
                </div>
            `;
            return;
        }
        let total = 0, itemsHtml = '';
        cart.forEach(item => {
            let prod = products.find(p => p.id === item.id);
            if (!prod) return;
            let sum = prod.price * item.quantity;
            total += sum;
            itemsHtml += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-img"><img src="${prod.img}" alt="" onerror="this.src='https://placehold.co/70x70/f4f6f9/e67e22?text=?'"></div>
                        <div class="cart-item-name">${prod.name}</div>
                    </div>
                    <div class="cart-item-price">${prod.price.toLocaleString()} ₽</div>
                    <div class="cart-item-quantity">
                        <input type="number" min="1" value="${item.quantity}" class="quantity-input" oninput="onlyNumbers(this)" onchange="updateQuantity(${item.id}, this.value)">
                        <span style="cursor:pointer; color:#e67e22;" onclick="removeFromCart(${item.id})"><i class="bi bi-trash3"></i> Удалить</span>
                    </div>
                    <div style="font-weight:600; min-width:100px;">${sum.toLocaleString()} ₽</div>
                </div>
            `;
        });
        container.innerHTML = `
            <div class="cart-container">
                ${itemsHtml}
                <div class="cart-summary">
                    <button class="btn-outline" onclick="clearCart()"><i class="bi bi-eraser me-2"></i> Очистить корзину</button>
                    <div><span style="font-weight:500;">Итого:</span> <span class="total-price">${total.toLocaleString()} ₽</span></div>
                    <button class="btn-primary-custom" onclick="proceedToCheckout()"><i class="bi bi-arrow-right me-2"></i> Оформить заказ</button>
                </div>
            </div>
        `;
    }

    function renderCheckoutPage() {
        let cart = loadCart();
        if (!cart.length) {
            showPage('cart');
            return;
        }
        if (!currentUser) {
            showPage('profile');
            return;
        }
        let total = 0, itemsHtml = '';
        cart.forEach(item => {
            let prod = products.find(p => p.id === item.id);
            if (!prod) return;
            let sum = prod.price * item.quantity;
            total += sum;
            itemsHtml += `<div class="checkout-summary-item"><span>${prod.name} × ${item.quantity}</span><span>${sum.toLocaleString()} ₽</span></div>`;
        });
        let today = new Date().toISOString().split('T')[0];
        let fullName = currentUser.fullName || (currentUser.surname + ' ' + currentUser.name + (currentUser.patronymic ? ' ' + currentUser.patronymic : ''));
        let phoneValue = currentUser.phone || '';
        let emailValue = currentUser.email || '';
        document.getElementById('checkoutForm').innerHTML = `
            <div class="auth-card">
                <h3><i class="bi bi-truck me-2" style="color:#e67e22;"></i> Данные доставки</h3>
                <div class="checkout-form-fields">
                    <div class="form-row">
                        <div class="form-group">
                            <label>ФИО <span class="required">*</span></label>
                            <input type="text" id="checkoutName" class="form-input" placeholder="Иванов Иван Иванович" value="${fullName}">
                            <div class="error-message" id="checkoutNameError"></div>
                        </div>
                        <div class="form-group">
                            <label>Email <span class="required">*</span></label>
                            <input type="email" id="checkoutEmail" class="form-input" placeholder="example@mail.ru" value="${emailValue}">
                            <div class="error-message" id="checkoutEmailError"></div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Телефон <span class="required">*</span></label>
                            <input type="tel" id="checkoutPhone" class="form-input" placeholder="+7 (___)-___-__-__" value="${phoneValue}" oninput="formatPhone(this)">
                            <div class="error-message" id="checkoutPhoneError"></div>
                        </div>
                        <div class="form-group">
                            <label>Индекс</label>
                            <input type="text" id="checkoutZip" class="form-input" placeholder="123456" maxlength="6" oninput="onlyNumbers(this)">
                            <div class="error-message" id="checkoutZipError"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Адрес доставки <span class="required">*</span></label>
                        <input type="text" id="checkoutAddress" class="form-input" placeholder="г. Москва, ул. Примерная, д. 1, кв. 1">
                        <div class="error-message" id="checkoutAddressError"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Дата доставки</label>
                            <input type="date" id="checkoutDate" class="form-input" min="${today}">
                            <div class="error-message" id="checkoutDateError"></div>
                        </div>
                        <div class="form-group">
                            <label>Время</label>
                            <select id="checkoutTime" class="form-input">
                                <option value="">Выберите время</option>
                                <option value="10:00-14:00">10:00-14:00</option>
                                <option value="14:00-18:00">14:00-18:00</option>
                                <option value="18:00-22:00">18:00-22:00</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Комментарий</label>
                        <textarea id="checkoutComment" class="form-input" rows="2" placeholder="Пожелания по доставке..."></textarea>
                    </div>
                    <div class="checkout-summary">
                        ${itemsHtml}
                        <div class="checkout-summary-item"><span>Доставка:</span><span>Бесплатно</span></div>
                        <div class="checkout-summary-item"><span><strong>Итого:</strong></span><span><strong style="color:#e67e22;">${total} ₽</strong></span></div>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="checkoutAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                            <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я принимаю условия <a href="#" onclick="openModal('modalPrivacy'); return false;" style="color: #e67e22; text-decoration: none;">политики конфиденциальности</a> и даю согласие на обработку персональных данных</span>
                        </label>
                        <div class="error-message" id="checkoutAgreeError"></div>
                    </div>
                    <div style="display:flex; gap:12px; flex-direction: row-reverse;">
                        <button class="btn-primary-custom" style="flex:1;" onclick="placeOrder()"><i class="bi bi-check-lg me-2"></i> Подтвердить</button>
                        <button class="btn-outline" style="flex:1;" onclick="showPage('cart')"><i class="bi bi-arrow-left me-2"></i> Назад</button>
                    </div>
                </div>
            </div>
        `;
        let dateInput = document.getElementById('checkoutDate');
        if (dateInput && !dateInput.value) {
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
    }

    function placeOrder() {
        let name = document.getElementById('checkoutName').value.trim();
        let email = document.getElementById('checkoutEmail').value.trim();
        let phone = document.getElementById('checkoutPhone').value.trim();
        let address = document.getElementById('checkoutAddress').value.trim();
        let zip = document.getElementById('checkoutZip').value.trim();
        let deliveryDate = document.getElementById('checkoutDate').value;
        let deliveryTime = document.getElementById('checkoutTime').value;
        let comment = document.getElementById('checkoutComment').value.trim();
        let agreePersonal = document.getElementById('checkoutAgreePersonal');

        if (!agreePersonal || !agreePersonal.checked) {
            showNotify('Необходимо согласие на обработку персональных данных', true);
            return;
        }
        if (!name) { showNotify('Введите ФИО', true); return; }
        if (!validateFullName(name)) { showNotify('ФИО должно содержать фамилию, имя и отчество (только буквы, дефис)', true); return; }
        if (!email) { showNotify('Введите email', true); return; }
        if (!validateEmail(email)) { showNotify('Введите корректный email', true); return; }
        if (!phone) { showNotify('Введите телефон', true); return; }
        if (!validatePhone(phone)) { showNotify('Введите корректный телефон (10-12 цифр)', true); return; }
        if (!address) { showNotify('Введите адрес доставки', true); return; }
        if (!validateAddress(address)) { showNotify('Адрес должен содержать буквы, цифры, пробелы, точки, запятые, дефисы (5-150 символов)', true); return; }
        if (zip && !validateZipCode(zip)) { showNotify('Индекс должен состоять из 6 цифр', true); return; }
        if (deliveryDate && !validateDeliveryDate(deliveryDate)) { showNotify('Дата доставки не может быть раньше сегодняшнего дня', true); return; }
        if (deliveryTime && !validateDeliveryTime(deliveryTime)) { showNotify('Выберите корректный интервал времени', true); return; }
        if (comment && !validateComment(comment)) { showNotify('Комментарий не должен превышать 500 символов', true); return; }

        let cart = loadCart();
        if (cart.length === 0) { showNotify('Корзина пуста', true); return; }

        let orderItems = cart.map(item => {
            let prod = products.find(p => p.id === item.id);
            return { id: item.id, name: prod.name, price: prod.price, quantity: item.quantity };
        });
        let total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
        let newOrder = {
            id: Date.now(),
            userEmail: currentUser.email,
            orderEmail: email,
            date: new Date().toLocaleString(),
            items: orderItems,
            total: total,
            name: name,
            email: email,
            phone: phone,
            address: address,
            zip: zip || '',
            deliveryDate: deliveryDate || '',
            deliveryTime: deliveryTime || '',
            comment: comment || '',
            status: 'Принят',
            personalDataConsent: true,
            consentDate: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        saveCart([]);
        showNotify('Заказ оформлен!');
        showPage('profile');
    }

    let isEditing = false;

    function deleteAllUserData() {
        if (!currentUser) return;
        if (!confirm('ВНИМАНИЕ! Вы собираетесь полностью удалить все свои данные:\n\n• Ваш профиль (имя, email, телефон)\n• История всех заказов\n• Корзина\n\nЭто действие НЕОБРАТИМО. Нажмите "ОК", чтобы продолжить.')) return;
        let emailToDelete = currentUser.email;
        localStorage.removeItem(`cart_${emailToDelete}`);
        let updatedOrders = orders.filter(o => o.userEmail !== emailToDelete);
        orders = updatedOrders;
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        let updatedUsers = users.filter(u => u.email !== emailToDelete);
        users = updatedUsers;
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotify('Все ваши данные успешно удалены');
        showPage('catalog');
    }

    function renderProfilePage() {
        let container = document.getElementById('profileContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="auth-card">
                    <div class="nav-tabs-custom">
                        <button class="tab-btn active" data-tab="login" onclick="switchTabWithAnimation('login')">Вход</button>
                        <button class="tab-btn" data-tab="register" onclick="switchTabWithAnimation('register')">Регистрация</button>
                    </div>
                    <div class="tab-content">
                        <div id="loginTab" class="tab-pane active">
                            <form onsubmit="login(); return false;">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="loginEmail" class="form-input" placeholder="example@mail.ru">
                                    <div class="error-message" id="loginEmailError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Пароль</label>
                                    <input type="password" id="loginPass" class="form-input" placeholder="Введите пароль">
                                    <div class="error-message" id="loginPassError"></div>
                                </div>
                                <button type="submit" class="btn-primary-custom w-100">Войти</button>
                                <div id="loginMsg" class="mt-2 text-center small"></div>
                            </form>
                        </div>
                        <div id="registerTab" class="tab-pane">
                            <form onsubmit="register(); return false;">
                                <div class="form-group">
                                    <label>Фамилия <span class="required">*</span></label>
                                    <input type="text" id="regSurname" class="form-input" placeholder="Иванов" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regSurnameError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Имя <span class="required">*</span></label>
                                    <input type="text" id="regName" class="form-input" placeholder="Иван" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regNameError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Отчество</label>
                                    <input type="text" id="regPatronymic" class="form-input" placeholder="Иванович" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regPatronymicError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Email <span class="required">*</span></label>
                                    <input type="email" id="regEmail" class="form-input" placeholder="example@mail.ru">
                                    <div class="error-message" id="regEmailError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Телефон <span class="required">*</span></label>
                                    <input type="tel" id="regPhone" class="form-input" placeholder="+7 (___)-___-__-__" oninput="formatPhone(this)">
                                    <div class="error-message" id="regPhoneError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Пароль <span class="required">*</span></label>
                                    <input type="password" id="regPass" class="form-input" placeholder="Не менее 6 символов">
                                    <div class="error-message" id="regPassError"></div>
                                    <div class="password-strength" id="passwordStrength"></div>
                                </div>
                                <div class="form-group">
                                    <label>Подтверждение пароля <span class="required">*</span></label>
                                    <input type="password" id="regPassConfirm" class="form-input" placeholder="Повторите пароль">
                                    <div class="error-message" id="regPassConfirmError"></div>
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                        <input type="checkbox" id="regAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                                        <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я принимаю условия <a href="#" onclick="openModal('modalPrivacy'); return false;" style="color: #e67e22; text-decoration: none;">политики конфиденциальности</a> и даю согласие на обработку персональных данных</span>
                                    </label>
                                    <div class="error-message" id="regAgreeError"></div>
                                </div>
                                <button type="submit" class="btn-primary-custom w-100">Зарегистрироваться</button>
                                <div id="regMsg" class="mt-2 text-center small"></div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            let passInput = document.getElementById('regPass');
            if (passInput) {
                passInput.addEventListener('input', function() {
                    let strength = validatePasswordStrength(this.value);
                    let strengthDiv = document.getElementById('passwordStrength');
                    if (this.value.length === 0) {
                        strengthDiv.innerHTML = '';
                        strengthDiv.className = 'password-strength';
                    } else {
                        strengthDiv.innerHTML = `Надёжность пароля: ${strength.message}`;
                        strengthDiv.className = `password-strength strength-${strength.strength}`;
                    }
                });
            }
            return;
        }

        let fullName = currentUser.fullName || (currentUser.surname + ' ' + currentUser.name + (currentUser.patronymic ? ' ' + currentUser.patronymic : ''));
        if (!isEditing) {
            let userOrders = orders.filter(o => o.userEmail === currentUser.email);
            let ordersHtml = userOrders.length ? userOrders.map(o => `
                <div class="order-block">
                    <div class="order-header">
                        <div><i class="bi bi-receipt me-2" style="color:#e67e22;"></i> <strong>Заказ №${o.id}</strong></div>
                        <span class="order-status">${o.status}</span>
                    </div>
                    <div class="small">от ${o.date}</div>
                    <div><i class="bi bi-geo-alt me-1"></i> ${o.address}</div>
                    <div><i class="bi bi-telephone me-1"></i> ${o.phone}</div>
                    <div><i class="bi bi-envelope me-1"></i> ${o.email || o.userEmail}</div>
                    <div class="mt-2 pt-2 border-top"><strong>Сумма: ${o.total.toLocaleString()} ₽</strong></div>
                </div>
            `).join('') : '<div class="empty-state"><i class="bi bi-inbox"></i> Нет заказов</div>';
            container.innerHTML = `
                <div class="auth-card">
                    <div class="text-center mb-3"><i class="bi bi-person-circle" style="font-size:3rem; color:#e67e22;"></i></div>
                    <h3 class="text-center">${fullName}</h3>
                    <p class="text-center"><i class="bi bi-envelope"></i> ${currentUser.email}</p>
                    <p class="text-center"><i class="bi bi-telephone"></i> ${currentUser.phone || 'Не указан'}</p>
                    <div class="profile-actions">
                        <button class="profile-btn" onclick="startEditProfile()"><i class="bi bi-pencil"></i><span>Редактировать</span></button>
                        <button class="profile-btn" onclick="logout()"><i class="bi bi-box-arrow-right"></i><span>Выйти</span></button>
                        <button class="profile-btn danger-btn" onclick="deleteAllUserData()"><i class="bi bi-trash3"></i><span>Удалить данные</span></button>
                    </div>
                    <hr>
                    <h4><i class="bi bi-clock-history me-2" style="color:#e67e22;"></i> История заказов</h4>
                    ${ordersHtml}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="auth-card">
                    <div class="text-center mb-3"><i class="bi bi-person-circle" style="font-size:3rem; color:#e67e22;"></i></div>
                    <h3>Редактирование профиля</h3>
                    <form onsubmit="saveProfile(); return false;">
                        <div class="form-group">
                            <label>Фамилия</label>
                            <input type="text" id="editSurname" class="form-input" value="${currentUser.surname || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Имя</label>
                            <input type="text" id="editName" class="form-input" value="${currentUser.name || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Отчество</label>
                            <input type="text" id="editPatronymic" class="form-input" value="${currentUser.patronymic || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editEmail" class="form-input" value="${currentUser.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" id="editPhone" class="form-input" value="${currentUser.phone || ''}" oninput="formatPhone(this)">
                        </div>
                        <div class="form-group">
                            <label>Новый пароль (оставьте пустым, если не хотите менять)</label>
                            <input type="password" id="editPassword" class="form-input" placeholder="Новый пароль">
                        </div>
                        <div class="form-group">
                            <label>Подтверждение пароля</label>
                            <input type="password" id="editPasswordConfirm" class="form-input" placeholder="Повторите пароль">
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="editAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                                <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я подтверждаю, что мои данные актуальны, и даю согласие на их обработку</span>
                            </label>
                            <div class="error-message" id="editAgreeError"></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="submit" class="btn-primary-custom w-50"><i class="bi bi-save"></i> Сохранить</button>
                            <button type="button" class="btn-outline w-50" onclick="cancelEdit()"><i class="bi bi-x-circle"></i> Отмена</button>
                        </div>
                    </form>
                </div>
            `;
        }
    }

    function startEditProfile() {
        isEditing = true;
        renderProfilePage();
    }

    function cancelEdit() {
        isEditing = false;
        renderProfilePage();
    }

    function saveProfile() {
        let surname = document.getElementById('editSurname').value.trim();
        let name = document.getElementById('editName').value.trim();
        let patronymic = document.getElementById('editPatronymic').value.trim();
        let email = document.getElementById('editEmail').value.trim();
        let phone = document.getElementById('editPhone').value.trim();
        let newPassword = document.getElementById('editPassword').value.trim();
        let newPasswordConfirm = document.getElementById('editPasswordConfirm').value.trim();
        let agreePersonal = document.getElementById('editAgreePersonal');

        if (!agreePersonal || !agreePersonal.checked) {
            showNotify('Необходимо подтверждение на обработку данных', true);
            return;
        }
        if (surname && !validateNamePart(surname)) { showNotify('Фамилия должна содержать только буквы (2-30 символов)', true); return; }
        if (name && !validateNamePart(name)) { showNotify('Имя должно содержать только буквы (2-30 символов)', true); return; }
        if (patronymic && !validateNamePart(patronymic)) { showNotify('Отчество должно содержать только буквы (2-30 символов)', true); return; }
        if (!email) { showNotify('Email не может быть пустым', true); return; }
        if (!validateEmail(email)) { showNotify('Введите корректный email', true); return; }
        if (phone && !validatePhone(phone)) { showNotify('Введите корректный телефон (10-12 цифр)', true); return; }

        if (newPassword) {
            if (newPassword.length < 6) { showNotify('Пароль должен быть не менее 6 символов', true); return; }
            let passwordStrength = validatePasswordStrength(newPassword);
            if (!passwordStrength.isValid) { showNotify('Пароль слишком слабый (буквы + цифры)', true); return; }
            if (newPassword !== newPasswordConfirm) { showNotify('Пароли не совпадают', true); return; }
        }

        let oldEmail = currentUser.email;
        let userIndex = users.findIndex(u => u.email === oldEmail);
        if (userIndex !== -1) {
            if (email !== oldEmail && users.find(u => u.email === email && u.email !== oldEmail)) {
                showNotify('Пользователь с таким email уже существует', true);
                return;
            }
            if (phone && phone !== currentUser.phone && users.find(u => u.phone === phone && u.email !== oldEmail)) {
                showNotify('Пользователь с таким телефоном уже существует', true);
                return;
            }
            users[userIndex].surname = surname;
            users[userIndex].name = name;
            users[userIndex].patronymic = patronymic;
            users[userIndex].email = email;
            users[userIndex].phone = phone;
            users[userIndex].fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
            if (newPassword) users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));

            let oldCartKey = `cart_${oldEmail}`, newCartKey = `cart_${email}`;
            let oldCart = localStorage.getItem(oldCartKey);
            if (oldCart && email !== oldEmail) {
                localStorage.setItem(newCartKey, oldCart);
                localStorage.removeItem(oldCartKey);
            }
            let updatedOrders = orders.map(order => {
                if (order.userEmail === oldEmail) return { ...order, userEmail: email };
                return order;
            });
            orders = updatedOrders;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        currentUser.surname = surname;
        currentUser.name = name;
        currentUser.patronymic = patronymic;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        isEditing = false;
        renderProfilePage();
        showNotify('Профиль обновлён');
        if (email !== oldEmail) setTimeout(() => window.location.reload(), 1500);
    }

    function switchTabWithAnimation(tab) {
        let loginTab = document.getElementById('loginTab');
        let registerTab = document.getElementById('registerTab');
        let btns = document.querySelectorAll('.tab-btn');
        if (tab === 'login') {
            if (registerTab) {
                registerTab.classList.add('fade-out');
                setTimeout(() => {
                    registerTab.classList.remove('active', 'fade-out');
                    registerTab.style.display = 'none';
                    loginTab.style.display = 'block';
                    loginTab.classList.add('active', 'fade-in');
                    setTimeout(() => loginTab.classList.remove('fade-in'), 300);
                }, 150);
            }
            btns.forEach(btn => {
                if (btn.getAttribute('data-tab') === 'login') btn.classList.add('active');
                else btn.classList.remove('active');
            });
        } else {
            if (loginTab) {
                loginTab.classList.add('fade-out');
                setTimeout(() => {
                    loginTab.classList.remove('active', 'fade-out');
                    loginTab.style.display = 'none';
                    registerTab.style.display = 'block';
                    registerTab.classList.add('active', 'fade-in');
                    setTimeout(() => registerTab.classList.remove('fade-in'), 300);
                }, 150);
            }
            btns.forEach(btn => {
                if (btn.getAttribute('data-tab') === 'register') btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    }

    function register() {
        let surname = document.getElementById('regSurname').value.trim();
        let name = document.getElementById('regName').value.trim();
        let patronymic = document.getElementById('regPatronymic').value.trim();
        let email = document.getElementById('regEmail').value.trim();
        let phone = document.getElementById('regPhone').value.trim();
        let pass = document.getElementById('regPass').value.trim();
        let passConfirm = document.getElementById('regPassConfirm').value.trim();
        let agreePersonal = document.getElementById('regAgreePersonal');
        let msg = document.getElementById('regMsg');

        if (!agreePersonal || !agreePersonal.checked) {
            msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Необходимо согласие на обработку персональных данных';
            msg.style.color = '#dc2626';
            return;
        }
        if (!surname) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите фамилию'; msg.style.color = '#dc2626'; return; }
        if (!validateNamePart(surname)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Фамилия должна содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (!name) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите имя'; msg.style.color = '#dc2626'; return; }
        if (!validateNamePart(name)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Имя должно содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (patronymic && !validateNamePart(patronymic)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Отчество должно содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (!email) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите email'; msg.style.color = '#dc2626'; return; }
        if (!validateEmail(email)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Некорректный email'; msg.style.color = '#dc2626'; return; }
        if (!phone) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите телефон'; msg.style.color = '#dc2626'; return; }
        if (!validatePhone(phone)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите 10-12 цифр телефона'; msg.style.color = '#dc2626'; return; }
        if (users.find(u => u.phone === phone)) { msg.innerHTML = '<i class="bi bi-x-circle"></i> Пользователь с таким телефоном уже существует'; msg.style.color = '#dc2626'; return; }
        if (!pass) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите пароль'; msg.style.color = '#dc2626'; return; }
        let passwordStrength = validatePasswordStrength(pass);
        if (!passwordStrength.isValid) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Пароль слишком слабый (минимум 6 символов, буквы + цифры)'; msg.style.color = '#dc2626'; return; }
        if (pass !== passConfirm) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Пароли не совпадают'; msg.style.color = '#dc2626'; return; }
        if (users.find(u => u.email === email)) { msg.innerHTML = '<i class="bi bi-x-circle"></i> Пользователь с таким email уже существует'; msg.style.color = '#dc2626'; return; }

        let fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
        users.push({
            email, surname, name, patronymic, fullName, phone, password: pass,
            registrationDate: new Date().toISOString(),
            personalDataConsent: true,
            consentDate: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = { email, surname, name, patronymic, fullName, phone };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        msg.innerHTML = '<i class="bi bi-check-circle-fill"></i> Регистрация успешна! Перенаправление...';
        msg.style.color = '#e67e22';
        setTimeout(() => showPage('catalog'), 1500);
    }

    function login() {
        let email = document.getElementById('loginEmail').value.trim();
        let pass = document.getElementById('loginPass').value.trim();
        let msg = document.getElementById('loginMsg');
        if (!email || !pass) {
            msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Заполните поля';
            msg.style.color = '#dc2626';
            return;
        }
        let user = users.find(u => u.email === email);
        if (user && user.password === pass) {
            currentUser = {
                email: user.email,
                surname: user.surname,
                name: user.name,
                patronymic: user.patronymic,
                fullName: user.fullName,
                phone: user.phone || ''
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            msg.innerHTML = '<i class="bi bi-check-circle-fill"></i> Вход выполнен! Перенаправление...';
            msg.style.color = '#e67e22';
            setTimeout(() => showPage('catalog'), 1500);
        } else {
            msg.innerHTML = '<i class="bi bi-x-circle"></i> Неверный email или пароль';
            msg.style.color = '#dc2626';
        }
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotify('Вы вышли');
        showPage('catalog');
    }

    function updateSearchVisibility(pageId) {
        const searchWrapper = document.querySelector('.search-wrapper');
        const mobileSearchBtn = document.getElementById('mobileSearchBtn');
        const isCatalog = (pageId === 'catalog');
        if (searchWrapper) {
            searchWrapper.style.display = isCatalog ? '' : 'none';
        }
        if (mobileSearchBtn) {
            mobileSearchBtn.style.display = isCatalog ? '' : 'none';
        }
    }

    function showPage(pageId) {
        let currentPage = document.querySelector('.page-content:not([style*="display: none"])');
        let targetPage = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
        if (!targetPage) return;
        if (currentPage === targetPage) return;
        if (currentPage) {
            currentPage.classList.add('fade-out');
            setTimeout(() => {
                currentPage.style.display = 'none';
                currentPage.classList.remove('fade-out');
                targetPage.style.display = 'block';
                targetPage.style.opacity = '0';
                setTimeout(() => {
                    targetPage.style.opacity = '1';
                }, 10);
                if (pageId === 'cart') renderCartPage();
                else if (pageId === 'profile') renderProfilePage();
                else if (pageId === 'checkout') renderCheckoutPage();
                else if (pageId === 'catalog') renderCatalogInterface();
                updateSearchVisibility(pageId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 200);
        } else {
            targetPage.style.display = 'block';
            targetPage.style.opacity = '1';
            if (pageId === 'cart') renderCartPage();
            else if (pageId === 'profile') renderProfilePage();
            else if (pageId === 'checkout') renderCheckoutPage();
            else if (pageId === 'catalog') renderCatalogInterface();
            updateSearchVisibility(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function openMobileMenu() {
        let mobileMenu = document.getElementById('mobileMenu');
        let overlay = document.getElementById('menuOverlay');
        if (mobileMenu && overlay) {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        let mobileMenu = document.getElementById('mobileMenu');
        let overlay = document.getElementById('menuOverlay');
        if (mobileMenu && overlay) {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function scrollToHero() {
        let hero = document.getElementById('heroSection');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function scrollToCatalog() {
        let el = document.getElementById('catalogSection');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openModal(modalId) {
        let modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        let modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function initMobileSearch() {
        let mobileSearchBtn = document.getElementById('mobileSearchBtn');
        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openModal('modalSearch');
            });
        }
    }

    function mobileSearchSubmit() {
        let query = document.getElementById('mobileSearchInput').value;
        if (document.getElementById('searchInput')) document.getElementById('searchInput').value = query;
        searchProducts();
        closeModal('modalSearch');
    }

    function initStickyFilter() {
        let filterSection = document.querySelector('.filter-section');
        let catalogSection = document.getElementById('catalogSection');
        if (!filterSection || !catalogSection) return;
        let headerHeight = 75, filterOriginalTop = 0;
        function updateFilterTop() {
            let rect = catalogSection.getBoundingClientRect();
            filterOriginalTop = rect.top + window.scrollY + 48;
        }
        updateFilterTop();
        window.addEventListener('resize', updateFilterTop);
        function checkSticky() {
            let scrollY = window.scrollY;
            let shouldStick = scrollY + headerHeight > filterOriginalTop;
            if (shouldStick) {
                if (!filterSection.classList.contains('sticky')) filterSection.classList.add('sticky');
            } else {
                if (filterSection.classList.contains('sticky')) filterSection.classList.remove('sticky');
            }
        }
        window.addEventListener('scroll', checkSticky);
        checkSticky();
    }

    document.getElementById('burgerBtn')?.addEventListener('click', openMobileMenu);
    document.getElementById('closeMenuBtn')?.addEventListener('click', closeMobileMenu);
    document.getElementById('menuOverlay')?.addEventListener('click', closeMobileMenu);
    document.getElementById('heroCatalogBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCatalog();
    });

    let searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchProducts();
            }
        });
    }

    window.addToCart = addToCart;
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.proceedToCheckout = proceedToCheckout;
    window.placeOrder = placeOrder;
    window.login = login;
    window.register = register;
    window.logout = logout;
    window.searchProducts = searchProducts;
    window.switchTabWithAnimation = switchTabWithAnimation;
    window.onlyNumbers = onlyNumbers;
    window.onlyLetters = onlyLetters;
    window.formatPhone = formatPhone;
    window.closeMobileMenu = closeMobileMenu;
    window.setCategory = setCategory;
    window.scrollToHero = scrollToHero;
    window.scrollToCatalog = scrollToCatalog;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.startEditProfile = startEditProfile;
    window.cancelEdit = cancelEdit;
    window.saveProfile = saveProfile;
    window.deleteAllUserData = deleteAllUserData;
    window.mobileSearchSubmit = mobileSearchSubmit;
    window.initStickyFilter = initStickyFilter;
    window.initMobileSearch = initMobileSearch;
    window.showPage = showPage;

    document.addEventListener('DOMContentLoaded', () => {
        renderCatalogInterface();
        updateCartCount();
        setTimeout(() => { initStickyFilter(); }, 100);
        initMobileSearch();
        updateSearchVisibility('catalog');
    });
})();window.addEventListener('scroll', function() {
    let btn = document.getElementById('scrollTopBtn');
    if (btn) {
        if (window.scrollY > 300) btn.classList.add('show');
        else btn.classList.remove('show');
    }
});

(function() {
    const products = [
        { id: 1, name: "Цепь Shimano HG40", price: 500, category: "Цепи", img: "./img/products/Shimano_HG40.png" },
        { id: 2, name: "Кассета Sunrace M88", price: 1500, category: "Кассеты", img: "./img/products/Sunrace_M88.png" },
        { id: 3, name: "Колодки Avid SD7", price: 350, category: "Тормоза", img: "./img/products/Avid_SD7.png" },
        { id: 4, name: "Shimano Tourney RD", price: 800, category: "Переключатели", img: "./img/products/Shimano_Tourney_RD.png" },
        { id: 5, name: "Цепь KMC X8", price: 650, category: "Цепи", img: "./img/products/KMC_X8.png" },
        { id: 6, name: "Кассета Shimano CS-HG41", price: 1800, category: "Кассеты", img: "./img/products/Shimano_CS-HG41.png" },
        { id: 7, name: "Колодки Shimano B01S", price: 400, category: "Тормоза", img: "./img/products/Shimano_B01S.png" },
        { id: 8, name: "Shimano Altus RD-M310", price: 1200, category: "Переключатели", img: "./img/products/Shimano_Altus_RD-M310.png" },
        { id: 9, name: "Руль Ritchey Comp", price: 1500, category: "Рули", img: "./img/products/Ritchey_Comp.png" },
        { id: 10, name: "Седло Selle Royal", price: 2000, category: "Сёдла", img: "./img/products/Selle_Royal.png" },
        { id: 11, name: "Покрышка Schwalbe", price: 1200, category: "Покрышки", img: "./img/products/Schwalbe.png" },
        { id: 12, name: "Камера CST 26''", price: 300, category: "Камеры", img: "./img/products/CST_26''.png" },
        { id: 13, name: "Смазка Muc-Off", price: 500, category: "Смазки", img: "./img/products/Muc-Off.png" },
        { id: 14, name: "Насос Topeak", price: 800, category: "Насосы", img: "./img/products/Topeak.png" },
        { id: 15, name: "Переключатель передний Tourney", price: 600, category: "Переключатели", img: "./img/products/Tourney.png" }
    ];

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let currentCategory = '';
    let productsGridElement = null;
    let filterChipsElement = null;

    function showNotify(msg, isError = false) {
        let div = document.createElement('div');
        div.className = 'toast-notify' + (isError ? ' error' : '');
        div.innerHTML = `<i class="bi ${isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2" style="color:${isError ? '#dc2626' : '#e67e22'};"></i> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function validateEmail(email) {
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        let digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 12;
    }

    function validateNamePart(name) {
        return /^[а-яА-ЯёЁa-zA-Z-]{2,30}$/.test(name);
    }

    function validateFullName(name) {
        let parts = name.trim().split(/\s+/);
        if (parts.length < 2 || parts.length > 3) return false;
        return parts.every(part => validateNamePart(part));
    }

    function validateAddress(address) {
        return /^[а-яА-ЯёЁa-zA-Z0-9\s\.,\-/]{5,150}$/.test(address.trim());
    }

    function validateZipCode(zip) {
        if (!zip) return true;
        return /^\d{6}$/.test(zip.trim());
    }

    function validateComment(comment) {
        if (!comment) return true;
        return comment.trim().length <= 500;
    }

    function validateDeliveryDate(date) {
        if (!date) return true;
        let selected = new Date(date);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
    }

    function validateDeliveryTime(time) {
        if (!time) return true;
        let validTimes = ["10:00-14:00", "14:00-18:00", "18:00-22:00"];
        return validTimes.includes(time);
    }

    function validatePasswordStrength(password) {
        let minLength = 6;
        let hasUpperCase = /[A-ZА-Я]/.test(password);
        let hasLowerCase = /[a-zа-я]/.test(password);
        let hasNumbers = /\d/.test(password);
        let hasSpecial = /[!@#$%^&*(),?":{}|<>]/.test(password);
        let isValidLength = password.length >= minLength;
        let strength = 0;
        if (isValidLength) strength++;
        if (hasUpperCase && hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecial) strength++;
        let weakPatterns = [
            /^[a-zа-я]+\.[0-9]+$/i, /^[a-zа-я]+[0-9]+$/i, /^[0-9]+[a-zа-я]+$/i,
            /^password\d*$/i, /^qwerty\d*$/i, /^admin\d*$/i, /^user\d*$/i,
            /^12345+$/, /^qwerty+$/i, /^abcdef+$/i, /^[a-zа-я]{3,}\d{3,}$/i
        ];
        let isWeakPattern = weakPatterns.some(pattern => pattern.test(password));
        if (isWeakPattern && strength >= 2) strength = 1;
        return {
            isValid: strength >= 2 && isValidLength && !isWeakPattern,
            strength: strength,
            message: strength >= 3 ? 'Надёжный' : (strength === 2 ? 'Средний' : 'Слабый')
        };
    }

    function onlyNumbers(input) {
        input.value = input.value.replace(/[^0-9]/g, '');
    }

    function onlyLetters(input) {
        input.value = input.value.replace(/[^а-яА-ЯёЁa-zA-Z\s-]/g, '');
    }

    function formatPhone(input) {
        let cleaned = input.value.replace(/\D/g, '');
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
        let formatted = '';
        if (cleaned.length > 0) {
            if (cleaned[0] === '7' || cleaned[0] === '8') {
                formatted = '+' + cleaned[0] + ' ';
                let rest = cleaned.slice(1);
                if (rest.length > 0) formatted += '(' + rest.slice(0, 3);
                if (rest.length > 3) formatted += ') ' + rest.slice(3, 6);
                if (rest.length > 6) formatted += '-' + rest.slice(6, 8);
                if (rest.length > 8) formatted += '-' + rest.slice(8, 10);
            } else {
                formatted = cleaned;
            }
        }
        input.value = formatted;
    }

    function getCartKey() {
        return currentUser ? `cart_${currentUser.email}` : null;
    }

    function loadCart() {
        let key = getCartKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function saveCart(cart) {
        let key = getCartKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(cart));
            updateCartCount();
        }
    }

    function updateCartCount() {
        let cart = loadCart();
        let total = cart.reduce((s, i) => s + i.quantity, 0);
        let span = document.getElementById('cartCount');
        if (span) span.innerText = total;
        let mobileSpan = document.getElementById('mobileCartCount');
        if (mobileSpan) mobileSpan.innerText = total;
    }

    function addToCart(productId) {
        if (!currentUser) {
            showNotify('Необходимо войти в профиль', true);
            showPage('profile');
            return;
        }
        let cart = loadCart();
        let existing = cart.find(i => i.id === productId);
        if (existing) existing.quantity++;
        else cart.push({ id: productId, quantity: 1 });
        saveCart(cart);
        showNotify('Товар добавлен в корзину');
    }

    function updateQuantity(id, qty) {
        let val = parseInt(qty) || 1;
        let cart = loadCart();
        let item = cart.find(i => i.id === id);
        if (item) item.quantity = val;
        saveCart(cart);
        renderCartPage();
    }

    function removeFromCart(id) {
        let cart = loadCart();
        cart = cart.filter(i => i.id !== id);
        saveCart(cart);
        renderCartPage();
        showNotify('Товар удалён');
    }

    function clearCart() {
        saveCart([]);
        renderCartPage();
        showNotify('Корзина очищена');
    }

    function proceedToCheckout() {
        if (!currentUser) {
            showNotify('Войдите в профиль', true);
            showPage('profile');
            return;
        }
        let cart = loadCart();
        if (cart.length === 0) {
            showNotify('Корзина пуста', true);
            return;
        }
        showPage('checkout');
    }

    function updateProductsDisplay() {
        if (!productsGridElement) return;
        let searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
        let filtered = products.filter(p => p.name.toLowerCase().includes(searchValue));
        if (currentCategory) filtered = filtered.filter(p => p.category === currentCategory);
        if (filtered.length === 0) {
            productsGridElement.innerHTML = '<div class="empty-state"><i class="bi bi-search" style="font-size:2rem; display:block; margin-bottom:16px;"></i>Товары не найдены</div>';
            return;
        }
        if (!currentUser) {
            productsGridElement.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <div class="product-image"><img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/600x600/f4f6f9/e67e22?text=${encodeURIComponent(p.name)}'"></div>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">${p.price.toLocaleString()} ₽</div>
                        <button class="btn-add-cart" onclick="showNotify('Необходимо войти в профиль', true)"><i class="bi bi-cart-plus me-2"></i> В корзину</button>
                    </div>
                </div>
            `).join('');
        } else {
            productsGridElement.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <div class="product-image"><img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/600x600/f4f6f9/e67e22?text=${encodeURIComponent(p.name)}'"></div>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">${p.price.toLocaleString()} ₽</div>
                        <button class="btn-add-cart" onclick="addToCart(${p.id})"><i class="bi bi-cart-plus me-2"></i> В корзину</button>
                    </div>
                </div>
            `).join('');
        }
    }

    function setCategory(cat) {
        if (!currentUser) {
            showNotify('Авторизуйтесь для просмотра категорий', true);
            return;
        }
        currentCategory = cat;
        updateActiveFilter();
        updateProductsDisplay();
    }

    function updateActiveFilter() {
        if (!filterChipsElement) return;
        let chips = filterChipsElement.querySelectorAll('.chip');
        chips.forEach(chip => {
            let cat = chip.getAttribute('data-cat');
            if ((cat === '' && currentCategory === '') || cat === currentCategory) chip.classList.add('active');
            else chip.classList.remove('active');
        });
    }

    function renderCatalogInterface() {
        let container = document.getElementById('catalogContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="auth-banner">
                    <i class="bi bi-person-lock"></i>
                    <h3>Доступ к каталогу</h3>
                    <p>Чтобы просматривать категории товаров и оформлять заказы, необходимо авторизоваться</p>
                    <button class="btn-primary-custom" onclick="showPage('profile')">Войти в профиль</button>
                </div>
                <div class="products-grid" id="productsGrid"></div>
            `;
            productsGridElement = document.getElementById('productsGrid');
            updateProductsDisplay();
            return;
        }
        let cats = ['', ...new Set(products.map(p => p.category))];
        let filterLabels = {
            '': 'Все', 'Цепи': 'Цепи', 'Кассеты': 'Кассеты', 'Тормоза': 'Тормоза',
            'Переключатели': 'Переключатели', 'Рули': 'Рули', 'Сёдла': 'Сёдла',
            'Покрышки': 'Покрышки', 'Камеры': 'Камеры', 'Смазки': 'Смазки', 'Насосы': 'Насосы'
        };
        container.innerHTML = `
            <div class="filter-section">
                <span class="filter-title"><i class="bi bi-tags me-1"></i> Категории</span>
                <div class="filter-chips" id="categoryFilters"></div>
            </div>
            <div class="products-grid" id="productsGrid"></div>
        `;
        filterChipsElement = document.getElementById('categoryFilters');
        productsGridElement = document.getElementById('productsGrid');
        filterChipsElement.innerHTML = cats.map(cat => `
            <span class="chip ${currentCategory === cat ? 'active' : ''}" data-cat="${cat}" onclick="setCategory('${cat}')">${filterLabels[cat] || cat}</span>
        `).join('');
        updateProductsDisplay();
    }

    function searchProducts() {
        updateProductsDisplay();
        let hero = document.getElementById('heroSection');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderCartPage() {
        let container = document.getElementById('cartContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-lock" style="font-size:2rem; display:block; margin-bottom:16px;"></i>
                    Войдите в профиль, чтобы просмотреть корзину<br>
                    <button class="btn-primary-custom mt-3" onclick="showPage('profile')">Войти</button>
                </div>
            `;
            return;
        }
        let cart = loadCart();
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-basket" style="font-size:2rem; display:block; margin-bottom:16px;"></i>
                    Корзина пуста<br>
                    <button class="btn-primary-custom mt-3" onclick="showPage('catalog')">Перейти в каталог</button>
                </div>
            `;
            return;
        }
        let total = 0, itemsHtml = '';
        cart.forEach(item => {
            let prod = products.find(p => p.id === item.id);
            if (!prod) return;
            let sum = prod.price * item.quantity;
            total += sum;
            itemsHtml += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-img"><img src="${prod.img}" alt="" onerror="this.src='https://placehold.co/70x70/f4f6f9/e67e22?text=?'"></div>
                        <div class="cart-item-name">${prod.name}</div>
                    </div>
                    <div class="cart-item-price">${prod.price.toLocaleString()} ₽</div>
                    <div class="cart-item-quantity">
                        <input type="number" min="1" value="${item.quantity}" class="quantity-input" oninput="onlyNumbers(this)" onchange="updateQuantity(${item.id}, this.value)">
                        <span style="cursor:pointer; color:#e67e22;" onclick="removeFromCart(${item.id})"><i class="bi bi-trash3"></i> Удалить</span>
                    </div>
                    <div style="font-weight:600; min-width:100px;">${sum.toLocaleString()} ₽</div>
                </div>
            `;
        });
        container.innerHTML = `
            <div class="cart-container">
                ${itemsHtml}
                <div class="cart-summary">
                    <button class="btn-outline" onclick="clearCart()"><i class="bi bi-eraser me-2"></i> Очистить корзину</button>
                    <div><span style="font-weight:500;">Итого:</span> <span class="total-price">${total.toLocaleString()} ₽</span></div>
                    <button class="btn-primary-custom" onclick="proceedToCheckout()"><i class="bi bi-arrow-right me-2"></i> Оформить заказ</button>
                </div>
            </div>
        `;
    }

    function renderCheckoutPage() {
        let cart = loadCart();
        if (!cart.length) {
            showPage('cart');
            return;
        }
        if (!currentUser) {
            showPage('profile');
            return;
        }
        let total = 0, itemsHtml = '';
        cart.forEach(item => {
            let prod = products.find(p => p.id === item.id);
            if (!prod) return;
            let sum = prod.price * item.quantity;
            total += sum;
            itemsHtml += `<div class="checkout-summary-item"><span>${prod.name} × ${item.quantity}</span><span>${sum.toLocaleString()} ₽</span></div>`;
        });
        let today = new Date().toISOString().split('T')[0];
        let fullName = currentUser.fullName || (currentUser.surname + ' ' + currentUser.name + (currentUser.patronymic ? ' ' + currentUser.patronymic : ''));
        let phoneValue = currentUser.phone || '';
        let emailValue = currentUser.email || '';
        document.getElementById('checkoutForm').innerHTML = `
            <div class="auth-card">
                <h3><i class="bi bi-truck me-2" style="color:#e67e22;"></i> Данные доставки</h3>
                <div class="checkout-form-fields">
                    <div class="form-row">
                        <div class="form-group">
                            <label>ФИО <span class="required">*</span></label>
                            <input type="text" id="checkoutName" class="form-input" placeholder="Иванов Иван Иванович" value="${fullName}">
                            <div class="error-message" id="checkoutNameError"></div>
                        </div>
                        <div class="form-group">
                            <label>Email <span class="required">*</span></label>
                            <input type="email" id="checkoutEmail" class="form-input" placeholder="example@mail.ru" value="${emailValue}">
                            <div class="error-message" id="checkoutEmailError"></div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Телефон <span class="required">*</span></label>
                            <input type="tel" id="checkoutPhone" class="form-input" placeholder="+7 (___)-___-__-__" value="${phoneValue}" oninput="formatPhone(this)">
                            <div class="error-message" id="checkoutPhoneError"></div>
                        </div>
                        <div class="form-group">
                            <label>Индекс</label>
                            <input type="text" id="checkoutZip" class="form-input" placeholder="123456" maxlength="6" oninput="onlyNumbers(this)">
                            <div class="error-message" id="checkoutZipError"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Адрес доставки <span class="required">*</span></label>
                        <input type="text" id="checkoutAddress" class="form-input" placeholder="г. Москва, ул. Примерная, д. 1, кв. 1">
                        <div class="error-message" id="checkoutAddressError"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Дата доставки</label>
                            <input type="date" id="checkoutDate" class="form-input" min="${today}">
                            <div class="error-message" id="checkoutDateError"></div>
                        </div>
                        <div class="form-group">
                            <label>Время</label>
                            <select id="checkoutTime" class="form-input">
                                <option value="">Выберите время</option>
                                <option value="10:00-14:00">10:00-14:00</option>
                                <option value="14:00-18:00">14:00-18:00</option>
                                <option value="18:00-22:00">18:00-22:00</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Комментарий</label>
                        <textarea id="checkoutComment" class="form-input" rows="2" placeholder="Пожелания по доставке..."></textarea>
                    </div>
                    <div class="checkout-summary">
                        ${itemsHtml}
                        <div class="checkout-summary-item"><span>Доставка:</span><span>Бесплатно</span></div>
                        <div class="checkout-summary-item"><span><strong>Итого:</strong></span><span><strong style="color:#e67e22;">${total} ₽</strong></span></div>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="checkoutAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                            <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я принимаю условия <a href="#" onclick="openModal('modalPrivacy'); return false;" style="color: #e67e22; text-decoration: none;">политики конфиденциальности</a> и даю согласие на обработку персональных данных</span>
                        </label>
                        <div class="error-message" id="checkoutAgreeError"></div>
                    </div>
                    <div style="display:flex; gap:12px; flex-direction: row-reverse;">
                        <button class="btn-primary-custom" style="flex:1;" onclick="placeOrder()"><i class="bi bi-check-lg me-2"></i> Подтвердить</button>
                        <button class="btn-outline" style="flex:1;" onclick="showPage('cart')"><i class="bi bi-arrow-left me-2"></i> Назад</button>
                    </div>
                </div>
            </div>
        `;
        let dateInput = document.getElementById('checkoutDate');
        if (dateInput && !dateInput.value) {
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
    }

    function placeOrder() {
        let name = document.getElementById('checkoutName').value.trim();
        let email = document.getElementById('checkoutEmail').value.trim();
        let phone = document.getElementById('checkoutPhone').value.trim();
        let address = document.getElementById('checkoutAddress').value.trim();
        let zip = document.getElementById('checkoutZip').value.trim();
        let deliveryDate = document.getElementById('checkoutDate').value;
        let deliveryTime = document.getElementById('checkoutTime').value;
        let comment = document.getElementById('checkoutComment').value.trim();
        let agreePersonal = document.getElementById('checkoutAgreePersonal');

        if (!agreePersonal || !agreePersonal.checked) {
            showNotify('Необходимо согласие на обработку персональных данных', true);
            return;
        }
        if (!name) { showNotify('Введите ФИО', true); return; }
        if (!validateFullName(name)) { showNotify('ФИО должно содержать фамилию, имя и отчество (только буквы, дефис)', true); return; }
        if (!email) { showNotify('Введите email', true); return; }
        if (!validateEmail(email)) { showNotify('Введите корректный email', true); return; }
        if (!phone) { showNotify('Введите телефон', true); return; }
        if (!validatePhone(phone)) { showNotify('Введите корректный телефон (10-12 цифр)', true); return; }
        if (!address) { showNotify('Введите адрес доставки', true); return; }
        if (!validateAddress(address)) { showNotify('Адрес должен содержать буквы, цифры, пробелы, точки, запятые, дефисы (5-150 символов)', true); return; }
        if (zip && !validateZipCode(zip)) { showNotify('Индекс должен состоять из 6 цифр', true); return; }
        if (deliveryDate && !validateDeliveryDate(deliveryDate)) { showNotify('Дата доставки не может быть раньше сегодняшнего дня', true); return; }
        if (deliveryTime && !validateDeliveryTime(deliveryTime)) { showNotify('Выберите корректный интервал времени', true); return; }
        if (comment && !validateComment(comment)) { showNotify('Комментарий не должен превышать 500 символов', true); return; }

        let cart = loadCart();
        if (cart.length === 0) { showNotify('Корзина пуста', true); return; }

        let orderItems = cart.map(item => {
            let prod = products.find(p => p.id === item.id);
            return { id: item.id, name: prod.name, price: prod.price, quantity: item.quantity };
        });
        let total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
        let newOrder = {
            id: Date.now(),
            userEmail: currentUser.email,
            orderEmail: email,
            date: new Date().toLocaleString(),
            items: orderItems,
            total: total,
            name: name,
            email: email,
            phone: phone,
            address: address,
            zip: zip || '',
            deliveryDate: deliveryDate || '',
            deliveryTime: deliveryTime || '',
            comment: comment || '',
            status: 'Принят',
            personalDataConsent: true,
            consentDate: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        saveCart([]);
        showNotify('Заказ оформлен!');
        showPage('profile');
    }

    let isEditing = false;

    function deleteAllUserData() {
        if (!currentUser) return;
        if (!confirm('ВНИМАНИЕ! Вы собираетесь полностью удалить все свои данные:\n\n• Ваш профиль (имя, email, телефон)\n• История всех заказов\n• Корзина\n\nЭто действие НЕОБРАТИМО. Нажмите "ОК", чтобы продолжить.')) return;
        let emailToDelete = currentUser.email;
        localStorage.removeItem(`cart_${emailToDelete}`);
        let updatedOrders = orders.filter(o => o.userEmail !== emailToDelete);
        orders = updatedOrders;
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        let updatedUsers = users.filter(u => u.email !== emailToDelete);
        users = updatedUsers;
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotify('Все ваши данные успешно удалены');
        showPage('catalog');
    }

    function renderProfilePage() {
        let container = document.getElementById('profileContent');
        if (!container) return;
        if (!currentUser) {
            container.innerHTML = `
                <div class="auth-card">
                    <div class="nav-tabs-custom">
                        <button class="tab-btn active" data-tab="login" onclick="switchTabWithAnimation('login')">Вход</button>
                        <button class="tab-btn" data-tab="register" onclick="switchTabWithAnimation('register')">Регистрация</button>
                    </div>
                    <div class="tab-content">
                        <div id="loginTab" class="tab-pane active">
                            <form onsubmit="login(); return false;">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="loginEmail" class="form-input" placeholder="example@mail.ru">
                                    <div class="error-message" id="loginEmailError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Пароль</label>
                                    <input type="password" id="loginPass" class="form-input" placeholder="Введите пароль">
                                    <div class="error-message" id="loginPassError"></div>
                                </div>
                                <button type="submit" class="btn-primary-custom w-100">Войти</button>
                                <div id="loginMsg" class="mt-2 text-center small"></div>
                            </form>
                        </div>
                        <div id="registerTab" class="tab-pane">
                            <form onsubmit="register(); return false;">
                                <div class="form-group">
                                    <label>Фамилия <span class="required">*</span></label>
                                    <input type="text" id="regSurname" class="form-input" placeholder="Иванов" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regSurnameError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Имя <span class="required">*</span></label>
                                    <input type="text" id="regName" class="form-input" placeholder="Иван" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regNameError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Отчество</label>
                                    <input type="text" id="regPatronymic" class="form-input" placeholder="Иванович" oninput="onlyLetters(this)">
                                    <div class="error-message" id="regPatronymicError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Email <span class="required">*</span></label>
                                    <input type="email" id="regEmail" class="form-input" placeholder="example@mail.ru">
                                    <div class="error-message" id="regEmailError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Телефон <span class="required">*</span></label>
                                    <input type="tel" id="regPhone" class="form-input" placeholder="+7 (___)-___-__-__" oninput="formatPhone(this)">
                                    <div class="error-message" id="regPhoneError"></div>
                                </div>
                                <div class="form-group">
                                    <label>Пароль <span class="required">*</span></label>
                                    <input type="password" id="regPass" class="form-input" placeholder="Не менее 6 символов">
                                    <div class="error-message" id="regPassError"></div>
                                    <div class="password-strength" id="passwordStrength"></div>
                                </div>
                                <div class="form-group">
                                    <label>Подтверждение пароля <span class="required">*</span></label>
                                    <input type="password" id="regPassConfirm" class="form-input" placeholder="Повторите пароль">
                                    <div class="error-message" id="regPassConfirmError"></div>
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                        <input type="checkbox" id="regAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                                        <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я принимаю условия <a href="#" onclick="openModal('modalPrivacy'); return false;" style="color: #e67e22; text-decoration: none;">политики конфиденциальности</a> и даю согласие на обработку персональных данных</span>
                                    </label>
                                    <div class="error-message" id="regAgreeError"></div>
                                </div>
                                <button type="submit" class="btn-primary-custom w-100">Зарегистрироваться</button>
                                <div id="regMsg" class="mt-2 text-center small"></div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            let passInput = document.getElementById('regPass');
            if (passInput) {
                passInput.addEventListener('input', function() {
                    let strength = validatePasswordStrength(this.value);
                    let strengthDiv = document.getElementById('passwordStrength');
                    if (this.value.length === 0) {
                        strengthDiv.innerHTML = '';
                        strengthDiv.className = 'password-strength';
                    } else {
                        strengthDiv.innerHTML = `Надёжность пароля: ${strength.message}`;
                        strengthDiv.className = `password-strength strength-${strength.strength}`;
                    }
                });
            }
            return;
        }

        let fullName = currentUser.fullName || (currentUser.surname + ' ' + currentUser.name + (currentUser.patronymic ? ' ' + currentUser.patronymic : ''));
        if (!isEditing) {
            let userOrders = orders.filter(o => o.userEmail === currentUser.email);
            let ordersHtml = userOrders.length ? userOrders.map(o => `
                <div class="order-block">
                    <div class="order-header">
                        <div><i class="bi bi-receipt me-2" style="color:#e67e22;"></i> <strong>Заказ №${o.id}</strong></div>
                        <span class="order-status">${o.status}</span>
                    </div>
                    <div class="small">от ${o.date}</div>
                    <div><i class="bi bi-geo-alt me-1"></i> ${o.address}</div>
                    <div><i class="bi bi-telephone me-1"></i> ${o.phone}</div>
                    <div><i class="bi bi-envelope me-1"></i> ${o.email || o.userEmail}</div>
                    <div class="mt-2 pt-2 border-top"><strong>Сумма: ${o.total.toLocaleString()} ₽</strong></div>
                </div>
            `).join('') : '<div class="empty-state"><i class="bi bi-inbox"></i> Нет заказов</div>';
            container.innerHTML = `
                <div class="auth-card">
                    <div class="text-center mb-3"><i class="bi bi-person-circle" style="font-size:3rem; color:#e67e22;"></i></div>
                    <h3 class="text-center">${fullName}</h3>
                    <p class="text-center"><i class="bi bi-envelope"></i> ${currentUser.email}</p>
                    <p class="text-center"><i class="bi bi-telephone"></i> ${currentUser.phone || 'Не указан'}</p>
                    <div class="profile-actions">
                        <button class="profile-btn" onclick="startEditProfile()"><i class="bi bi-pencil"></i><span>Редактировать</span></button>
                        <button class="profile-btn" onclick="logout()"><i class="bi bi-box-arrow-right"></i><span>Выйти</span></button>
                        <button class="profile-btn danger-btn" onclick="deleteAllUserData()"><i class="bi bi-trash3"></i><span>Удалить данные</span></button>
                    </div>
                    <hr>
                    <h4><i class="bi bi-clock-history me-2" style="color:#e67e22;"></i> История заказов</h4>
                    ${ordersHtml}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="auth-card">
                    <div class="text-center mb-3"><i class="bi bi-person-circle" style="font-size:3rem; color:#e67e22;"></i></div>
                    <h3>Редактирование профиля</h3>
                    <form onsubmit="saveProfile(); return false;">
                        <div class="form-group">
                            <label>Фамилия</label>
                            <input type="text" id="editSurname" class="form-input" value="${currentUser.surname || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Имя</label>
                            <input type="text" id="editName" class="form-input" value="${currentUser.name || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Отчество</label>
                            <input type="text" id="editPatronymic" class="form-input" value="${currentUser.patronymic || ''}" oninput="onlyLetters(this)">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="editEmail" class="form-input" value="${currentUser.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" id="editPhone" class="form-input" value="${currentUser.phone || ''}" oninput="formatPhone(this)">
                        </div>
                        <div class="form-group">
                            <label>Новый пароль (оставьте пустым, если не хотите менять)</label>
                            <input type="password" id="editPassword" class="form-input" placeholder="Новый пароль">
                        </div>
                        <div class="form-group">
                            <label>Подтверждение пароля</label>
                            <input type="password" id="editPasswordConfirm" class="form-input" placeholder="Повторите пароль">
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="editAgreePersonal" style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                                <span style="font-size: 0.85rem; line-height: 1.4; cursor: pointer;">Я подтверждаю, что мои данные актуальны, и даю согласие на их обработку</span>
                            </label>
                            <div class="error-message" id="editAgreeError"></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="submit" class="btn-primary-custom w-50"><i class="bi bi-save"></i> Сохранить</button>
                            <button type="button" class="btn-outline w-50" onclick="cancelEdit()"><i class="bi bi-x-circle"></i> Отмена</button>
                        </div>
                    </form>
                </div>
            `;
        }
    }

    function startEditProfile() {
        isEditing = true;
        renderProfilePage();
    }

    function cancelEdit() {
        isEditing = false;
        renderProfilePage();
    }

    function saveProfile() {
        let surname = document.getElementById('editSurname').value.trim();
        let name = document.getElementById('editName').value.trim();
        let patronymic = document.getElementById('editPatronymic').value.trim();
        let email = document.getElementById('editEmail').value.trim();
        let phone = document.getElementById('editPhone').value.trim();
        let newPassword = document.getElementById('editPassword').value.trim();
        let newPasswordConfirm = document.getElementById('editPasswordConfirm').value.trim();
        let agreePersonal = document.getElementById('editAgreePersonal');

        if (!agreePersonal || !agreePersonal.checked) {
            showNotify('Необходимо подтверждение на обработку данных', true);
            return;
        }
        if (surname && !validateNamePart(surname)) { showNotify('Фамилия должна содержать только буквы (2-30 символов)', true); return; }
        if (name && !validateNamePart(name)) { showNotify('Имя должно содержать только буквы (2-30 символов)', true); return; }
        if (patronymic && !validateNamePart(patronymic)) { showNotify('Отчество должно содержать только буквы (2-30 символов)', true); return; }
        if (!email) { showNotify('Email не может быть пустым', true); return; }
        if (!validateEmail(email)) { showNotify('Введите корректный email', true); return; }
        if (phone && !validatePhone(phone)) { showNotify('Введите корректный телефон (10-12 цифр)', true); return; }

        if (newPassword) {
            if (newPassword.length < 6) { showNotify('Пароль должен быть не менее 6 символов', true); return; }
            let passwordStrength = validatePasswordStrength(newPassword);
            if (!passwordStrength.isValid) { showNotify('Пароль слишком слабый (буквы + цифры)', true); return; }
            if (newPassword !== newPasswordConfirm) { showNotify('Пароли не совпадают', true); return; }
        }

        let oldEmail = currentUser.email;
        let userIndex = users.findIndex(u => u.email === oldEmail);
        if (userIndex !== -1) {
            if (email !== oldEmail && users.find(u => u.email === email && u.email !== oldEmail)) {
                showNotify('Пользователь с таким email уже существует', true);
                return;
            }
            if (phone && phone !== currentUser.phone && users.find(u => u.phone === phone && u.email !== oldEmail)) {
                showNotify('Пользователь с таким телефоном уже существует', true);
                return;
            }
            users[userIndex].surname = surname;
            users[userIndex].name = name;
            users[userIndex].patronymic = patronymic;
            users[userIndex].email = email;
            users[userIndex].phone = phone;
            users[userIndex].fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
            if (newPassword) users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));

            let oldCartKey = `cart_${oldEmail}`, newCartKey = `cart_${email}`;
            let oldCart = localStorage.getItem(oldCartKey);
            if (oldCart && email !== oldEmail) {
                localStorage.setItem(newCartKey, oldCart);
                localStorage.removeItem(oldCartKey);
            }
            let updatedOrders = orders.map(order => {
                if (order.userEmail === oldEmail) return { ...order, userEmail: email };
                return order;
            });
            orders = updatedOrders;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        currentUser.surname = surname;
        currentUser.name = name;
        currentUser.patronymic = patronymic;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        isEditing = false;
        renderProfilePage();
        showNotify('Профиль обновлён');
        if (email !== oldEmail) setTimeout(() => window.location.reload(), 1500);
    }

    function switchTabWithAnimation(tab) {
        let loginTab = document.getElementById('loginTab');
        let registerTab = document.getElementById('registerTab');
        let btns = document.querySelectorAll('.tab-btn');
        if (tab === 'login') {
            if (registerTab) {
                registerTab.classList.add('fade-out');
                setTimeout(() => {
                    registerTab.classList.remove('active', 'fade-out');
                    registerTab.style.display = 'none';
                    loginTab.style.display = 'block';
                    loginTab.classList.add('active', 'fade-in');
                    setTimeout(() => loginTab.classList.remove('fade-in'), 300);
                }, 150);
            }
            btns.forEach(btn => {
                if (btn.getAttribute('data-tab') === 'login') btn.classList.add('active');
                else btn.classList.remove('active');
            });
        } else {
            if (loginTab) {
                loginTab.classList.add('fade-out');
                setTimeout(() => {
                    loginTab.classList.remove('active', 'fade-out');
                    loginTab.style.display = 'none';
                    registerTab.style.display = 'block';
                    registerTab.classList.add('active', 'fade-in');
                    setTimeout(() => registerTab.classList.remove('fade-in'), 300);
                }, 150);
            }
            btns.forEach(btn => {
                if (btn.getAttribute('data-tab') === 'register') btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    }

    function register() {
        let surname = document.getElementById('regSurname').value.trim();
        let name = document.getElementById('regName').value.trim();
        let patronymic = document.getElementById('regPatronymic').value.trim();
        let email = document.getElementById('regEmail').value.trim();
        let phone = document.getElementById('regPhone').value.trim();
        let pass = document.getElementById('regPass').value.trim();
        let passConfirm = document.getElementById('regPassConfirm').value.trim();
        let agreePersonal = document.getElementById('regAgreePersonal');
        let msg = document.getElementById('regMsg');

        if (!agreePersonal || !agreePersonal.checked) {
            msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Необходимо согласие на обработку персональных данных';
            msg.style.color = '#dc2626';
            return;
        }
        if (!surname) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите фамилию'; msg.style.color = '#dc2626'; return; }
        if (!validateNamePart(surname)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Фамилия должна содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (!name) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите имя'; msg.style.color = '#dc2626'; return; }
        if (!validateNamePart(name)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Имя должно содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (patronymic && !validateNamePart(patronymic)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Отчество должно содержать только буквы (2-30 символов)'; msg.style.color = '#dc2626'; return; }
        if (!email) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите email'; msg.style.color = '#dc2626'; return; }
        if (!validateEmail(email)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Некорректный email'; msg.style.color = '#dc2626'; return; }
        if (!phone) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите телефон'; msg.style.color = '#dc2626'; return; }
        if (!validatePhone(phone)) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите 10-12 цифр телефона'; msg.style.color = '#dc2626'; return; }
        if (users.find(u => u.phone === phone)) { msg.innerHTML = '<i class="bi bi-x-circle"></i> Пользователь с таким телефоном уже существует'; msg.style.color = '#dc2626'; return; }
        if (!pass) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Введите пароль'; msg.style.color = '#dc2626'; return; }
        let passwordStrength = validatePasswordStrength(pass);
        if (!passwordStrength.isValid) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Пароль слишком слабый (минимум 6 символов, буквы + цифры)'; msg.style.color = '#dc2626'; return; }
        if (pass !== passConfirm) { msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Пароли не совпадают'; msg.style.color = '#dc2626'; return; }
        if (users.find(u => u.email === email)) { msg.innerHTML = '<i class="bi bi-x-circle"></i> Пользователь с таким email уже существует'; msg.style.color = '#dc2626'; return; }

        let fullName = surname + ' ' + name + (patronymic ? ' ' + patronymic : '');
        users.push({
            email, surname, name, patronymic, fullName, phone, password: pass,
            registrationDate: new Date().toISOString(),
            personalDataConsent: true,
            consentDate: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = { email, surname, name, patronymic, fullName, phone };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        msg.innerHTML = '<i class="bi bi-check-circle-fill"></i> Регистрация успешна! Перенаправление...';
        msg.style.color = '#e67e22';
        setTimeout(() => showPage('catalog'), 1500);
    }

    function login() {
        let email = document.getElementById('loginEmail').value.trim();
        let pass = document.getElementById('loginPass').value.trim();
        let msg = document.getElementById('loginMsg');
        if (!email || !pass) {
            msg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Заполните поля';
            msg.style.color = '#dc2626';
            return;
        }
        let user = users.find(u => u.email === email);
        if (user && user.password === pass) {
            currentUser = {
                email: user.email,
                surname: user.surname,
                name: user.name,
                patronymic: user.patronymic,
                fullName: user.fullName,
                phone: user.phone || ''
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            msg.innerHTML = '<i class="bi bi-check-circle-fill"></i> Вход выполнен! Перенаправление...';
            msg.style.color = '#e67e22';
            setTimeout(() => showPage('catalog'), 1500);
        } else {
            msg.innerHTML = '<i class="bi bi-x-circle"></i> Неверный email или пароль';
            msg.style.color = '#dc2626';
        }
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showNotify('Вы вышли');
        showPage('catalog');
    }

    function updateSearchVisibility(pageId) {
        const searchWrapper = document.querySelector('.search-wrapper');
        const mobileSearchBtn = document.getElementById('mobileSearchBtn');
        const isCatalog = (pageId === 'catalog');
        if (searchWrapper) {
            searchWrapper.style.display = isCatalog ? '' : 'none';
        }
        if (mobileSearchBtn) {
            mobileSearchBtn.style.display = isCatalog ? '' : 'none';
        }
    }

    function showPage(pageId) {
        let currentPage = document.querySelector('.page-content:not([style*="display: none"])');
        let targetPage = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
        if (!targetPage) return;
        if (currentPage === targetPage) return;
        if (currentPage) {
            currentPage.classList.add('fade-out');
            setTimeout(() => {
                currentPage.style.display = 'none';
                currentPage.classList.remove('fade-out');
                targetPage.style.display = 'block';
                targetPage.style.opacity = '0';
                setTimeout(() => {
                    targetPage.style.opacity = '1';
                }, 10);
                if (pageId === 'cart') renderCartPage();
                else if (pageId === 'profile') renderProfilePage();
                else if (pageId === 'checkout') renderCheckoutPage();
                else if (pageId === 'catalog') renderCatalogInterface();
                updateSearchVisibility(pageId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 200);
        } else {
            targetPage.style.display = 'block';
            targetPage.style.opacity = '1';
            if (pageId === 'cart') renderCartPage();
            else if (pageId === 'profile') renderProfilePage();
            else if (pageId === 'checkout') renderCheckoutPage();
            else if (pageId === 'catalog') renderCatalogInterface();
            updateSearchVisibility(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function openMobileMenu() {
        let mobileMenu = document.getElementById('mobileMenu');
        let overlay = document.getElementById('menuOverlay');
        if (mobileMenu && overlay) {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        let mobileMenu = document.getElementById('mobileMenu');
        let overlay = document.getElementById('menuOverlay');
        if (mobileMenu && overlay) {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function scrollToHero() {
        let hero = document.getElementById('heroSection');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function scrollToCatalog() {
        let el = document.getElementById('catalogSection');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openModal(modalId) {
        let modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        let modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function initMobileSearch() {
        let mobileSearchBtn = document.getElementById('mobileSearchBtn');
        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openModal('modalSearch');
            });
        }
    }

    function mobileSearchSubmit() {
        let query = document.getElementById('mobileSearchInput').value;
        if (document.getElementById('searchInput')) document.getElementById('searchInput').value = query;
        searchProducts();
        closeModal('modalSearch');
    }

    function initStickyFilter() {
        let filterSection = document.querySelector('.filter-section');
        let catalogSection = document.getElementById('catalogSection');
        if (!filterSection || !catalogSection) return;
        let headerHeight = 75, filterOriginalTop = 0;
        function updateFilterTop() {
            let rect = catalogSection.getBoundingClientRect();
            filterOriginalTop = rect.top + window.scrollY + 48;
        }
        updateFilterTop();
        window.addEventListener('resize', updateFilterTop);
        function checkSticky() {
            let scrollY = window.scrollY;
            let shouldStick = scrollY + headerHeight > filterOriginalTop;
            if (shouldStick) {
                if (!filterSection.classList.contains('sticky')) filterSection.classList.add('sticky');
            } else {
                if (filterSection.classList.contains('sticky')) filterSection.classList.remove('sticky');
            }
        }
        window.addEventListener('scroll', checkSticky);
        checkSticky();
    }

    document.getElementById('burgerBtn')?.addEventListener('click', openMobileMenu);
    document.getElementById('closeMenuBtn')?.addEventListener('click', closeMobileMenu);
    document.getElementById('menuOverlay')?.addEventListener('click', closeMobileMenu);
    document.getElementById('heroCatalogBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToCatalog();
    });

    let searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchProducts();
            }
        });
    }

    window.addToCart = addToCart;
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.proceedToCheckout = proceedToCheckout;
    window.placeOrder = placeOrder;
    window.login = login;
    window.register = register;
    window.logout = logout;
    window.searchProducts = searchProducts;
    window.switchTabWithAnimation = switchTabWithAnimation;
    window.onlyNumbers = onlyNumbers;
    window.onlyLetters = onlyLetters;
    window.formatPhone = formatPhone;
    window.closeMobileMenu = closeMobileMenu;
    window.setCategory = setCategory;
    window.scrollToHero = scrollToHero;
    window.scrollToCatalog = scrollToCatalog;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.startEditProfile = startEditProfile;
    window.cancelEdit = cancelEdit;
    window.saveProfile = saveProfile;
    window.deleteAllUserData = deleteAllUserData;
    window.mobileSearchSubmit = mobileSearchSubmit;
    window.initStickyFilter = initStickyFilter;
    window.initMobileSearch = initMobileSearch;
    window.showPage = showPage;

    document.addEventListener('DOMContentLoaded', () => {
        renderCatalogInterface();
        updateCartCount();
        setTimeout(() => { initStickyFilter(); }, 100);
        initMobileSearch();
        updateSearchVisibility('catalog');
    });
})();