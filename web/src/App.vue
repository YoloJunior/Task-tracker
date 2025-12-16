<template>
  <div id="app">
    <div class="auth-page">
      <div class="auth-box">
        <h2 class="auth-title">Ласкаво просимо, Maggot</h2>
        <p class="auth-subtitle">Зареєструйся, щоб отримати доступ до ексклюзиву.</p>

        <form @submit.prevent="handleSubmit" class="auth-form register-form">
          <!-- Email and Password -->
          <div class="form-grid">
            <div class="input-group full-width" :class="{ error: errors.email }">
              <i class="fa-solid fa-at input-icon"></i>
              <input
                type="email"
                v-model="formData.email"
                @input="validateField('email')"
                placeholder="Email"
                required
              >
              <span class="error-message">{{ errors.email }}</span>
            </div>

            <div class="input-group full-width" :class="{ error: errors.password }">
              <i class="fa-solid fa-key input-icon"></i>
              <input
                type="password"
                v-model="formData.password"
                @input="validateField('password')"
                placeholder="Придумайте пароль"
                required
              >
              <span class="error-message">{{ errors.password }}</span>
            </div>
          </div>

          <hr class="form-divider">

          <!-- Personal Info Grid -->
          <div class="form-grid">
            <div class="input-group" :class="{ error: errors.firstName }">
              <i class="fa-solid fa-user input-icon"></i>
              <input
                type="text"
                v-model="formData.firstName"
                @input="validateField('firstName')"
                placeholder="Ім'я"
                required
              >
              <span class="error-message">{{ errors.firstName }}</span>
            </div>

            <div class="input-group" :class="{ error: errors.lastName }">
              <i class="fa-regular fa-user input-icon"></i>
              <input
                type="text"
                v-model="formData.lastName"
                @input="validateField('lastName')"
                placeholder="Прізвище"
                required
              >
              <span class="error-message">{{ errors.lastName }}</span>
            </div>

            <div class="input-group" :class="{ error: errors.birthDate }">
              <i class="fa-solid fa-cake-candles input-icon"></i>
              <input
                type="date"
                v-model="formData.birthDate"
                @change="validateField('birthDate')"
                placeholder="Дата народження"
                required
              >
              <span class="error-message">{{ errors.birthDate }}</span>
            </div>

            <div class="input-group" :class="{ error: errors.userRole }">
              <i class="fa-solid fa-users input-icon"></i>
              <select
                v-model="formData.userRole"
                @change="validateField('userRole')"
                required
              >
                <option value="" disabled>Ваша роль</option>
                <option>Фанат</option>
                <option>Музикант</option>
                <option>Організатор</option>
              </select>
              <span class="error-message">{{ errors.userRole }}</span>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="input-group full-width" :class="{ error: errors.phoneNumber }">
            <i class="fa-solid fa-phone input-icon"></i>
            <input
              type="text"
              ref="phoneInput"
              placeholder="Номер телефону +38(0__) -___-__-__"
              required
            >
            <span class="error-message">{{ errors.phoneNumber }}</span>
          </div>

          <!-- Gender Radio Buttons -->
          <div class="input-group full-width gender-group" :class="{ error: errors.gender }">
            <label class="gender-label">
              <i class="fa-solid fa-venus-mars"></i> Стать:
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formData.gender"
                  @change="validateField('gender')"
                  value="Чоловік"
                  required
                >
                <span>Чоловік</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formData.gender"
                  @change="validateField('gender')"
                  value="Жінка"
                  required
                >
                <span>Жінка</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formData.gender"
                  @change="validateField('gender')"
                  value="Інше"
                  required
                >
                <span>Інше</span>
              </label>
            </div>
            <span class="error-message">{{ errors.gender }}</span>
          </div>

          <button type="submit" class="btn-hero btn-full">Зареєструватися</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import IMask from 'imask'

// Стан форми
const formData = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  userRole: '',
  gender: ''
})

// Помилки валідації
const errors = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  userRole: '',
  phoneNumber: '',
  gender: ''
})

// Посилання на елементи
const phoneInput = ref(null)
let phoneMask = null

// Правила валідації
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
      if (!phoneMask) return false
      return phoneMask.unmaskedValue.length === 12
    },
    message: 'Введіть повний номер телефону'
  },
  gender: {
    test: (value) => value !== '',
    message: 'Оберіть стать'
  }
}

// Валідація одного поля
const validateField = (fieldName) => {
  const rule = validationRules[fieldName]
  let value

  if (fieldName === 'phoneNumber') {
    value = phoneMask?.value || ''
  } else {
    value = formData[fieldName]
  }

  if (value === '' || rule.test(value)) {
    errors[fieldName] = ''
  } else {
    errors[fieldName] = rule.message
  }
}

// Валідація всіх полів
const validateAllFields = () => {
  let isValid = true

  Object.keys(validationRules).forEach(fieldName => {
    const rule = validationRules[fieldName]
    let value

    if (fieldName === 'phoneNumber') {
      value = phoneMask?.value || ''
    } else {
      value = formData[fieldName]
    }

    if (!rule.test(value)) {
      errors[fieldName] = rule.message
      isValid = false
    }
  })

  return isValid
}

// Відправка форми
const handleSubmit = () => {
  if (!validateAllFields()) {
    return
  }

  // Успішна реєстрація
  const userData = {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    birthDate: formData.birthDate,
    userRole: formData.userRole,
    phoneNumber: phoneMask.value,
    gender: formData.gender
  }

  console.log('Користувач зареєстрований:', userData)
  alert('Реєстрація успішна!')

  // Очищення форми
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  phoneMask.value = ''
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

// Ініціалізація маски телефону
onMounted(() => {
  if (phoneInput.value) {
    phoneMask = IMask(phoneInput.value, {
      mask: '+38(0{00}) -{000}-{00}-{00}',
      lazy: false
    })

    phoneMask.on('accept', () => {
      validateField('phoneNumber')
    })
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  --primary: #f97316;
  --primary-hover: #ea580c;
  --bg-dark: #050710;
  --bg-card: #111827;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --border: #1f2937;
  --danger: #ef4444;

  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #050710 0%, #1a1a2e 100%);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
}

/* Контейнер сторінки */
.auth-page {
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

/* Бокс з формою */
.auth-box {
  width: 100%;
  max-width: 600px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.auth-title {
  font-size: 2rem;
  color: white;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.auth-subtitle {
  color: var(--text-muted);
  margin-bottom: 30px;
  font-size: 0.95rem;
}

/* Форма */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.full-width {
  grid-column: span 2;
}

.form-divider {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 5px 0;
}

/* Групи полів з іконками */
.input-group {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: 0.3s;
  pointer-events: none;
  z-index: 1;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  transition: 0.3s;
  outline: none;
  margin: 0;
}

.input-group input:focus,
.input-group select:focus {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
}

.input-group:focus-within .input-icon {
  color: var(--primary);
}

.input-group select {
  cursor: pointer;
}

.input-group select option {
  background: #111827;
  color: white;
}

/* Повідомлення про помилки */
.error-message {
  display: none;
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 5px;
  animation: fadeInScale 0.3s ease;
}

.input-group.error .error-message {
  display: block;
}

.input-group.error input,
.input-group.error select {
  border-color: var(--danger);
}

.input-group.error .input-icon {
  color: var(--danger);
}

/* Радіо кнопки для статі */
.gender-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gender-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
}

.radio-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--border);
  border-radius: 10px;
  transition: all 0.3s;
  color: var(--text-muted);
}

.radio-label:hover {
  border-color: var(--primary);
  background: rgba(249, 115, 22, 0.1);
}

.radio-label input[type="radio"] {
  width: auto;
  margin: 0;
  padding: 0;
  cursor: pointer;
  accent-color: var(--primary);
}

.radio-label:has(input:checked) {
  border-color: var(--primary);
  background: rgba(249, 115, 22, 0.2);
}

.radio-label:has(input:checked) span {
  color: white;
  font-weight: 600;
}

/* Кнопка відправки */
.btn-hero {
  display: inline-block;
  padding: 12px 32px;
  background: transparent;
  color: white;
  border: 2px solid var(--primary);
  border-radius: 50px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
  cursor: pointer;
  font-size: 1rem;
}

.btn-hero:hover {
  background: var(--primary);
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.8);
  transform: translateY(-3px);
}

.btn-full {
  width: 100%;
  margin-top: 10px;
  justify-content: center;
}

/* Анімації */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Адаптив */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .auth-box {
    padding: 25px 20px;
  }

  .auth-title {
    font-size: 1.5rem;
  }
}
</style>
