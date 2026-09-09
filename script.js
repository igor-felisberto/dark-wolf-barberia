const SUPABASE_URL = "https://fppbvmnclulxxbjdqvsy.supabase.co";
const SUPABASE_KEY = "sb_publishable_FHVFwQE9vIGRT7sHBiT9GA_zOvxGqc4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const botoesServico = document.querySelectorAll(".selecionar-servico");
const botoesHorario = document.querySelectorAll(".horario");

const dataAgendamento = document.getElementById("dataAgendamento");
const servicoEscolhido = document.getElementById("servicoEscolhido");
const precoEscolhido = document.getElementById("precoEscolhido");
const continuarAgendamento = document.getElementById("continuarAgendamento");

let agendamento = {
  servico: "",
  preco: 0,
  data: "",
  horario: ""
};

// Não permite selecionar dias anteriores
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

dataAgendamento.min = `${ano}-${mes}-${dia}`;

function verificarAgendamento() {
  if (
    agendamento.servico &&
    agendamento.data &&
    agendamento.horario
  ) {
    continuarAgendamento.disabled = false;
  } else {
    continuarAgendamento.disabled = true;
  }
}

// SERVIÇOS
botoesServico.forEach((botao) => {
  botao.addEventListener("click", () => {

    const servico = botao.dataset.servico;
    const preco = Number(botao.dataset.preco);

    agendamento.servico = servico;
    agendamento.preco = preco;

    document.querySelectorAll(".card-servico").forEach((card) => {
      card.classList.remove("selecionado");
    });

    botao.closest(".card-servico").classList.add("selecionado");

    servicoEscolhido.textContent = servico;

    precoEscolhido.textContent = preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    verificarAgendamento();
  });
});

// DATA
dataAgendamento.addEventListener("change", () => {

  agendamento.data = dataAgendamento.value;

  atualizarHorariosOcupados();

});

// HORÁRIOS
botoesHorario.forEach((botao) => {

  botao.addEventListener("click", () => {

    botoesHorario.forEach((horario) => {
      horario.classList.remove("selecionado");
    });

    botao.classList.add("selecionado");

    agendamento.horario = botao.textContent;

    verificarAgendamento();
  });

});

const dadosCliente = document.getElementById("dadosCliente");
const nomeCliente = document.getElementById("nomeCliente");
const telefoneCliente = document.getElementById("telefoneCliente");
const confirmarAgendamento = document.getElementById("confirmarAgendamento");

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

async function atualizarHorariosOcupados() {
  if (!agendamento.data) return;

  const { data, error } = await supabaseClient.rpc(
    "horarios_ocupados",
    { p_data: agendamento.data }
  );

  if (error) {
    console.error("Erro ao buscar horários:", error);
    return;
  }

  const horariosOcupados = data.map((item) =>
    item.horario.slice(0, 5)
  );

  botoesHorario.forEach((botao) => {
    const horarioBotao = botao.textContent.trim().slice(0, 5);

    botao.disabled = false;
    botao.classList.remove("ocupado");
    botao.classList.remove("selecionado");

    if (horariosOcupados.includes(horarioBotao)) {
      botao.disabled = true;
      botao.classList.add("ocupado");
    }
  });

  agendamento.horario = "";
  verificarAgendamento();
}

continuarAgendamento.addEventListener("click", () => {

  dadosCliente.style.display = "block";

  dadosCliente.scrollIntoView({
    behavior: "smooth"
  });

});

confirmarAgendamento.addEventListener("click", async () => {

  const nome = nomeCliente.value.trim();
  const telefone = telefoneCliente.value.trim();

  if (!nome || !telefone) {
    alert("Preencha seu nome e WhatsApp.");
    return;
  }


  const novoAgendamento = {
    nome: nome,
    telefone: telefone,
    servico: agendamento.servico,
    preco: agendamento.preco,
    data: agendamento.data,
    horario: agendamento.horario
  };

  const { error } = await supabaseClient
  .from("agendamentos")
 
  .insert([
    {
      nome: nome,
      telefone: telefone,
      servico: agendamento.servico,
      preco:agendamento.preco,
      data: agendamento.data,
      horario: agendamento.horario
    }
  ]);
if (error) {
  console.error(error);

  if (error.code === "23505") {
    alert("Esse horário acabou de ser ocupado. Escolha outro horário.");
    return;
  }

  alert("Erro ao salvar o agendamento.");
  return;
}

mostrarConfirmacao(
  nome,
  agendamento.servico,
  agendamento.data,
  agendamento.horario
);

  nomeCliente.value = "";
  telefoneCliente.value = "";

  atualizarHorariosOcupados();

});

function mostrarConfirmacao(nome, servico, data, horario) {
  const fundo = document.createElement("div");
  const [ano, mes, dia] = data.split("-");
  const dataFormatada = `${dia}/${mes}/${ano}`;
  fundo.style.position = "fixed";
  fundo.style.top = "0";
  fundo.style.left = "0";
  fundo.style.width = "100%";
  fundo.style.height = "100%";
  fundo.style.background = "rgba(0,0,0,0.75)";
  fundo.style.display = "flex";
  fundo.style.alignItems = "center";
  fundo.style.justifyContent = "center";
  fundo.style.zIndex = "9999";

  fundo.innerHTML = `
      <div style="
          width: 90%;
          max-width: 420px;
          background: #11131a;
          border: 1px solid #333;
          border-radius: 18px;
          padding: 30px;
          color: white;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,.6);
      ">

          <div style="font-size:50px;">✓</div>

          <h2 style="margin-bottom:20px;">
              Agendamento confirmado!
          </h2>

          <p><strong>Cliente:</strong> ${nome}</p>
          <p><strong>Serviço:</strong> ${servico}</p>
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horario}</p>

          <button id="fecharConfirmacao" style="
              margin-top:22px;
              padding:13px 30px;
              border:none;
              border-radius:10px;
              background:#d6b58c;
              font-weight:bold;
              cursor:pointer;
          ">
              FECHAR
          </button>

      </div>
  `;

  document.body.appendChild(fundo);

  document
      .getElementById("fecharConfirmacao")
      .addEventListener("click", () => {
          fundo.remove();
      });
}