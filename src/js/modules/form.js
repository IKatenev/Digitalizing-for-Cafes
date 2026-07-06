class FormHandler {
  constructor(formElement) {
    this.form = formElement;
    this.formData = {};
    this.startTime = null;
    this.minFillTime = 1500;
    this.debug = true;

    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+7 \(\d{3}\) \d{3} \d{2}-\d{2}$/,
    };

    this.init();
  }

  // log(...args) {
  //   if (this.debug) {
  //     console.log(...args);
  //   }
  // }

  init() {
    this.bindEvents();
    this.startTime = Date.now();
  }

  bindEvents() {
    this.form.addEventListener(
      "focus",
      () => {
        if (!this.startTime) {
          this.startTime = Date.now();
        }
      },
      true,
    );

    const checkbox = this.form.querySelector("#agreement");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        this.updateSubmitButton();
      });
    }

    this.form.addEventListener("input", (e) => {
      this.collectFormData();
      this.updateSubmitButton();

      if (e.target.id === "phone") {
        this.formatPhone(e.target);
      }
    });

    const phoneInput = this.form.querySelector("#phone");
    const emailInput = this.form.querySelector("#email");

    if (phoneInput) {
      phoneInput.addEventListener("blur", () => {
        if (phoneInput.value.trim()) {
          this.validatePhone();
        }
      });

      phoneInput.addEventListener("focus", () => {
        this.addPhonePrefix(phoneInput);
      });
    }

    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        if (emailInput.value.trim()) {
          this.validateEmail();
        }
      });
    }

    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  formatPhone(input) {
    let value = input.value.replace(/\D/g, "");

    if (value.startsWith("8")) {
      value = "7" + value.slice(1);
    }

    if (!value.startsWith("7")) {
      value = "7" + value;
    }

    value = value.slice(0, 11);

    let formatted = "+7";
    if (value.length > 1) {
      formatted += " (" + value.slice(1, 4);
    }
    if (value.length >= 5) {
      formatted += ") " + value.slice(4, 7);
    }
    if (value.length >= 8) {
      formatted += " " + value.slice(7, 9);
    }
    if (value.length >= 10) {
      formatted += "-" + value.slice(9, 11);
    }

    input.value = formatted;
  }

  addPhonePrefix(input) {
    if (!input.value) {
      input.value = "+7 ";
    }
  }

  validatePhone() {
    const phoneInput = this.form.querySelector("#phone");
    const value = phoneInput.value.trim();
    const isValid = this.patterns.phone.test(value);

    this.toggleFieldError(phoneInput, !isValid);
    return isValid;
  }

  validateEmail() {
    const emailInput = this.form.querySelector("#email");
    const value = emailInput.value.trim();
    const isValid = this.patterns.email.test(value);

    this.toggleFieldError(emailInput, !isValid);
    return isValid;
  }

  toggleFieldError(input, hasError) {
    const field = input.closest(".form__field");
    if (!field) {
      return;
    }

    if (hasError) {
      field.classList.add("form__field--error");
    } else {
      field.classList.remove("form__field--error");
    }
  }

  collectFormData() {
    this.formData = {
      phone: this.form.querySelector("#phone")?.value.trim() || "",
      email: this.form.querySelector("#email")?.value.trim() || "",
      name: this.form.querySelector("#name")?.value.trim() || "",
      agreement: this.form.querySelector("#agreement")?.checked || false,
      website: this.form.querySelector("#website")?.value.trim() || "",
    };
  }

  updateSubmitButton() {
    const submitBtn = this.form.querySelector(".form__submit");
    if (!submitBtn) {
      return;
    }
    submitBtn.disabled = !this.formData.agreement;
  }

  validateData() {
    if (this.formData.website) {
      this.log("Обнаружен бот: honeypot заполнен");
      return false;
    }

    const timeSpent = Date.now() - this.startTime;
    if (timeSpent < this.minFillTime) {
      this.log(`Форма заполнена слишком быстро: ${timeSpent}ms`);
      return false;
    }

    if (!this.formData.phone || !this.formData.email || !this.formData.name) {
      this.log("Не все обязательные поля заполнены");
      return false;
    }

    if (!this.validatePhone()) {
      this.log("Некорректный формат телефона");
      return false;
    }

    if (!this.validateEmail()) {
      this.log("Некорректный формат email");
      return false;
    }

    if (!this.formData.agreement) {
      this.log("Не принято соглашение");
      return false;
    }

    return true;
  }

  setSubmitState(isLoading) {
    const submitBtn = this.form.querySelector(".form__submit");
    const textEl = submitBtn?.querySelector(".form__submit-text");
    const loaderEl = submitBtn?.querySelector(".form__submit-loader");

    if (!submitBtn || !textEl || !loaderEl) {
      return;
    }

    if (isLoading) {
      submitBtn.disabled = true;
      textEl.hidden = true;
      loaderEl.hidden = false;
    } else {
      textEl.hidden = false;
      loaderEl.hidden = true;
      this.updateSubmitButton();
    }
  }

  showFormMessage(type, text) {
    const existing = this.form.querySelector(".form__message");
    if (existing) {
      existing.remove();
    }

    const messageEl = document.createElement("div");
    messageEl.className = `form__message form__message--${type}`;
    messageEl.textContent = text;

    this.form.appendChild(messageEl);

    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }

  async handleSubmit(e) {
    e.preventDefault();

    this.collectFormData();

    if (!this.validateData()) {
      return;
    }

    this.log("Данные формы для отправки:", this.formData);

    this.setSubmitState(true);

    try {
      const formData = new FormData();
      formData.append("phone", this.formData.phone);
      formData.append("email", this.formData.email);
      formData.append("name", this.formData.name);
      formData.append("agreement", this.formData.agreement ? "1" : "0");
      formData.append("website", this.formData.website);

      const response = await fetch("telegram.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showFormMessage("success", result.message);
        this.log("Успешная отправка:", result);
        this.resetForm();
      } else {
        this.showFormMessage("error", result.message);
        this.log("Ошибка:", result);
      }
    } catch (error) {
      this.showFormMessage("error", "Ошибка соединения. Проверьте интернет.");
      this.log("Ошибка сети:", error);
    } finally {
      this.setSubmitState(false);
    }
  }

  resetForm() {
    this.form.reset();
    this.formData = {};
    this.startTime = Date.now();

    const errorFields = this.form.querySelectorAll(".form__field--error");
    errorFields.forEach((field) => field.classList.remove("form__field--error"));

    this.updateSubmitButton();
  }
}

export function initForm() {
  const form = document.querySelector(".form__fields");
  if (form) {
    new FormHandler(form);
  }
}
