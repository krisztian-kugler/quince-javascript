// Variables
const DOMAccess = {
  personsList: document.querySelector(".persons-list"),
  textArea: document.querySelector("textarea"),
  modal: document.querySelector(".modal"),
  modalInputs: document.querySelectorAll(".modal input"),
  nameInput: document.querySelector("#nameInput"),
  jobInput: document.querySelector("#jobInput"),
  ageInput: document.querySelector("#ageInput"),
  nicknameInput: document.querySelector("#nicknameInput"),
  modalCheck: document.querySelector(".modal .check"),
  modalOk: document.querySelector(".modal .btn.ok"),
  arrow: document.querySelector(".arrow")
}

const personItem = `
  <div class="person" id='person-%index%'>
    <div class="cell name-job">
      <div class="name">%name%</div>
      <div class="job">%job%</div>
    </div>
    <div class="cell age">%age%</div>
    <div class="cell nickname">%nick%</div>
    <div class="cell employee">
      <div class="checkbox" onclick="toggleCheckbox('%index%')">
        <div class="check" style="display: %isEmployee%"></div>
      </div>
    </div>
    <div class="cell delete" onclick="deletePerson('%index%')">Delete</div>
  </div>`

let persons = [];
let timeout = null;
let order = null;

// Person class
class Person {
  constructor(name, job, age, nick, employee) {
    this.name = name;
    this.job = job;
    this.age = age;
    this.nick = nick;
    this.employee = employee;
  }
}

// Populate list with persons fetched from JSON
const generatePersonsList = (persons) => {
  persons.forEach((person, i) => {
    createNewPersonItem(person, i);
  })
}

// Create list item for new person and fill it with the appropriate data
const createNewPersonItem = (person, index) => {
  let newPersonItem = personItem;
  newPersonItem = newPersonItem.replace(/%index%/g, index);
  newPersonItem = newPersonItem.replace("%name%", person.name);
  newPersonItem = newPersonItem.replace("%job%", person.job);
  newPersonItem = newPersonItem.replace("%age%", person.age);
  newPersonItem = newPersonItem.replace("%nick%", person.nick);
  newPersonItem = newPersonItem.replace("%isEmployee%", person.employee ? "block" : "none");
  DOMAccess.personsList.insertAdjacentHTML("beforeend", newPersonItem);
}

// Modal toggle handler
const toggleModal = () => {
  if (DOMAccess.modal.style.display === "none") {
    DOMAccess.modal.style.display = "flex";
  } else {
    DOMAccess.modal.style.display = "none";
    DOMAccess.modalCheck.style.display = "none";
    DOMAccess.modalOk.classList.add("disabled");
    for (let modalInput of DOMAccess.modalInputs) {
      modalInput.value = "";
    }
  } 
}

// Checking name input
const onNameInput = (event) => {
  if (event.target.value.length >= 3) {
    DOMAccess.modalOk.classList.remove("disabled");
  } else {
    DOMAccess.modalOk.classList.add("disabled");
  }
}

// Create new person and close/reset modal
const submitPerson = () => {
  if (DOMAccess.modalOk.classList.contains("disabled")) {
    return;
  }

  const employee = isEmployee(DOMAccess.modalCheck);
  const newPerson = new Person(
    DOMAccess.nameInput.value,
    DOMAccess.jobInput.value,
    DOMAccess.ageInput.value,
    DOMAccess.nicknameInput.value,
    employee
  );
  persons.push(newPerson);
  createNewPersonItem(newPerson, persons.length - 1);
  toggleModal();
  updateDataDump();
}

// Determine if checkbox is checked in modal
const isEmployee = (element) => {
  if (element.style.display === "block") {
    return true;
  } else {
    return false;
  }
}

// Delete person from list
const deletePerson = (i) => {
  persons.splice(i, 1);
  document.querySelector(`#person-${i}`).remove();
  updateDataDump();
  regeneratePersonIndexes();
}

// Regenerate person indexes after deleting a person
const regeneratePersonIndexes = () => {
  document.querySelectorAll(".person").forEach((personItem, i) => {
    personItem.id = `person-${i}`;
    personItem.innerHTML = personItem.innerHTML.replace(/\('[0-9]+'\)/g, `('${i}')`);
  });
}

// Checkbox toggle handler
const toggleCheckbox = (i) => {
  if (!i) {
    DOMAccess.modalCheck.style.display === "none" ? DOMAccess.modalCheck.style.display = "block" : DOMAccess.modalCheck.style.display = "none";
  } else {
    const check = document.querySelector(`#person-${i} .check`);
    check.style.display === "none" ? check.style.display = "block" : check.style.display = "none";
    persons[i].employee = !persons[i].employee;
    updateDataDump();
  }
}

// Write new/deleted/updated data into textarea
const updateDataDump = () => {
  let data = "";

  persons.forEach((person, i) => {
    data += `{\n  "name": "${person.name}",\n  "job": "${person.job}",\n  "age": "${person.age}",\n  "nick": "${person.nick}",\n  "employee": ${person.employee}\n}${i === persons.length - 1 ? "" : ","}\n`
  })

  DOMAccess.textArea.value = data;
  updated();
}

// Textarea "update effect" handler
const updated = () => {
  DOMAccess.textArea.classList.add("updated");
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  timeout = setTimeout(() => {
    DOMAccess.textArea.classList.remove("updated");
  }, 100);
}

// Sort persons by name
const sortByName = () => {
  order === "ascending" ? order = "descending" : order = "ascending";

  if (!order) {
    order = "ascending";
  }

  if (order === "ascending") {
    bubbleSort(persons, "name");
    DOMAccess.arrow.innerHTML = "&uarr;";
  } else {
    bubbleSort(persons, "name").reverse();
    DOMAccess.arrow.innerHTML = "&darr;";
  } 

  DOMAccess.personsList.innerHTML = "";
  generatePersonsList(persons);
  updateDataDump();
}

// Alphabetical bubble sort (not quite suitable for large arrays)
const bubbleSort = (arr, property) => {
  if (arr.length < 2) {
    throw new Error("Array is too short for sorting!");
  }

  let counter = arr.length - 2;

  while (counter >= 0) {
    for (let i = 0; i <= counter; i++) {
      if (isSwapNecessary(arr[i][property], arr[i + 1][property])) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
    counter--;
  }
  
  return arr;
}

// Helper function for bubble sort to determine whether a swap is necessary (checks alphabetical order)
const isSwapNecessary = (a, b) => {
  const str1 = a.toLowerCase();
  const str2 = b.toLowerCase();
  const length = Math.min(str1.length, str2.length);

  for (let i = 0; i < length; i++) {
    if (str1[i] < str2[i]) {
      return false;
    } else if (str1[i] === str2[i]) {
      if (i === length - 1 && str1.length > str2.length) {
        return true;
      }
      continue;
    } else {
      return true;
    }
  }
}

// Fetch persons from JSON
fetch("./assets/persons.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      const person = new Person(
        item.name,
        item.job,
        item.age,
        item.nick,
        item.employee
      )
      persons.push(person);
    })
    sortByName();
  })
  .catch(() => {
    throw new Error("Persons not found!");
  })
