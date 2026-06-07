const profile = {
  topText: "єДокумент",
  birthDate: "15.05.2011",
  profileId: "4008426713",
  nameLines: ["Голубєв", "Михайло", "Олексійович"],
};

const topText = document.getElementById("topText");
const birthDate = document.getElementById("birthDate");
const profileId = document.getElementById("profileId");
const nameLines = document.getElementById("nameLines");
const carousel = document.getElementById("carousel");
const cardTrack = document.getElementById("cardTrack");
const cards = [...document.querySelectorAll(".document-card")];
const dots = [...document.querySelectorAll("#pagination span")];

let activeIndex = 0;
let startX = 0;
let dragX = 0;
let isDragging = false;
let didDrag = false;
let settleTimer = 0;

topText.textContent = profile.topText;
birthDate.textContent = profile.birthDate;
profileId.textContent = profile.profileId;
nameLines.innerHTML = profile.nameLines
  .map((line) => `<span>${line.trim() || "&nbsp;"}</span>`)
  .join("");

function renderCarousel() {
  const step = getCardStep();
  const trackX = activeIndex * step * -1 + dragX;
  const virtualIndex = activeIndex - dragX / step;
  const tickerIndex = Math.max(0, Math.min(cards.length - 1, Math.round(virtualIndex)));

  cardTrack.style.transform = `translate3d(${trackX}px, 0, 0)`;

  cards.forEach((card, index) => {
    const distance = Math.min(Math.abs(index - virtualIndex), 1);
    const scale = 1 - distance * 0.1;
    const opacity = 1 - distance * 0.28;

    card.style.transform = `scale(${scale.toFixed(3)})`;
    card.style.opacity = opacity.toFixed(3);
    card.classList.toggle("is-active", index === activeIndex);
    card.classList.toggle("is-prev", index === activeIndex - 1);
    card.classList.toggle("is-next", index === activeIndex + 1);
    card.classList.toggle("ticker-visible", index === tickerIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === activeIndex);
  });

  window.carouselDebug = { activeIndex, dragX, isDragging, tickerIndex, step, trackX };
}

function getCardStep() {
  const firstCard = cards[0];
  const styles = window.getComputedStyle(firstCard);
  const width = Number.parseFloat(styles.width) || firstCard.offsetWidth;
  const marginRight = Number.parseFloat(styles.marginRight) || 0;
  return width + marginRight;
}

function finishDrag() {
  if (!isDragging) return;

  carousel.classList.remove("dragging");

  const threshold = Math.min(92, window.innerWidth * 0.18);
  if (dragX < -threshold && activeIndex < cards.length - 1) {
    activeIndex += 1;
  } else if (dragX > threshold && activeIndex > 0) {
    activeIndex -= 1;
  }

  dragX = 0;
  isDragging = false;
  renderCarousel();
  scheduleSettledSnap();

  window.setTimeout(() => {
    didDrag = false;
  }, 0);
}

function scheduleSettledSnap() {
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    if (isDragging) return;

    carousel.classList.add("settling-snap");
    dragX = 0;
    renderCarousel();
    carousel.offsetWidth;

    window.requestAnimationFrame(() => {
      carousel.classList.remove("settling-snap");
    });
  }, 760);
}

carousel.addEventListener("pointerdown", (event) => {
  if (event.button !== undefined && event.button !== 0) return;

  isDragging = true;
  window.clearTimeout(settleTimer);
  didDrag = false;
  startX = event.clientX;
  dragX = 0;
  carousel.classList.add("dragging");
  carousel.setPointerCapture(event.pointerId);
});

carousel.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  const rawDrag = event.clientX - startX;
  const atStart = activeIndex === 0 && rawDrag > 0;
  const atEnd = activeIndex === cards.length - 1 && rawDrag < 0;
  dragX = atStart || atEnd ? 0 : rawDrag;
  didDrag = Math.abs(dragX) > 7;
  renderCarousel();
});

carousel.addEventListener("pointerup", finishDrag);
carousel.addEventListener("pointercancel", finishDrag);
carousel.addEventListener("lostpointercapture", finishDrag);
window.addEventListener("pointerup", finishDrag);

carousel.addEventListener("click", (event) => {
  if (didDrag) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

renderCarousel();

window.addEventListener("resize", renderCarousel);