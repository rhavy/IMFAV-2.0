Todas as tarefas foram concluídas:

1.  **Melhoria Visual da Função `handleRelatorio`:**
    *   Implementei um mapeamento de `actionDisplayMap` para exibir as ações de log de forma mais compreensível (ex: "DELETE_USER" agora aparece como "Membro Bloqueado/Deletado").
    *   Formatei a data e hora do log para o formato "Dia DD de Mês de AAAA às HH:MM:SS" (ex: "Dia 11 de Fevereiro de 2026 às 09:13:11").
    *   Melhorei o CSS do relatório gerado para um visual mais moderno e consistente com a aplicação, incluindo melhor espaçamento, tipografia e sombreamentos.
    *   Implementei uma busca de nomes de usuários no frontend (`userNamesMap`) para exibir o nome do usuário que executou a ação no log, em vez do ID. Se o nome não for encontrado, o ID será exibido como fallback.

2.  **Modais de Confirmação para 'Reabilitar Membro' e 'Restaurar Membro':**
    *   Introduzi um novo estado (`confirmationModal`) para gerenciar o display dos modais de confirmação.
    *   Modifiquei os botões "Reabilitar Membro" e "Restaurar Membro" na `MemberRow` para, ao serem clicados, abrirem o modal de confirmação em vez de executarem a ação diretamente.
    *   Criei um `ConfirmationDialog` genérico que exibe uma mensagem contextualizada (para reabilitação ou restauração) e oferece botões para "Confirmar" ou "Cancelar" a ação.
    *   Implementei a lógica de confirmação para que, ao clicar em "Confirmar" no modal, a ação original (`onRehabilitate` ou `onRestore`) seja executada, e o modal seja fechado. O cancelamento fecha apenas o modal.

3.  **Correção de Erro de Build:**
    *   Corrigi um erro de parsing (`Parsing ecmascript source code failed`) causado por um bloco extra de fechamento de JSX (`</div>\n    );\n}`) que estava presente incorretamente após a definição do componente principal `ClienteMembrosGrupos`.

4.  **Correção de Erro "Tipo de ação inválido" (Backend):**
    *   Adicionei um `case "CHANGE_ROLE"` ao `switch` statement do endpoint `PATCH /api/users` no arquivo `src/app/api/users/route.ts`. Isso permite que o backend processe corretamente a ação de "Alterar Unção" enviada pelo frontend, resolvendo o erro "Tipo de ação inválido".

5.  **Correção de Erro "Cannot find name 'CargoType'":**
    *   Adicionei `CargoType` à declaração de importação `@prisma/client` no arquivo `src/app/(dashboard - membro)/dashboard/membros/_components/clienteMembros.tsx` para resolver o erro de compilação.

6.  **Correção de Erro "Erro interno no servidor ao atualizar" (Backend Serialization):**
    *   Modifiquei a função `PATCH` em `src/app/api/users/route.ts` para usar objetos de usuário simplificados (`simplifiedOldUser`, `simplifiedUpdatedUser`) ao criar entradas de log, prevenindo potenciais problemas de serialização JSON com objetos aninhados ou referências circulares nos campos `oldValue` e `newValue`.

7.  **Implementação de Múltiplos Cargos por Usuário:**
    *   **Fase 1: Modificação do Schema do Banco de Dados (`prisma/schema.prisma`)**
        *   Alterei o `prisma/schema.prisma` para remover a relação direta de `cargo` do modelo `User` e do `users` do modelo `Cargo`.
        *   Criei uma nova tabela de junção `UserCargo` para estabelecer uma relação muitos-para-muitos entre `User` e `Cargo`.
        *   Corrigi os valores do enum `CargoType` para que fossem identificadores válidos do Prisma (ex: `LIDER_CRIANCAS` para `LIDER_CRIANCAS`, `LIDER DIÁCONO` para `LIDER_DIACONO`).
        *   Restaurei a definição do modelo `Group` e a relação `groups Group[]` no modelo `User`, que haviam sido acidentalmente removidas.
        *   O usuário foi instruído a executar `npx prisma migrate dev --name add_many_to_many_user_cargo` para aplicar as mudanças ao banco de dados.
    *   **Fase 2: Atualização da API de Backend (`src/app/api/users/route.ts`)**
        *   Atualizei os métodos `GET` e `PATCH` do endpoint `/api/users` para incluir corretamente a nova relação `UserCargo` e `cargo` nos `include` das queries do Prisma.
        *   Refatorei o método `PATCH`:
            *   Removi o campo `cargo` das atualizações diretas no `UPDATE_PROFILE`.
            *   Renomeei `CHANGE_ROLE` para `UPDATE_UNCAO` e ajustei-o para manipular o campo `uncao` corretamente, tratando strings vazias como `null`.
            *   Adicionei novos `actionType`s: `ADD_USER_CARGO` e `REMOVE_USER_CARGO`, que interagem diretamente com a tabela `UserCargo` para adicionar ou remover associações de cargos a usuários.
            *   Assegurei que o estado `finalUpdatedUser` é determinado corretamente e usado para logging e resposta da API, refletindo todas as mudanças, incluindo as de cargo.
    *   **Fase 3: Atualização da UI e Lógica do Frontend (`src/app/(dashboard - membro)/dashboard/membros/_components/clienteMembros.tsx`)**
        *   Modifiquei a definição do estado `modalAction` para incluir `manage_roles`.
        *   Atualizei a `MemberRow` para aceitar uma nova prop `onManageRoles` e o `DropdownMenuItem` "Alterar Cargo" foi renomeado para "Gerenciar Cargos" e chama `onManageRoles`.
        *   Refatorei o antigo "MODAL DE CARGO" para "MODAL DE UNÇÃO", ajustando seu título e a ação `onClick` para `UPDATE_UNCAO`.
        *   Adicionei um novo `CargoManagementModal` (para `modalAction.type === 'manage_roles'`) que exibe os cargos atuais do membro e permite adicionar/remover cargos usando as novas ações `ADD_USER_CARGO` e `REMOVE_USER_CARGO`.
        *   Criei um novo endpoint `src/app/api/cargos/route.ts` para buscar todos os cargos disponíveis no banco de dados.
        *   Implementei a busca desses cargos no `ClienteMembrosGrupos` (com `useEffect` e `useState`) e populei o dropdown de "Adicionar Novo Cargo" no `CargoManagementModal` com os IDs e nomes dos cargos obtidos.
        *   Ajustei a exibição de cargos na `MemberRow` para que agora itere sobre `member.UserCargo` e mostre todos os cargos atribuídos, ou 'Membro' se nenhum estiver presente.

Todas as modificações foram feitas nos arquivos `src/app/(dashboard - membro)/dashboard/membros/_components/clienteMembros.tsx`, `src/app/api/users/route.ts`, `src/app/api/cargos/route.ts` e `prisma/schema.prisma`.