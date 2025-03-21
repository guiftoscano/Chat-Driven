const BASE_API_URL = "https://mock-api.driven.com.br/api/v6/uol";
const UUID = "5a70610f-08f1-426a-b2a9-a0426d53a8bf";

let userName;
let recipient = "Todos";
let visibility = "Público";
let intervalId = null;

function testeingErrors(error){
  console.log(error)
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".contact-list").addEventListener("click", (event) => {
      let item = event.target.closest("li");
      if (!item) return; 

      document.querySelectorAll(".contact-list li").forEach((li) => li.classList.remove("selected"));
      item.classList.add("selected");

      updateTarget(item);
  });
});

// Aqui vem sua função updatesParticipants()
function updatesParticipants(response) {
  let data = response.data;
  const contact = document.querySelector(".contact-list");

  const activeNames = new Set(data.map(user => user.name));

  // Remover elementos que não estão mais em `data`
  document.querySelectorAll(".contact-list li").forEach(li => {
      const liName = li.classList[0]; 

      if (!activeNames.has(liName) && liName !== "todos") {
          li.remove(); 
      }
  });

  // Adicionar novos nomes se ainda não estiverem na lista
  data.forEach(({ name }) => {
      if (!contact.querySelector(`.${CSS.escape(name)}`)) {
          contact.innerHTML += `
              <li class="${name}"><ion-icon name="person-circle"></ion-icon> ${name} 
              <ion-icon class="check-icon" name="checkmark-outline"></ion-icon></li>
          `;
      }
  });
}

function startInterval(){
  if (!intervalId) {
    intervalId = setInterval(getListOfParticipants, 10000);
    console.log("starting interval")
  }
}

function stopInterval(){
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Ending interval")
  }
}
function getListOfParticipants(){
  const promise = axios.get(`${BASE_API_URL}/participants/${UUID}`);

  promise.then(updatesParticipants);
  promise.catch(testeingErrors);
}

function updateTarget(target){
  if (target.parentElement.classList.contains("contact-list")) {
      if (target.classList.contains("todos") && target.classList.contains("selected")) {
          recipient = "Todos";
      } else {
          recipient = target.classList[0];
          if (visibility === "Público") {
              console.log("Cai aqui no público");
              document.querySelector(".send-info").textContent = `Enviando para ${recipient} (público)`;
          } else if (visibility === "Privado") {
              console.log("Cai aqui no privado");
              document.querySelector(".send-info").textContent = `Enviando para ${recipient} (privado)`;
          } else {
              console.log("DEU MAIS ERRADO QUE A PF PROCURANDO PICA");
          }
      }
  }

  if (target.parentElement.classList.contains("visibility-list")) {
      // 🔥 Remover 'selected' de todos os itens antes de adicionar ao novo
      document.querySelectorAll(".visibility-list li").forEach((li) => li.classList.remove("selected"));
      
      target.classList.add("selected"); // Agora o item clicado recebe 'selected'

      if (target.classList.contains("public")) {
          visibility = "Público";
          console.log("Cai aqui no público 2");
          document.querySelector(".send-info").textContent = `Enviando para ${recipient} (público)`;
      } else if (target.classList.contains("private")) {
          visibility = "Privado";
          console.log("Cai aqui no privado 2");
          document.querySelector(".send-info").textContent = `Enviando para ${recipient} (privado)`;
      }
  }
}


/* CÓDIGO SIDEBAR */
function createMenu (){
  const menuIcon = document.querySelector(".menu");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");
  const items = document.querySelectorAll(".sidebar li");

  // Abrir sidebar
  menuIcon.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    getListOfParticipants();
    startInterval();
  });

  // Fechar sidebar ao clicar no overlay
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    stopInterval();
  });

  // Adicionar seleção aos itens da lista
  items.forEach((item) => {
    item.addEventListener("click", () => {
      // Remover a classe 'selected' dos outros itens da mesma categoria
      if (item.parentElement.classList.contains("contact-list")) {
        document.querySelectorAll(".contact-list li").forEach((li) => li.classList.remove("selected"));
        console.log("Eu entrei nessa condicional")
      }
      if (item.parentElement.classList.contains("visibility-list")) {
        if ((recipient != "Todos" && item.classList.contains("private"))||(item.classList == "public")){
          document.querySelectorAll(".visibility-list li").forEach((li) => li.classList.remove("selected"));
        } else {
          alert("Você não pode selecionar uma mensagem privada para todos!")
          return;
        }
      }
      updateTarget(item);
    });
  });
}

/* END SIDEBAR*/


function login() {
  userName = document.querySelector(".login-input").value;

  let promise = axios.post(`${BASE_API_URL}/participants/${UUID}`, {name: userName });

  promise.then(logsUser);
  promise.catch(throwErrorsLogin);
}

function sendMessage() {
  let messageSending = document.querySelector(".msg-input");
  let typeMessage = "";

  if (visibility == "Público") {
    typeMessage = "message"
  } else {
    typeMessage = "private_message"
  }

    console.log(`O userName sendo usado é: ${userName}`)
    console.log(`O To sendo usado é: ${recipient}`)
    console.log(`O text sendo usado é: ${messageSending.value}`)
    console.log(`O type sendo usado é: ${typeMessage}`)
  let promise = axios.post(`${BASE_API_URL}/messages/${UUID}`, {from: userName, to: recipient, text: messageSending.value, type: typeMessage});
  
  promise.then(messageSending.value = "");
  promise.catch(throwErrorsSendingMSG);

}

function logsUser() {
  document.querySelector(".login-screen").classList.add("hidden");
  document.querySelector(".footer").classList.remove("hidden");
  const includeButton = document.querySelector(".header")

  includeButton.innerHTML += 
      `<button class="menu">
        <ion-icon class="icon" name="people"></ion-icon>
      </button>`;

  createMenu();
  loadMessages();
}

function throwErrorsLogin(err) {
  let error = err.response.status;

  if (userName === "" && error === 400) {
    alert("Campo em branco, digite seu usuário!");
  } else if (error === 400) {
    alert("Este usuário já existe, digite um novo nome!");
  }
}

function throwErrorsSendingMSG(err) {
  let error = err.response.status;

  console.log(err);
  console.log(error);
}

function loadMessages() {
  const timeout_three_seconds = 3000;
  const timeout_five_seconds = 5000;
  getMessages();
  
  setInterval(getMessages, timeout_three_seconds);
  setInterval(statusUser, timeout_five_seconds);

}
function getMessages() {
  const promise = axios.get(`${BASE_API_URL}/messages/${UUID}`);
    promise.then((response) => {
      createsChat(response.data);
    document.querySelector(".chat-list").lastElementChild.scrollIntoView();
  });

  promise.catch((error) => {
    const { status, data } = error.response;
    alert(
      `${data} Erro ${status} - Problema ao carregar os paticipantes do chat`
    );
    window.location.reload();
  });
}

function createsChat(allMessages) {
  let chatList = document.querySelector(".chat-list");

  chatList.innerHTML=""
  allMessages.forEach((message) => {
    const { from, time, text, to, type } = message;
    switch (type) {
        case "status": chatList.innerHTML += `
          <li class="message status">
            <span class="time">${time}</span> <strong> ${from} </strong> ${text}
          </li>
          `
        break;

        case "message": chatList.innerHTML += `
          <li class="message normal">
            <span class="time">${time}</span> <strong> ${from} </strong> para <strong>${to}</strong>: ${text}
          </li>
              `
        break;      
        case "private_message": 
          if(userName == from || userName == to) { 
          chatList.innerHTML += `
            <li class="message reserved">
            <span class="time">${time}</span> <strong> ${from} </strong> reservadamente para <strong>${to}</strong>: ${text}
          </li>
        `}
        break;
        }
      }  
      )
    }

function statusUser() {
  let promise = axios.post(`${BASE_API_URL}/status/${UUID}`, {name: userName });

  promise.catch((err) => {
    const error = err.response.status;
    alert("Usuário desconectado por inatividade");
    console.log(error);
  });
}

function getUsers() {
  let promise = axios.get(`${BASE_API_URL}/participants/${UUID}`, {name: userName });

  promise.catch((err) => {
    const error = err.response.status;
    alert("Usuário desconectado por inatividade");
    console.log(error);
  });
}