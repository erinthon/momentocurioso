Executa o protocolo completo de início de sessão para a próxima feature do projeto Momento Curioso.

## Passos obrigatórios

**1. Identifique a próxima feature**

Leia `C:\Users\erinthon\.claude\projects\C--dev-momentocurioso\memory\kanban.md` e encontre o primeiro item **não marcado** (`[ ]`) na seção **Backlog** (menor número). Apresente:
- Nome e número da feature
- Descrição completa de todas as tarefas especificadas

**2. Verifique o estado do projeto**

Execute em paralelo:
- `git status` — mudanças não commitadas
- `git log --oneline -5` — commits recentes

**3. Entre em plan mode**

Invoque `/plan` e apresente o plano detalhado com:
- Tarefas organizadas por camada: Entity → Repository → DTO → Service → Controller → Frontend
- Caminho exato de cada arquivo a criar ou modificar
- Dependências entre tarefas
- Checklist de verificação ao final (compilar, testar endpoints)

**4. Aguarde confirmação do usuário antes de codificar.**

---

## Checklist de fim de sessão (executar ao concluir)

1. `mvn compile` no backend — zero erros
2. Testar endpoints no Swagger ou curl
3. Verificar que nenhuma regra de arquitetura foi violada (DTOs, erros só no GlobalExceptionHandler, HTTP via ApiService no frontend)
4. Atualizar `kanban.md`: mover feature de Backlog → Concluído, registrar data e observações
5. Commit descritivo + `git push origin main`

---

## Referências

- Kanban: `C:\Users\erinthon\.claude\projects\C--dev-momentocurioso\memory\kanban.md`
- Workflow: `C:\Users\erinthon\.claude\projects\C--dev-momentocurioso\memory\workflow_sessao.md`
- Brand guide: `C:\Users\erinthon\.claude\projects\C--dev-momentocurioso\memory\brand_guide.md`
