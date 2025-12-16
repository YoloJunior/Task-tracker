// Калькулятор прямокутника
const rectLength = document.getElementById('rectLength');
const rectWidth = document.getElementById('rectWidth');

const resPerimeter = document.getElementById('resPerimeter');
const resArea = document.getElementById('resArea');
const resDiagonal = document.getElementById('resDiagonal');

function calculateRectangle() {
    const l = parseFloat(rectLength.value);
    const w = parseFloat(rectWidth.value);

    // Перевіряємо чи введені додатні числа
    if (l > 0 && w > 0) {
        const P = 2 * (l + w);
        const S = l * w;
        const D = Math.sqrt(l**2 + w**2);

        resPerimeter.innerText = P.toFixed(2);
        resArea.innerText = S.toFixed(2);
        resDiagonal.innerText = D.toFixed(2);
    } else {
        resPerimeter.innerText = "-";
        resArea.innerText = "-";
        resDiagonal.innerText = "-";
    }
}

// Обчислення при зміні значень
rectLength.addEventListener('input', calculateRectangle);
rectWidth.addEventListener('input', calculateRectangle);


// Функція відправки повідомлень у чат
function sendMessage(userNum) {
    const inputId = userNum === 1 ? 'msgUser1' : 'msgUser2';
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    const chatWindow = document.getElementById('chatWindow');

    if (text !== "") {
        // Видаляємо placeholder при першому повідомленні
        const placeholder = chatWindow.querySelector('.chat-placeholder');
        if (placeholder) placeholder.remove();

        // Створюємо елемент повідомлення
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(userNum === 1 ? 'msg-left' : 'msg-right');

        const senderName = userNum === 1 ? 'User 1:' : 'User 2:';
        msgDiv.innerHTML = `<strong>${senderName}</strong> ${text}`;

        chatWindow.appendChild(msgDiv);

        // Прокручуємо чат вниз
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Очищаємо поле введення
        input.value = "";
    }
}


// Транслітерація українського тексту в латиницю
const ukrText = document.getElementById('ukrText');
const engText = document.getElementById('engText');

// Таблиця відповідностей літер
const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
    'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E',
    'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y',
    'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
    'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
};

function transliterate(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        result += translitMap[char] !== undefined ? translitMap[char] : char;
    }
    return result;
}

ukrText.addEventListener('input', function() {
    engText.value = transliterate(this.value);
});


// Форма реєстрації з валідацією
const registerForm = document.getElementById('registerForm');
if (registerForm) {

    let registeredUsers = [];

    // Маска для телефону (використовуємо IMask)
    const phoneInput = document.getElementById('phoneNumber');
    const phoneMask = IMask(phoneInput, {
        mask: '+38(0{00}) -{000}-{00}-{00}',
        lazy: false
    });

    // Правила перевірки полів
    const validationRules = {
        email: {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Введіть коректний email'
        },
        password: {
            test: (value) => value.length >= 6,
            message: 'Пароль повинен містити мінімум 6 символів'
        },
        firstName: {
            test: (value) => value.trim().length >= 2,
            message: "Ім'я повинно містити мінімум 2 символи"
        },
        lastName: {
            test: (value) => value.trim().length >= 2,
            message: 'Прізвище повинно містити мінімум 2 символи'
        },
        birthDate: {
            test: (value) => value !== '',
            message: 'Оберіть дату народження'
        },
        userRole: {
            test: (value) => value !== '',
            message: 'Оберіть роль'
        },
        phoneNumber: {
            test: () => {
                const unmaskedValue = phoneMask.unmaskedValue;
                return unmaskedValue.length === 12;
            },
            message: 'Введіть повний номер телефону'
        },
        gender: {
            test: () => document.querySelector('input[name="gender"]:checked') !== null,
            message: 'Оберіть стать'
        }
    };

    // Показати помилку під полем
    function showError(inputId, message) {
        const inputGroup = document.getElementById(inputId)?.closest('.input-group') ||
                          document.querySelector('.gender-group');
        if (inputGroup) {
            inputGroup.classList.add('error');
            const errorMsg = inputGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = message;
            }
        }
    }

    // Приховати помилку
    function hideError(inputId) {
        const inputGroup = document.getElementById(inputId)?.closest('.input-group') ||
                          document.querySelector('.gender-group');
        if (inputGroup) {
            inputGroup.classList.remove('error');
            const errorMsg = inputGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = '';
            }
        }
    }

    // Валідація в реальному часі при введенні
    Object.keys(validationRules).forEach(fieldId => {
        if (fieldId === 'gender') {
            const radios = document.querySelectorAll('input[name="gender"]');
            radios.forEach(radio => {
                radio.addEventListener('change', () => hideError('gender'));
            });
        } else {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    const rule = validationRules[fieldId];
                    const value = field.value;

                    if (value === '' || rule.test(value)) {
                        hideError(fieldId);
                    } else {
                        showError(fieldId, rule.message);
                    }
                });

                // Для select і date слухаємо також подію change
                if (field.tagName === 'SELECT' || field.type === 'date') {
                    field.addEventListener('change', () => {
                        const rule = validationRules[fieldId];
                        const value = field.value;

                        if (value !== '' && rule.test(value)) {
                            hideError(fieldId);
                        }
                    });
                }
            }
        }
    });

    // Відправка форми
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        let isValid = true;

        // Перевіряємо всі поля
        Object.keys(validationRules).forEach(fieldId => {
            const rule = validationRules[fieldId];
            let value;

            if (fieldId === 'gender') {
                const checked = document.querySelector('input[name="gender"]:checked');
                value = checked ? checked.value : '';
            } else {
                const field = document.getElementById(fieldId);
                value = field ? field.value : '';
            }

            if (!rule.test(value)) {
                showError(fieldId, rule.message);
                isValid = false;
            }
        });

        // Якщо все валідно - додаємо користувача
        if (isValid) {
            const userData = {
                id: Date.now(),
                email: document.getElementById('email').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                birthDate: document.getElementById('birthDate').value,
                userRole: document.getElementById('userRole').value,
                phoneNumber: phoneInput.value,
                gender: document.querySelector('input[name="gender"]:checked').value
            };

            registeredUsers.push(userData);
            updateUsersTable();

            // Очищаємо форму після успішної реєстрації
            registerForm.reset();
            phoneMask.value = '';

            // Показуємо таблицю
            const tableWrapper = document.getElementById('usersTableWrapper');
            if (tableWrapper) {
                tableWrapper.style.display = 'block';
            }

            // Плавно прокручуємо до таблиці
            tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Оновлення таблиці користувачів
    function updateUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        registeredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.id = user.id;

            row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox"></td>
                <td>${user.email}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.birthDate}</td>
                <td>${user.userRole}</td>
                <td>${user.phoneNumber}</td>
                <td>${user.gender}</td>
            `;

            tbody.appendChild(row);
        });

        updateCheckboxListeners();
    }

    // Налаштування чекбоксів і кнопок дій
    function updateCheckboxListeners() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        const duplicateBtn = document.getElementById('duplicateBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        // Чекбокс "Вибрати всі"
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function() {
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                    updateRowSelection(checkbox);
                });
                updateActionButtons();
            });
        }

        // Чекбокси окремих рядків
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateRowSelection(this);
                updateActionButtons();

                // Оновлюємо стан головного чекбокса
                if (selectAllCheckbox) {
                    const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allChecked;
                }
            });
        });

        // Підсвітка вибраного рядка
        function updateRowSelection(checkbox) {
            const row = checkbox.closest('tr');
            if (checkbox.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        }

        // Вмикаємо/вимикаємо кнопки в залежності від вибору
        function updateActionButtons() {
            const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;

            if (duplicateBtn) duplicateBtn.disabled = checkedCount === 0;
            if (deleteBtn) deleteBtn.disabled = checkedCount === 0;
        }

        // Дублювання вибраних рядків
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', function() {
                const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
                const usersToDuplicate = [];

                selectedCheckboxes.forEach(checkbox => {
                    const row = checkbox.closest('tr');
                    const userId = parseInt(row.dataset.id);
                    const user = registeredUsers.find(u => u.id === userId);

                    if (user) {
                        usersToDuplicate.push({
                            ...user,
                            id: Date.now() + Math.random()
                        });
                    }
                });

                registeredUsers.push(...usersToDuplicate);
                updateUsersTable();

                if (selectAllCheckbox) selectAllCheckbox.checked = false;
            });
        }

        // Видалення вибраних рядків
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
                const userIdsToDelete = [];

                selectedCheckboxes.forEach(checkbox => {
                    const row = checkbox.closest('tr');
                    const userId = parseInt(row.dataset.id);
                    userIdsToDelete.push(userId);
                });

                registeredUsers = registeredUsers.filter(user => !userIdsToDelete.includes(user.id));
                updateUsersTable();

                // Ховаємо таблицю якщо користувачів не залишилось
                if (registeredUsers.length === 0) {
                    const tableWrapper = document.getElementById('usersTableWrapper');
                    if (tableWrapper) tableWrapper.style.display = 'none';
                }

                if (selectAllCheckbox) selectAllCheckbox.checked = false;
            });
        }
    }
}
