require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/alunos", async (req, res) => {
  try {
    const { nome_completo, usuario_acesso, senha, email_aluno, observacao } =
      req.body;

    if (!nome_completo || !usuario_acesso || !senha || !email_aluno) {
      return res
        .status(400)
        .json({ ok: false, message: "Campos obrigatórios faltando" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const sql = `
      INSERT INTO alunos (nome_completo, usuario_acesso, senha_hash, email_aluno, observacao)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(sql, [
      nome_completo,
      usuario_acesso,
      senha_hash,
      email_aluno,
      observacao || null,
    ]);

    res.json({ ok: true, message: "Aluno cadastrado com sucesso!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ ok: false, message: "Usuário ou e-mail já cadastrados" });
    } else {
      console.error(err);
      res.status(500).json({ ok: false, message: "Erro interno do servidor" });
    }
  }
});

app.get("/api/alunos", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT nome_completo, usuario_acesso, email_aluno, observacao FROM alunos"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Erro ao buscar alunos" });
  }
});

// Apagar aluno
app.delete("/api/alunos/:usuario", async (req, res) => {
  try {
    const { usuario } = req.params;
    await pool.execute("DELETE FROM alunos WHERE usuario_acesso = ?", [
      usuario,
    ]);
    res.json({ ok: true, message: "Aluno apagado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Erro ao apagar aluno" });
  }
});

// Editar aluno
app.put("/api/alunos/:usuario", async (req, res) => {
  try {
    const { usuario } = req.params;
    const { nome_completo, email_aluno, observacao } = req.body;
    await pool.execute(
      "UPDATE alunos SET nome_completo=?, email_aluno=?, observacao=? WHERE usuario_acesso=?",
      [nome_completo, email_aluno, observacao, usuario]
    );
    res.json({ ok: true, message: "Aluno atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Erro ao editar aluno" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: http://localhost:${PORT}`);
});
