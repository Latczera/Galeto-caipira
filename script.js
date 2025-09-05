const menuData = {
    "LANCHES EXCLUSIVOS": {
        icon: "🔥",
        items: [
            { 
                name: "MEGA GALETO", 
                price: 29.90, 
                description: "Pão artesanal, frango empanado crocante, bacon defumado, hambúrguer suculento, queijo à sua escolha, alface, tomate, maionese especial.",
                options: [
                    {
                        name: "Queijo",
                        type: "radio",
                        choices: [
                            { name: "Cheddar", price: 0 },
                            { name: "Catupiry", price: 0 },
                            { name: "Muçarela", price: 0 }
                        ],
                        required: true
                    }
                ]
            },
            { name: "MÉDIO GALETO", price: 24.90, description: "Pão artesanal, frango empanado dourado, queijo derretido, alface, tomate, maionese especial." },
            { name: "KID GALETO", price: 16.90, description: "Pão macio, frango empanado, queijo cremoso, maionese suave." }
        ]
    },
    "LANCHES TRADICIONAIS": {
        icon: "🍔",
        items: [
            { name: "X-BURGER", price: 18.90, description: "Hambúrguer artesanal, queijo, maionese." },
            { name: "X-SALADA", price: 20.90, description: "Hambúrguer, queijo, alface crocante, tomate fresco, maionese." },
            { name: "X-BACON", price: 22.90, description: "Hambúrguer suculento, queijo derretido, bacon crocante, maionese." },
            { name: "X-EGG", price: 22.90, description: "Hambúrguer, queijo, ovo frito, alface, tomate, maionese." },
            { name: "X-CALABRESA", price: 21.90, description: "Hambúrguer, queijo, calabresa temperada, cebola refogada, maionese." },
            { name: "X-FRANGO", price: 21.90, description: "Filé de frango empanado, queijo, alface, tomate, maionese." },
            { name: "X-TUDO", price: 29.90, description: "Hambúrguer, calabresa, frango, queijo, presunto, ovo, bacon, alface, tomate, maionese." }
        ]
    },
    "ACOMPANHAMENTOS": {
        icon: "🍟",
        items: [
            { name: "BATATA FRITA MÉDIA", price: 12.90, description: "Batatas douradas e crocantes." },
            { name: "BATATA FRITA GRANDE", price: 18.90, description: "Porção generosa de batatas sequinhas." },
            { name: "BATATA COM CHEDDAR E BACON", price: 22.90, description: "Batatas cobertas com cheddar cremoso e bacon crocante." }
        ]
    },
    "BEBIDAS": {
        icon: "🥤",
        items: [
            { name: "REFRIGERANTE LATA", price: 7.00, description: "" },
            { name: "REFRIGERANTE 2L", price: 14.90, description: "" },
            { name: "ÁGUA MINERAL", price: 4.00, description: "" },
            { name: "SUCO NATURAL", price: 10.00, description: "" }
        ]
    },
};

const WHATSAPP_NUMBER = "5515998400457,";
let cart = [];
let myCombos = JSON.parse(localStorage.getItem('myCombos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const cartEl = document.getElementById('cart');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const cartHeader = document.getElementById('cart-header');
    const saveComboBtn = document.getElementById('save-custom-combo-btn');
    const myCombosList = document.getElementById('my-combos-list');
    const myCombosHeader = document.getElementById('my-combos-header');

    // Modal elements
    const modal = document.getElementById('options-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalItemName = document.getElementById('modal-item-name');
    const modalOptionsContainer = document.getElementById('modal-options');
    const modalItemPrice = document.getElementById('modal-item-price');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');

    // Cart step navigation
    const cartNavButtons = document.querySelectorAll('.cart-nav-btn');
    const reviewOrderBtn = document.getElementById('review-order-btn');


    function renderMenu() {
        menuContainer.innerHTML = '';
        for (const category in menuData) {
            const section = document.createElement('section');
            section.className = 'menu-section';
            section.innerHTML = `<h2>${menuData[category].icon} ${category}</h2>`;

            const grid = document.createElement('div');
            grid.className = 'menu-items-grid';
            
            menuData[category].items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'menu-item';
                const hasOptions = item.options && item.options.length > 0;
                itemEl.innerHTML = `
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                    <div class="item-action">
                        <span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                        <button class="add-to-cart-btn" data-name="${item.name}" data-icon="${menuData[category].icon}">
                            <span class="btn-text">Adicionar</span>
                            <span class="btn-icon"><i class="fas fa-check"></i></span>
                        </button>
                    </div>
                `;
                grid.appendChild(itemEl);

                itemEl.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                    if (hasOptions) {
                        showOptionsModal(item, e.currentTarget);
                    } else {
                        const icon = e.currentTarget.dataset.icon;
                        addToCart(item.name, item.price, '', icon);
                        showAddedFeedback(e.currentTarget);
                    }
                });
            });
            section.appendChild(grid);
            menuContainer.appendChild(section);
        }
    }

    function showAddedFeedback(button) {
        button.classList.add('added');
        setTimeout(() => {
            button.classList.remove('added');
        }, 1500);
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            cartEl.classList.remove('cart-visible');
            // Reset to step 1 if cart becomes empty
            setCartStep(1);
        } else {
            cartEl.classList.add('cart-visible');

            // Sort cart by quantity, descending
            cart.sort((a, b) => b.quantity - a.quantity);

            cart.forEach((item, index) => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                if (item.quantity > 1) {
                    cartItemEl.classList.add('high-quantity');
                }
                
                const itemIcon = item.icon ? `<span class="cart-item-icon">${item.icon}</span>` : '';

                cartItemEl.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${itemIcon}${item.name}</h4>
                        <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (totalItems > 0 && !cartCountEl.classList.contains('pop-animation-played')) {
            cartCountEl.classList.add('pop');
            cartCountEl.addEventListener('animationend', () => {
                cartCountEl.classList.remove('pop');
            }, { once: true });
        }

        cartCountEl.textContent = totalItems;
        cartTotalPriceEl.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        
        // Disable continue button if cart is empty
        const continueBtn = document.querySelector('#cart-step-1 .next-step-btn');
        if (continueBtn) {
            continueBtn.disabled = cart.length === 0;
        }
    }

    function addToCart(name, price, optionsText = '', icon = '🍔') {
        const finalName = optionsText ? `${name} (${optionsText})` : name;
        const existingItem = cart.find(item => item.name === finalName);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name: finalName, price: parseFloat(price), quantity: 1, icon: icon });
        }
        updateCart();
    }

    function updateQuantity(index, action) {
        // Find the actual item in the unsorted cart array to modify
        const sortedCartItems = Array.from(document.querySelectorAll('.cart-item-details h4'));
        if (!sortedCartItems[index]) return;
        
        const itemNameFromDOM = sortedCartItems[index].textContent.replace(/^(🔥|🍔|🍟|🥤)\s*/, '');
        const itemToUpdate = cart.find(item => item.name === itemNameFromDOM);

        if (!itemToUpdate) return;

        if (action === 'increase') {
            itemToUpdate.quantity++;
        } else if (action === 'decrease') {
            itemToUpdate.quantity--;
            if (itemToUpdate.quantity <= 0) {
                cart = cart.filter(item => item.name !== itemToUpdate.name);
            }
        }
        updateCart();
    }

    function renderMyCombos() {
        myCombosList.innerHTML = '';
        if (myCombos.length === 0) {
            myCombosList.innerHTML = '<p>Você ainda não salvou nenhum combo.</p>';
        } else {
            myCombos.forEach((combo, index) => {
                const comboEl = document.createElement('div');
                comboEl.className = 'saved-combo';
                comboEl.innerHTML = `
                    <span>${combo.name}</span>
                    <button class="delete-combo-btn" data-index="${index}"><i class="fas fa-times-circle"></i></button>
                `;
                comboEl.querySelector('span').addEventListener('click', () => addComboToCart(combo));
                myCombosList.appendChild(comboEl);
            });
        }
    }
    
    function addComboToCart(combo) {
        combo.items.forEach(item => {
            const baseItem = findItemInMenuData(item.name.split(' (')[0]);
            if(baseItem) {
                 for(let i = 0; i < item.quantity; i++) {
                    // Re-adding with original name format
                    addToCart(baseItem.name, item.price, item.name.includes('(') ? item.name.split('(')[1].replace(')','') : '');
                }
            }
        });
        if (!cartEl.classList.contains('cart-open')) {
            cartEl.classList.add('cart-open');
        }
        alert(`Combo "${combo.name}" adicionado ao seu pedido!`);
    }

    function findItemInMenuData(name) {
        for(const category in menuData) {
            const found = menuData[category].items.find(item => item.name === name);
            if(found) return found;
        }
        return null;
    }

    function saveMyCombos() {
        localStorage.setItem('myCombos', JSON.stringify(myCombos));
    }

    // --- Cart Step Logic ---
    function setCartStep(step) {
        cartEl.dataset.step = step;
    }

    function generateOrderSummary() {
        const customerName = document.getElementById('customer-name').value.trim();
        const customerStreet = document.getElementById('customer-street').value.trim();
        const customerNumber = document.getElementById('customer-number').value.trim();
        const customerNeighborhood = document.getElementById('customer-neighborhood').value.trim();
        const customerObservations = document.getElementById('customer-observations').value.trim();
        
        const fullAddress = `${customerStreet}, ${customerNumber} - ${customerNeighborhood}`;
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let itemsSummaryHTML = cart.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');

        const summaryContainer = document.getElementById('order-summary');
        summaryContainer.innerHTML = `
            <div class="summary-section">
                <h4><i class="fas fa-user-circle"></i> Cliente</h4>
                <p>${customerName}</p>
            </div>
            <div class="summary-section">
                <h4><i class="fas fa-shipping-fast"></i> Endereço de Entrega</h4>
                <p>${fullAddress}</p>
            </div>
            ${customerObservations ? `
            <div class="summary-section">
                <h4><i class="fas fa-sticky-note"></i> Observações</h4>
                <p>${customerObservations}</p>
            </div>` : ''}
            <div class="summary-section">
                <h4><i class="fas fa-receipt"></i> Itens</h4>
                <ul>${itemsSummaryHTML}</ul>
            </div>
            <div class="summary-section summary-total">
                <h4>Total do Pedido</h4>
                <p>R$ ${totalPrice.toFixed(2).replace('.', ',')}</p>
            </div>
        `;
    }


    // Modal Logic
    let currentItemForModal = null;
    let currentButtonForFeedback = null;

    function showOptionsModal(item, button) {
        currentItemForModal = item;
        currentButtonForFeedback = button;
        modalItemName.textContent = item.name;
        modalItemPrice.textContent = `R$ ${item.price.toFixed(2).replace('.', ',')}`;
        modalOptionsContainer.innerHTML = '';

        item.options.forEach(optionGroup => {
            const groupEl = document.createElement('div');
            groupEl.className = 'option-group';
            let choicesHTML = `<h4>${optionGroup.name}</h4>`;
            optionGroup.choices.forEach((choice, index) => {
                choicesHTML += `
                    <div class="option-choice">
                        <input type="${optionGroup.type}" id="choice-${index}" name="${optionGroup.name}" value="${choice.name}" ${optionGroup.required && index === 0 ? 'checked' : ''}>
                        <label for="choice-${index}">${choice.name}</label>
                    </div>
                `;
            });
            groupEl.innerHTML = choicesHTML;
            modalOptionsContainer.appendChild(groupEl);
        });

        modal.classList.remove('modal-hidden');
        modalBackdrop.classList.remove('modal-hidden');
    }

    function hideOptionsModal() {
        modal.classList.add('modal-hidden');
        modalBackdrop.classList.add('modal-hidden');
    }

    modalAddToCartBtn.addEventListener('click', () => {
        const selectedOptions = [];
        const optionsGroups = modalOptionsContainer.querySelectorAll('.option-group');

        optionsGroups.forEach(group => {
            const checkedInput = group.querySelector('input:checked');
            if (checkedInput) {
                selectedOptions.push(checkedInput.value);
            }
        });

        const optionsText = selectedOptions.join(', ');
        const icon = currentButtonForFeedback.dataset.icon;
        addToCart(currentItemForModal.name, currentItemForModal.price, optionsText, icon);
        showAddedFeedback(currentButtonForFeedback);
        hideOptionsModal();
    });

    modalBackdrop.addEventListener('click', hideOptionsModal);


    // Event Listeners
    myCombosHeader.addEventListener('click', () => {
        myCombosContent.classList.toggle('collapsed');
        myCombosHeader.classList.toggle('collapsed');
    });

    cartItemsContainer.addEventListener('click', e => {
        if (e.target.closest('.quantity-btn')) {
            const button = e.target.closest('.quantity-btn');
            const { index, action } = button.dataset;
            updateQuantity(parseInt(index), action);
        }
    });
    
    myCombosList.addEventListener('click', e => {
        const targetButton = e.target.closest('.delete-combo-btn');
        if (targetButton) {
            const index = parseInt(targetButton.dataset.index);
            if(confirm(`Tem certeza que deseja apagar o combo "${myCombos[index].name}"?`)) {
                myCombos.splice(index, 1);
                saveMyCombos();
                renderMyCombos();
            }
        }
    });

    cartHeader.addEventListener('click', () => {
        cartEl.classList.toggle('cart-open');
    });

    saveComboBtn.addEventListener('click', () => {
        const comboNameInput = document.getElementById('custom-combo-name');
        const comboName = comboNameInput.value.trim();

        if (!comboName) {
            alert('Por favor, dê um nome ao seu combo.');
            return;
        }
        if (cart.length === 0) {
            alert('Adicione itens ao seu pedido antes de salvar como um combo.');
            return;
        }

        const newCombo = {
            name: comboName,
            items: JSON.parse(JSON.stringify(cart)) // Deep copy
        };

        myCombos.push(newCombo);
        saveMyCombos();
        renderMyCombos();
        comboNameInput.value = '';
        alert(`Combo "${comboName}" salvo com sucesso!`);
    });

    cartNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetStep = button.dataset.targetStep;
            setCartStep(targetStep);
        });
    });

    reviewOrderBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customer-name').value.trim();
        const customerStreet = document.getElementById('customer-street').value.trim();
        const customerNumber = document.getElementById('customer-number').value.trim();
        const customerNeighborhood = document.getElementById('customer-neighborhood').value.trim();

        if (!customerName || !customerStreet || !customerNumber || !customerNeighborhood) {
            alert("Por favor, preencha seu nome e endereço completo para continuar.");
            // Prevent moving to the next step
            setCartStep(2); 
            return;
        }
        generateOrderSummary();
    });

    sendOrderBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customer-name').value.trim();
        const customerStreet = document.getElementById('customer-street').value.trim();
        const customerNumber = document.getElementById('customer-number').value.trim();
        const customerNeighborhood = document.getElementById('customer-neighborhood').value.trim();
        const customerObservations = document.getElementById('customer-observations').value.trim();

        // This check is redundant if reviewOrderBtn works, but good for safety
        if (!customerName || !customerStreet || !customerNumber || !customerNeighborhood) {
            alert("Erro: Informações de endereço ausentes. Por favor, volte e preencha.");
            setCartStep(2);
            return;
        }
        
        const fullAddress = `${customerStreet}, ${customerNumber} - ${customerNeighborhood}`;

        let message = `*NOVO PEDIDO - Galeto Caipira*\n\n`;
        message += `*Cliente:* ${customerName}\n`;
        message += `*Endereço:* ${fullAddress}\n`;
        if (customerObservations) {
            message += `*Observações:* ${customerObservations}\n`;
        }
        message += `\n*Itens do Pedido:*\n`;

        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (R$ ${(item.price).toFixed(2).replace('.', ',')} cada)\n`;
        });

        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        message += `\n*Total:* R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    renderMenu();
    updateCart();
    renderMyCombos();
});
