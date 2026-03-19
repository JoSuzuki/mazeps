# Diagnóstico: site lento e cliques parando após tab inativa

## Sintomas
- Site fica aberto sem uso por um tempo
- Ao retornar à aba: cliques param de funcionar, interface fica muito lenta

## Causas prováveis identificadas

### 1. **View Transitions API** (alta probabilidade)
O site usa `@view-transition { navigation: auto }` no CSS. Quando a aba fica em background:
- O navegador pausa ou pula animações
- Ao retornar, uma transição pode ficar em estado inconsistente
- Isso pode bloquear a árvore de eventos ou criar overlays invisíveis

### 2. **Motion (Framer Motion)** (média probabilidade)
- Animações pausam quando a aba está inativa
- Ao retornar, podem retomar de forma estranha
- Possíveis memory leaks com `AnimatePresence` e `layoutId`
- Usado em: Link, Button, MenuNavigation, torneios

### 3. **Socket.io** (se estiver na página Santorini)
- Conexão pode dar timeout no servidor após inatividade
- Ao retornar, socket.io tenta reconectar
- Flood de eventos pode congestionar a main thread

### 4. **useOutsideClick – callback instável** (média probabilidade)
- O callback é dependência do `useEffect`
- Se o pai não usar `useCallback`, o efeito reexecuta a cada render
- Remove e readiciona o listener constantemente
- Pode criar janelas onde cliques não são capturados

### 5. **will-change: transform no :root**
- Em `app.css` linha 71
- Mantém uma camada de composição ativa
- Pode aumentar uso de memória em abas abertas por muito tempo

### 6. **Throttling do navegador**
- Aba em background: JS é fortemente limitado
- Ao voltar: timers, RAF e atualizações acumuladas disparam de uma vez
- Main thread fica congestionada → interface lenta

## Correções implementadas

1. **useOutsideClick**: uso de ref para o callback, evitando reexecução desnecessária do efeito e janelas onde cliques não são capturados
2. **will-change no :root**: removido para reduzir acúmulo de memória em abas inativas

## Como testar

1. Abrir o site e deixar a aba inativa por 10–15 minutos
2. Voltar à aba e tentar clicar em links/botões
3. Abrir DevTools > Performance, gravar ao retornar à aba e verificar long tasks
4. Em Console: `document.visibilityState` deve ser `'visible'` ao retornar
