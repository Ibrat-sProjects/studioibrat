const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const sections = document.querySelectorAll("section[id]");
const reveals = document.querySelectorAll(".reveal");
const lazyImages = document.querySelectorAll(".lazy-img");
const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxStage = document.querySelector("[data-lightbox-stage]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const lightboxCounter = document.querySelector("[data-lightbox-counter]");
const backToTop = document.querySelector("[data-back-to-top]");

let lightboxIndex = 0;
let visibleGalleryItems = [];

const setHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
  backToTop.classList.toggle("visible", window.scrollY > 420);
};

setHeader();
window.addEventListener("scroll", setHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

reveals.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

lazyImages.forEach((image) => {
  const markLoaded = () => image.classList.add("loaded");

  if (image.complete && image.naturalWidth > 0) {
    markLoaded();
    return;
  }

  image.addEventListener("load", markLoaded, { once: true });
  image.addEventListener("error", markLoaded, { once: true });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 }
);

sections.forEach((section) => sectionObserver.observe(section));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    galleryItems.forEach((item) => {
      const visible = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("hidden", !visible);
    });
  });
});

const getVisibleGalleryItems = () =>
  [...galleryItems].filter((item) => !item.classList.contains("hidden"));

const updateLightboxCounter = () => {
  if (!visibleGalleryItems.length) {
    lightboxCounter.textContent = "";
    return;
  }

  lightboxCounter.textContent = `${lightboxIndex + 1} / ${visibleGalleryItems.length}`;
};

const showLightboxAt = (index) => {
  visibleGalleryItems = getVisibleGalleryItems();
  if (!visibleGalleryItems.length) {
    return;
  }

  lightboxIndex = (index + visibleGalleryItems.length) % visibleGalleryItems.length;
  const item = visibleGalleryItems[lightboxIndex];
  const image = item.querySelector("img");

  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = image.alt;
  updateLightboxCounter();
};

const openLightbox = (item) => {
  visibleGalleryItems = getVisibleGalleryItems();
  lightboxIndex = Math.max(visibleGalleryItems.indexOf(item), 0);
  showLightboxAt(lightboxIndex);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
};

const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  lightboxImage.src = "";
  lightboxCounter.textContent = "";
};

const goToPreviousImage = () => showLightboxAt(lightboxIndex - 1);
const goToNextImage = () => showLightboxAt(lightboxIndex + 1);

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", goToPreviousImage);
lightboxNext.addEventListener("click", goToNextImage);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

let touchStartX = 0;
let touchStartY = 0;

lightboxStage.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  },
  { passive: true }
);

lightboxStage.addEventListener(
  "touchend",
  (event) => {
    const deltaX = event.changedTouches[0].screenX - touchStartX;
    const deltaY = event.changedTouches[0].screenY - touchStartY;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX > 0) {
      goToPreviousImage();
      return;
    }

    goToNextImage();
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    goToPreviousImage();
  }

  if (event.key === "ArrowRight") {
    goToNextImage();
  }
});

// Copy email to clipboard on clicking the mail floating button
const mailFloat = document.querySelector(".mail-float");
if (mailFloat) {
  mailFloat.addEventListener("click", () => {
    navigator.clipboard.writeText("shaikhibrat1003@gmail.com").then(() => {
      const originalText = mailFloat.innerHTML;
      mailFloat.innerHTML = "Copied!";
      mailFloat.classList.add("copied");
      setTimeout(() => {
        mailFloat.innerHTML = originalText;
        mailFloat.classList.remove("copied");
      }, 2000);
    }).catch(err => {
      console.warn("Failed to copy email: ", err);
    });
  });
}
