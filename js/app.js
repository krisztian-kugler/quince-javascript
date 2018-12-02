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
  modalCheck: document.querySelector(".modal .check")
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
  DOMAccess.modal.style.display === "none" ? DOMAccess.modal.style.display = "flex" : DOMAccess.modal.style.display = "none";
}

// Create new person and close/reset modal
const submitPerson = () => {
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
  updateDataDump(newPerson);
  DOMAccess.modalCheck.style.display = "none";
  for (let modalInput of DOMAccess.modalInputs) {
    modalInput.value = "";
  }
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
  const deleted = Object.assign({}, persons.splice(i, 1)[0]);
  document.querySelector(`#person-${i}`).remove();
  updateDataDump(deleted);
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
    updateDataDump(persons[i]);
  }
}

// Write new/deleted/updated data into textarea
const updateDataDump = (person) => {
  DOMAccess.textArea.value = `{name: ${person.name}, job: ${person.job}, age: ${person.age}, nick: ${person.nick}, employee: ${person.employee}}`;
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

// Fetch persons from JSON
fetch("./assets/persons.json")
  .then(res => res.json())
  .then(data => {
    persons = data;
    generatePersonsList(persons);
  })
  .catch(() => {
    persons = backupPersons;
    generatePersonsList(persons);
  })
