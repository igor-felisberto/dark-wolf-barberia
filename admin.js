const SUPABASE_URL = "https://fppbvmnclulxxbjdqvsy.supabase.co";
const SUPABASE_KEY = "sb_publishable_FHVFwQE9vIGRT7sHBiT9GA_zOvxGqc4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const loginAdmin = document.getElementById("loginAdmin");
const emailAdmin = document.getElementById("emailAdmin");
const senhaAdmin = document.getElementById("senhaAdmin");
const entrarAdmin = document.getElementById("entrarAdmin");
const erroLogin = document.getElementById("erroLogin");

const topoAdmin = document.querySelector("header");
const painelAdmin = document.querySelector("main");
async function verificarSessao() {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();
    
    if (session) {
      loginAdmin.style.display = "none";
      topoAdmin.style.display = "";
      painelAdmin.style.display = "";
  
      buscarAgendamentos();
    }
  }
  
  verificarSessao();
topoAdmin.style.display = "none";
painelAdmin.style.display = "none";

entrarAdmin.addEventListener("click", async () => {
  erroLogin.textContent = "";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailAdmin.value.trim(),
    password: senhaAdmin.value
  });

  if (error) {
    erroLogin.textContent = "E-mail ou senha incorretos.";
    return;
  }

  loginAdmin.style.display = "none";
  topoAdmin.style.display = "";
  painelAdmin.style.display = "";
});
const dataFiltro = document.getElementById("dataFiltro");
const listaAgendamentos = document.getElementById("listaAgendamentos");

const totalClientes = document.getElementById("totalClientes");
const totalAtendidos = document.getElementById("totalAtendidos");

const faturamentoPrevisto =
  document.getElementById("faturamentoPrevisto");

const faturamentoRealizado =
  document.getElementById("faturamentoRealizado");

const proximoHorario =
  document.getElementById("proximoHorario");


  async function buscarAgendamentos() {
    const { data, error } = await supabaseClient
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });
  
    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return [];
    }
  
    return data;
  }


function salvarAgendamentos(agendamentos) {

  localStorage.setItem(
    "agendamentosDarkWolf",
    JSON.stringify(agendamentos)
  );

}


function prepararWhatsApp(telefone) {

  let numero = telefone.replace(/\D/g, "");

  if (!numero.startsWith("55")) {
    numero = "55" + numero;
  }

  return numero;

}


function formatarDinheiro(valor) {

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

}


function atualizarResumo(agendamentos) {

  // TODOS OS CLIENTES
  totalClientes.textContent =
    agendamentos.length;


  // CLIENTES CONCLUÍDOS
  const concluidos = agendamentos.filter(item => {
    return item.status === "concluido";
  });

  totalAtendidos.textContent =
    concluidos.length;


  // FATURAMENTO PREVISTO
  const previsto = agendamentos
  .filter(item => item.status !== "cancelado")
  .reduce(
    (soma, item) => {
      return soma + Number(item.preco || 0);
    },
    0
  );


  faturamentoPrevisto.textContent =
    formatarDinheiro(previsto);


  // FATURAMENTO REALIZADO
  const realizado = concluidos.reduce(
    (soma, item) => {

        return soma + Number(item.preco || 0);

    },
    0
  );

  faturamentoRealizado.textContent =
    formatarDinheiro(realizado);


  // PRÓXIMO CLIENTE
  const pendentes = agendamentos.filter(item => {
    return item.status !== "concluido";
  });

  if (pendentes.length > 0) {

    proximoHorario.textContent =
      pendentes[0].horario;

  } else {

    proximoHorario.textContent =
      "--:--";

  }

}


async function mostrarAgendamentos() {
  const dataSelecionada =
    dataFiltro.value;


  if (!dataSelecionada) {

    atualizarResumo([]);

    listaAgendamentos.innerHTML = `
      <p class="sem-agendamentos">
        Escolha uma data para visualizar os clientes.
      </p>
    `;

    return;

  }


  const todosAgendamentos = await buscarAgendamentos();

  const agendamentos = todosAgendamentos
  .filter(item =>
      item.data === dataSelecionada &&
      item.status !== "cancelado"
  )
  .sort((a, b) =>
      a.horario.localeCompare(b.horario)
  );


  atualizarResumo(agendamentos);


  if (agendamentos.length === 0) {

    listaAgendamentos.innerHTML = `
      <p class="sem-agendamentos">
        Nenhum agendamento para esse dia.
      </p>
    `;

    return;

  }


  listaAgendamentos.innerHTML = "";


  agendamentos.forEach((item) => {

    const card =
      document.createElement("div");

    const concluido =
      item.status === "concluido";


    card.classList.add(
      "card-agendamento"
    );


    if (concluido) {

      card.classList.add(
        "atendimento-concluido"
      );

    }


    const numeroWhatsApp =
      prepararWhatsApp(item.telefone);


    card.innerHTML = `

      <div class="hora-cliente">
        ${item.horario}
      </div>


      <div class="info-cliente">

        <strong>
          ${item.nome}
        </strong>

        <span>
          ${item.servico}
        </span>

        <span>
          WhatsApp: ${item.telefone}
        </span>

        <span>
        ${formatarDinheiro(Number(item.preco) || 0)}
        </span>


        ${
          concluido

            ? `
              <span class="status-concluido">
                ✓ Atendimento concluído
              </span>
            `

            : `
              <span class="status-agendado">
                Aguardando atendimento
              </span>
            `
        }

      </div>


      <div class="acoes-agendamento">

        <a
          class="whatsapp-cliente"
          href="https://wa.me/${numeroWhatsApp}"
          target="_blank"
        >
          WhatsApp
        </a>


        ${!concluido ? `
        <button
            class="concluir-agendamento"
            data-data="${item.data}"
            data-horario="${item.horario}"
        >
            Concluir
        </button>
    
        <button
            class="cancelar-agendamento"
            data-data="${item.data}"
            data-horario="${item.horario}"
        >
            Cancelar
        </button>
    ` : ""}

    </div>
    `;
    
    listaAgendamentos.appendChild(card);
    });
    }
 
async function concluirAgendamento(data, horario) {
    const confirmar = await confirmarDarkWolf(
        `Concluir o agendamento das ${horario}?`
    );

  
    if (!confirmar) {
      return;
    }
  
    const { error } = await supabaseClient
      .from("agendamentos")
      .update({ status: "concluido" })
      .eq("data", data)
      .eq("horario", horario);
  
    if (error) {
      console.error("Erro ao concluir agendamento:", error);
      alert("Não foi possível concluir o agendamento.");
      return;
    }
  
    await avisoDarkWolf("Agendamento concluído!");
    mostrarAgendamentos();

  }
async function cancelarAgendamento(data, horario) {
    const confirmar = await confirmarDarkWolf(
        `Cancelar o agendamento das ${horario}?`
    );
  
    if (!confirmar) {
      return;
    }
  
    const { error } = await supabaseClient
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("data", data)
      .eq("horario", horario);
  
    if (error) {
      console.error("Erro ao cancelar agendamento:", error);
      alert("Não foi possível cancelar o agendamento.");
      return;
    }
  
    await avisoDarkWolf("Agendamento cancelado!");
    mostrarAgendamentos();
  }


  




dataFiltro.addEventListener(
  "change",
  mostrarAgendamentos
);


listaAgendamentos.addEventListener(
  "click",
  (evento) => {


    if (
      evento.target.classList.contains(
        "concluir-agendamento"
      )
    ) {

      concluirAgendamento(
        evento.target.dataset.data,
        evento.target.dataset.horario
      );

    }


    if (
      evento.target.classList.contains(
        "cancelar-agendamento"
      )
    ) {

      cancelarAgendamento(
        evento.target.dataset.data,
        evento.target.dataset.horario
      );

    }

  }
);

const btnSair = document.getElementById("btnSair");

btnSair.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();

  loginAdmin.style.display = "";
  topoAdmin.style.display = "none";
  painelAdmin.style.display = "none";
});

function confirmarDarkWolf(mensagem) {
    return new Promise((resolve) => {
        const fundo = document.createElement("div");

        fundo.style.position = "fixed";
        fundo.style.inset = "0";
        fundo.style.background = "rgba(0,0,0,0.75)";
        fundo.style.display = "flex";
        fundo.style.alignItems = "center";
        fundo.style.justifyContent = "center";
        fundo.style.zIndex = "9999";

        fundo.innerHTML = `
            <div style="
                width: 90%;
                max-width: 400px;
                background: #11131a;
                border: 1px solid #333;
                border-radius: 18px;
                padding: 28px;
                color: white;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,.6);
            ">
                <h2 style="margin-bottom: 14px;">Dark Wolf</h2>

                <p style="margin-bottom: 24px;">
                    ${mensagem}
                </p>

                <div style="
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                ">
                    <button id="btnConfirmarDark" style="
                        padding: 12px 24px;
                        border: none;
                        border-radius: 10px;
                        background: #d65a6f;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        CONFIRMAR
                    </button>

                    <button id="btnCancelarDark" style="
                        padding: 12px 24px;
                        border: 1px solid #555;
                        border-radius: 10px;
                        background: transparent;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        VOLTAR
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(fundo);

        document
            .getElementById("btnConfirmarDark")
            .addEventListener("click", () => {
                fundo.remove();
                resolve(true);
            });

        document
            .getElementById("btnCancelarDark")
            .addEventListener("click", () => {
                fundo.remove();
                resolve(false);
            });
    });
}

function avisoDarkWolf(mensagem) {
    return new Promise((resolve) => {
        const fundo = document.createElement("div");

        fundo.style.position = "fixed";
        fundo.style.inset = "0";
        fundo.style.background = "rgba(0,0,0,0.75)";
        fundo.style.display = "flex";
        fundo.style.alignItems = "center";
        fundo.style.justifyContent = "center";
        fundo.style.zIndex = "9999";

        fundo.innerHTML = `
            <div style="
                width: 90%;
                max-width: 400px;
                background: #11131a;
                border: 1px solid #333;
                border-radius: 18px;
                padding: 30px;
                color: white;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,.6);
            ">
                <div style="font-size:48px;">✓</div>

                <h2>${mensagem}</h2>

                <button id="btnOkDark" style="
                    margin-top: 20px;
                    padding: 12px 28px;
                    border: none;
                    border-radius: 10px;
                    background: #d65a6f;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    OK
                </button>
            </div>
        `;

        document.body.appendChild(fundo);

        document
            .getElementById("btnOkDark")
            .addEventListener("click", () => {
                fundo.remove();
                resolve();
            });
    });
}