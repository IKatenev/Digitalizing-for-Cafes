class FormHandler {
  constructor(formElement) {
    this.form = formElement;
    this.message = null;
    this.endpoint = this.form.dataset.endpoint || "";
    this.submitting = false;
    this.bindEvents();
    this.updateSubmitButton();
  }

  bindEvents() {
    this.form.addEventListener("input", () => {
      this.updateSubmitButton();
      this.message?.remove();
      this.message = null;
    });
    this.form.addEventListener("change", () => this.updateSubmitButton());

    for (const name of ["phone", "email", "name"]) {
      const input = this.form.elements.namedItem(name);
      input.addEventListener("blur", () => {
        if (input.value.trim()) {
          this.validateField(input);
        }
      });
    }

    this.form.addEventListener("submit", (event) => this.handleSubmit(event));
  }

  updateSubmitButton() {
    this.form.querySelector(".form__submit").disabled =
      this.submitting || !this.form.elements.namedItem("agreement").checked;
  }

  validateField(input) {
    const value = input.value.trim();
    let valid = value.length > 0;

    if (input.name === "phone") {
      const compact = value.replace(/[\s().-]/g, "");
      const national = compact.replace(/^(?:\+44|0044)(?:0)?/, "0");
      valid = /^0[12378]\d{8,9}$/.test(national);
    } else if (input.name === "email") {
      valid = value.length > 0 && input.validity.valid;
    }

    input.setAttribute("aria-invalid", String(!valid));
    input.closest(".form__field").classList.toggle("form__field--error", !valid);
    return valid;
  }

  showFormMessage(type, text) {
    this.message?.remove();
    this.message = document.createElement("p");
    this.message.className = `form__message form__message--${type}`;
    this.message.setAttribute("role", type === "error" ? "alert" : "status");
    this.message.textContent = text;
    this.form.appendChild(this.message);
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.submitting) {
      return;
    }

    if (this.form.elements.namedItem("website").value.trim()) {
      return;
    }

    const fields = ["phone", "email", "name"].map((name) => this.form.elements.namedItem(name));
    const invalidFields = fields.filter((input) => !this.validateField(input));

    if (invalidFields.length) {
      this.showFormMessage(
        "error",
        "Please enter your name, a valid email address and a UK phone number, such as 07700 900123 or +44 7700 900123.",
      );
      invalidFields[0].focus();
      return;
    }

    if (!this.form.elements.namedItem("agreement").checked) {
      this.showFormMessage("error", "Please tick the privacy acknowledgement.");
      return;
    }

    if (!this.endpoint) {
      this.showFormMessage(
        "success",
        "Your details are valid. This is a demo: your enquiry has not been sent or stored.",
      );
      return;
    }
    this.submitting = true;
    this.form.setAttribute("aria-busy", "true");
    this.form.querySelector(".form__submit-text").hidden = true;
    this.form.querySelector(".form__submit-loader").hidden = false;
    this.updateSubmitButton();
    const data = Object.fromEntries(fields.map((input) => [input.name, input.value.trim()]));
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, agreement: true, website: "" }),
        signal: AbortSignal.timeout(12000),
        credentials: "omit",
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Your enquiry could not be delivered. Please try again later.",
        );
      }
      this.showFormMessage("success", result.message);
      this.form.reset();
    } catch (error) {
      this.showFormMessage(
        "error",
        error instanceof TypeError || error.name === "TimeoutError"
          ? "Unable to reach the enquiry service. Please try again later."
          : error.message,
      );
    } finally {
      this.submitting = false;
      this.form.setAttribute("aria-busy", "false");
      this.form.querySelector(".form__submit-text").hidden = false;
      this.form.querySelector(".form__submit-loader").hidden = true;
      this.updateSubmitButton();
    }
  }
}

export function initForm() {
  const form = document.querySelector(".form__fields");
  if (form) {
    new FormHandler(form);
  }
}
