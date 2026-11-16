const galleryFilters = document.querySelectorAll(".filter-button");

if (galleryFilters.length > 0) {
  const galleryCards = document.querySelectorAll(".gallery-card");
  const galleryCount = document.querySelector(".gallery-count");
  const emptyMessage = document.querySelector(".empty-message");

  function filterGallery(category) {
    let visibleCount = 0;

    galleryCards.forEach((card) => {
      const isVisible = category === "all" || card.dataset.category === category;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    galleryCount.textContent = `${visibleCount} ${visibleCount === 1 ? "photo" : "photos"}`;
    emptyMessage.hidden = visibleCount > 0;
  }

  galleryFilters.forEach((button) => {
    button.addEventListener("click", () => {
      galleryFilters.forEach((filter) => {
        const isActive = filter === button;
        filter.classList.toggle("is-active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
      });

      filterGallery(button.dataset.filter);
    });
  });

  filterGallery("all");
}