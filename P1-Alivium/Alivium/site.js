"use strict";

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const contactForm = document.querySelector("#form-contato");

if (contactForm instanceof HTMLFormElement) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("nome")).trim();
    const email = String(formData.get("email")).trim();
    const message = String(formData.get("mensagem")).trim();
    const subject = encodeURIComponent(`Mensagem pelo site - ${name}`);
    const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`);

    window.location.href = `mailto:contato@alivium.com.br?subject=${subject}&body=${body}`;
  });
}

const profilePanels = document.querySelector(".perfil-paineis");
const profileTabs = Array.from(document.querySelectorAll("[data-auth-target]"));

if (profilePanels instanceof HTMLElement && profileTabs.length > 0) {
  const panels = Array.from(profilePanels.querySelectorAll(".perfil-painel"));

  const selectProfile = (panelId) => {
    profileTabs.forEach((tab) => {
      const isSelected = tab.getAttribute("data-auth-target") === panelId;
      tab.classList.toggle("ativo", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
    });
  };

  profileTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panelIndex = panels.findIndex((panel) => panel.id === tab.getAttribute("data-auth-target"));
      if (panelIndex >= 0) {
        selectProfile(panels[panelIndex].id);
        profilePanels.scrollTo({
          left: panelIndex * profilePanels.clientWidth,
          behavior: "auto",
        });
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          selectProfile(entry.target.id);
        }
      });
    }, { root: profilePanels, threshold: 0.6 });

    panels.forEach((panel) => panelObserver.observe(panel));
  }
}

document.querySelectorAll("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    const formId = button.getAttribute("data-auth-mode");
    const modeGroup = button.closest(".auth-mode");
    const authCard = button.closest(".auth-card");
    if (!formId || !modeGroup || !authCard) {
      return;
    }

    modeGroup.querySelectorAll("[data-auth-mode]").forEach((modeButton) => {
      const isSelected = modeButton === button;
      modeButton.classList.toggle("ativo", isSelected);
      modeButton.setAttribute("aria-selected", String(isSelected));
    });

    authCard.querySelectorAll(".auth-form").forEach((form) => {
      form.hidden = form.id !== formId;
    });
  });
});

document.querySelectorAll(".auth-form").forEach((form) => {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const validatePasswordConfirmation = () => {
    const password = form.querySelector('input[name="senha"]');
    const confirmation = form.querySelector('input[name="confirmacao"]');
    if (password instanceof HTMLInputElement && confirmation instanceof HTMLInputElement) {
      confirmation.setCustomValidity(
        confirmation.value && password.value !== confirmation.value ? "As senhas não coincidem." : "",
      );
    }
  };

  form.querySelectorAll('input[name="senha"], input[name="confirmacao"]').forEach((input) => {
    input.addEventListener("input", validatePasswordConfirmation);
  });

  const proofInput = form.querySelector("#profissional-comprovante");
  if (proofInput instanceof HTMLInputElement) {
    proofInput.addEventListener("change", () => {
      const file = proofInput.files?.[0];
      proofInput.setCustomValidity(
        file && file.size > 5 * 1024 * 1024 ? "O comprovante deve ter no máximo 5 MB." : "",
      );
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".auth-status");
    if (status instanceof HTMLElement) {
      status.textContent = "Demonstração: nenhum dado foi enviado ou salvo. A autenticação estará disponível quando o site tiver um backend seguro.";
    }
  });
});
