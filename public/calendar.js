const datepicker = document.querySelector(".datepicker");
const dateInput = document.querySelector("#dob");
const yearInput = datepicker.querySelector(".year-input");
const monthInput = datepicker.querySelector(".month-input");
const applyBtn = datepicker.querySelector(".apply");
const nextBtn = datepicker.querySelector(".next");
const prevBtn = datepicker.querySelector(".prev");
const dates = datepicker.querySelector(".dates");

let selectedDate = null;
let year = new Date().getFullYear();
let month = new Date().getMonth();

// Initialize with empty value and placeholder
dateInput.value = "";
dateInput.placeholder = "mm/dd/yyyy";

dateInput.addEventListener("focus", (e) => {
  e.preventDefault();
  datepicker.hidden = false;
  
  // Set to current date if no date is selected
  if (!dateInput.value) {
    const today = new Date();
    selectedDate = today;
    year = today.getFullYear();
    month = today.getMonth();
    displayDates();
    
    // Find today's button and select it
    const buttons = dates.querySelectorAll("button:not([disabled])");
    buttons.forEach(button => {
      if (button.classList.contains("today")) {
        button.classList.add("selected");
      }
    });
  }
  
  dateInput.blur();
});

document.addEventListener("click", (e) => {
  const datepickerContainer = datepicker.parentNode;
  if (!datepickerContainer.contains(e.target) && e.target !== dateInput) {
    datepicker.hidden = true;
  }
});

applyBtn.style.display = "none";

nextBtn.addEventListener("click", () => {
  if (month === 11) year++;
  month = (month + 1) % 12;
  displayDates();
});

prevBtn.addEventListener("click", () => {
  if (month === 0) year--;
  month = (month - 1 + 12) % 12;
  displayDates();
});

monthInput.addEventListener("change", () => {
  month = monthInput.selectedIndex;
  displayDates();
});

yearInput.addEventListener("change", () => {
  const newYear = parseInt(yearInput.value, 10) || new Date().getFullYear();
  year = Math.min(2100, Math.max(1900, newYear));
  yearInput.value = year;
  displayDates();
});

const updateYearMonth = () => {
  monthInput.selectedIndex = month;
  yearInput.value = year;
};

const handleDateClick = (e) => {
  const button = e.target;

  const selected = dates.querySelector(".selected");
  selected && selected.classList.remove("selected");

  button.classList.add("selected");

  selectedDate = new Date(year, month, parseInt(button.textContent));
  
  const formattedDate = `${String(month + 1).padStart(2, '0')}/${String(button.textContent).padStart(2, '0')}/${year}`;
  dateInput.value = formattedDate;
  
  setTimeout(() => {
    datepicker.hidden = true;
  }, 200);
};

const displayDates = () => {
  updateYearMonth();
  dates.innerHTML = "";

  const lastOfPrevMonth = new Date(year, month, 0);
  for (let i = 0; i <= lastOfPrevMonth.getDay(); i++) {
    if (lastOfPrevMonth.getDay() === 6) break;
    const text = lastOfPrevMonth.getDate() - lastOfPrevMonth.getDay() + i;
    const button = createButton(text, true);
    dates.appendChild(button);
  }

  const lastOfMonth = new Date(year, month + 1, 0);
  for (let i = 1; i <= lastOfMonth.getDate(); i++) {
    const button = createButton(i, false);
    button.addEventListener("click", handleDateClick);
    dates.appendChild(button);
  }

  const firstOfNextMonth = new Date(year, month + 1, 1);
  for (let i = firstOfNextMonth.getDay(); i < 7; i++) {
    if (firstOfNextMonth.getDay() === 0) break;
    const text = firstOfNextMonth.getDate() - firstOfNextMonth.getDay() + i;
    const button = createButton(text, true);
    dates.appendChild(button);
  }
};

const createButton = (text, isDisabled = false) => {
  const button = document.createElement("button");
  button.type = "button";  // <--- Added this line
  button.textContent = text;
  button.disabled = isDisabled;
  if (!isDisabled) {
    const buttonDate = new Date(year, month, text).toDateString();
    const today = buttonDate === new Date().toDateString();
    const selected = selectedDate && buttonDate === selectedDate.toDateString();

    button.classList.toggle("today", today);
    button.classList.toggle("selected", selected);
  }
  return button;
};

displayDates();
