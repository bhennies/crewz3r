const socket = io();
let cards = [];
let colors = new Set();
let numbers = new Set();

//************************************************************
//        Function Declarations
//************************************************************

// Sends name to server
const emit_name = () => {
  const name = document.querySelector("[name='name']");
  socket.emit("update name", name.value);
};

const update_buttons = (prefix, ids) => {
  let old_elements = document.querySelectorAll(`[id*=${prefix}_]`);

  for (const element of old_elements) {
    element.disabled = true;
  }

  let id;
  for (id of ids) {
    const element = document.getElementById(`${prefix}_${id}`);

    if (element) {
      element.disabled = false;
    } else {
      add_new_button(prefix, id);
    }
  }

  const checked_element = document.querySelector(`[id*=${prefix}_]:checked`);
  if (checked_element && checked_element.disabled === true) {
    checked_element.checked = false;
  }
};

const add_new_button = (prefix, id) => {
  let form = document.querySelector("main").classList.contains("task_selection")
    ? "task_selection"
    : "card_selection";

  const input_element = document.createElement("input");
  input_element.setAttribute("type", "radio");
  input_element.classList.add(prefix);
  input_element.setAttribute("name", prefix);
  input_element.setAttribute("id", `${prefix}_${id}`);
  input_element.setAttribute("value", id);

  const label_element = document.createElement("label");
  label_element.setAttribute("for", `${prefix}_${id}`);
  label_element.innerText = id;

  document.getElementById(form).appendChild(input_element);
  document.getElementById(form).appendChild(label_element);
};

const cards_contain_card = (card_comp) => {
  let contains_card = false;

  for (const card of cards) {
    if (card[0] === card_comp[0] && card[1] === card_comp[1]) {
      contains_card = true;
      break;
    }
  }

  return contains_card;
};

//************************************************************
//        Reaction to Socket Messages
//************************************************************

// Connection banner

socket.on("connect", () => {
  document.getElementById("connection-banner").classList.add("connected");
  emit_name();
});

socket.on("disconnect", () => {
  document.getElementById("connection-banner").classList.remove("connected");
});

// start page

socket.on("user list", (user_string) => {
  const users_element = document.getElementById("users");
  const user_count_element = document.querySelector("[data-user-count]");

  let users = JSON.parse(user_string);

  // update user count
  user_count_element.innerText = Object.keys(users).length;

  // empty and update username list
  users_element.innerHTML = "";

  for (const id in users) {
    const user_element = document.createElement("li");
    const name = users[id];

    user_element.innerText = name === "" ? "Unknown name" : name;
    users_element.append(user_element);
  }
});

socket.on("card selection started", () => {
  console.log("starting card selection");
  document.querySelector("main").classList.add("card_selection");
});

// card selection page

socket.on("task selection started", () => {
  console.log("starting task selection");
  document.getElementById("card_selection").remove();
  document.querySelector("main").classList.remove("card_selection");
  document.querySelector("main").classList.add("task_selection");
});

socket.on("game ended", () => {
  console.log("game ended");
  document.querySelector("main").classList.remove("task_selection");
  document.querySelector("main").classList.remove("card_selection");
});

socket.on("cards updated", (cardsJsonString) => {
  cards = JSON.parse(cardsJsonString);

  colors.clear();
  numbers.clear();

  for (const item of cards) {
    colors.add(item[0]);
    numbers.add(item[1]);
  }

  update_buttons("card_color", Array.from(colors).sort());
  update_buttons("card_number", Array.from(numbers).sort());
});

socket.on("selected cards updated", (cardsJsonString) => {
  document.getElementById("selected_cards").innerHTML = cardsJsonString;
});

socket.on("selected tasks updated", (cardsJsonString) => {
  document.getElementById("selected_tasks").innerHTML = cardsJsonString;
});

//************************************************************
//        Initialization of EventListeners
//************************************************************

document.getElementById("name").addEventListener("submit", (event) => {
  event.preventDefault();
  emit_name();
});

document.getElementById("start_game").addEventListener("click", () => {
  socket.emit("start card selection");
});

document.getElementById("end_game").addEventListener("click", () => {
  socket.emit("end game");
});

document
  .getElementById("finish_card_selection")
  .addEventListener("click", () => {
    socket.emit("finish card selection");
  });

const submitCardListener = () => {
  const number_element = document.querySelector("[name='card_number']:checked");
  const color_element = document.querySelector("[name='card_color']:checked");

  if (number_element !== null && color_element !== null) {
    const number = parseInt(number_element.value);
    const color = parseInt(color_element.value);

    socket.emit("card_or_task taken", JSON.stringify([color, number]));
  }
};

document
  .getElementById("submit_card")
  .addEventListener("click", () => submitCardListener());

document
  .getElementById("submit_task")
  .addEventListener("click", () => submitCardListener());

document.getElementById("card_selection").addEventListener("change", () => {
  const number_element = document.querySelector("[name='card_number']:checked");
  const color_element = document.querySelector("[name='card_color']:checked");

  if (number_element !== null) {
    const number = parseInt(number_element.value);

    for (const color of colors) {
      document.getElementById(`card_color_${color}`).disabled =
        !cards_contain_card([color, number]);
    }
  }

  if (color_element !== null) {
    const color = parseInt(color_element.value);

    for (const number of numbers) {
      document.getElementById(`card_number_${number}`).disabled =
        !cards_contain_card([color, number]);
    }
  }
});
