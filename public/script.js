document
  .getElementById("formAluno")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const obs = document.getElementById("obs").value.trim();
    const msg = document.getElementById("mensagem");

    // Validações básicas
    if (!nome || !usuario || !email || !senha) {
      msg.textContent = "Preencha todos os campos obrigatórios.";
      msg.style.color = "red";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "E-mail inválido.";
      msg.style.color = "red";
      return;
    }
    if (senha.length < 8) {
      msg.textContent = "A senha deve ter pelo menos 8 caracteres.";
      msg.style.color = "red";
      return;
    }


    try {
      const response = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_completo: nome,
          usuario_acesso: usuario,
          email_aluno: email,
          senha: senha,
          observacao: obs,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        msg.textContent = "Aluno cadastrado com sucesso!";
        msg.style.color = "green";
        document.getElementById("formAluno").reset();
      } else {
        msg.textContent = data.message || "Erro ao cadastrar.";
        msg.style.color = "red";
      }
    } catch (error) {
      msg.textContent = "Erro de conexão com o servidor.";
      msg.style.color = "red";
    }
  });
