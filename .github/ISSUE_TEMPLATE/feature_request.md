---
name: Feature Request
labels: ["feature"]
---

### Exemplo (já enfrentado)

**Título sugerido:** Bloqueio de double booking no Supabase

**Problema/Oportunidade**
Atualmente é possível dois usuários reservarem o mesmo horário quase ao mesmo tempo. Isso gera conflito no banco e horários duplicados.

**Proposta**
Criar constraint no Supabase (índice único por `slot_id`) ou usar transação atômica para evitar reservas duplicadas.  
Na UI, exibir mensagem de erro amigável se o horário já foi reservado.

**Critérios de Aceite**
- [ ] Reserva duplicada não é criada.
- [ ] Usuário recebe feedback claro em caso de conflito.
- [ ] Teste E2E com duas sessões em paralelo.

