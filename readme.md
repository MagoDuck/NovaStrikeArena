# 🚀 Nova Strike Arena

Um jogo de tiro espacial estilo arcade com sistema de poderes, moedas e loja, desenvolvido em HTML5 Canvas com suporte a controle PS3.

![Nova Strike Arena](https://img.shields.io/badge/version-1.0-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🎮 Sobre o Jogo

Nova Strike Arena é um jogo de sobrevivência espacial onde você controla uma nave e enfrenta ondas de inimigos cada vez mais desafiadores. O jogo combina ação intensa com um sistema de progressão onde você ganha moedas para comprar e desbloquear novos poderes.

### Características Principais

- 🌊 **Sistema de Ondas**: Mais de 20 tipos de ondas com inimigos progressivamente mais fortes
- 💰 **Economia**: Ganhe moedas derrotando inimigos e completando ondas
- 🛒 **Loja de Poderes**: 15 poderes diferentes para comprar e personalizar sua estratégia
- 🚀 **3 Naves**: Escolha entre Interceptor, Equilibrada ou Titan
- 🎮 **Controle PS3**: Suporte completo para gamepad PlayStation 3
- 💥 **Efeitos Visuais**: Animações de explosão, laser, partículas e muito mais

## 🎮 Controles

### Teclado
| Tecla | Ação |
|-------|------|
| `↑ ↓ ← →` | Movimento da nave |
| `Espaço` | Atirar |
| `1` | Poder 1 (slot 1) |
| `2` | Poder 2 (slot 2) |
| `3` | Poder 3 (slot 3) |
| `R` | Abrir/Fechar menu |

### Controle PS3
| Botão | Ação |
|-------|------|
| `Direcional` | Movimento da nave |
| `R1` | Atirar |
| `X` | Poder 1 |
| `□` | Poder 2 |
| `○` | Poder 3 |
| `∆` | Abrir/Fechar menu |

## ⚙️ Mecânicas

### Sistema de Ondas
- **Ondas 1-4**: Inimigos Normais
- **Ondas 5-8**: Inimigos Diamante
- **Ondas 9-12**: Inimigos Círculo
- **Ondas 13-16**: Inimigos Quadrado
- **Ondas 17-20**: Inimigos Triângulo
- **Onda 21**: Nave Mãe (Chefão)
- **Onda 22**: Nave Pai (Chefão Final)
- **Ondas 23+**: Ciclo reinicia com dificuldade aumentada

### Munição e Recarga
- Cada nave tem uma quantidade limitada de munição
- A munição recarrega automaticamente quando esvazia
- O tempo de recarga varia conforme a nave

### Saúde
- A saúde é representada por barras vermelhas no HUD
- Derrotar inimigos pode restaurar vida
- Cada nave tem uma quantidade diferente de vida máxima

## ⚡ Sistema de Poderes

### Poderes Iniciais (Grátis)
| Poder | Ícone | Cooldown | Descrição |
|-------|-------|----------|-----------|
| Explosão | 💥 | 3 rodadas | Explode todos os inimigos no raio de 250px |
| Congelamento | ❄️ | 4 rodadas | Congela todos os inimigos por 5 segundos |
| Teleporte | 🌀 | 2 rodadas | Teleporta a nave para o local clicado |

### Poderes Comprados
| Poder | Ícone | Cooldown | Custo | Descrição |
|-------|-------|----------|-------|-----------|
| Escudo | 🛡️ | 5 rodadas | 50 moedas | Cria um escudo que bloqueia 1 hit |
| Cura | ❤️‍🩹 | 4 rodadas | 40 moedas | Recupera 2 pontos de vida |
| Super Velocidade | 💨 | 3 rodadas | 35 moedas | Aumenta a velocidade por 3s |
| Laser | 🔴 | 3 rodadas | 60 moedas | Dispara um laser poderoso em linha reta |
| Mina | 💣 | 3 rodadas | 45 moedas | Planta uma mina que explode ao contato |
| Mísseis Buscadores | 🎯 | 4 rodadas | 70 moedas | Dispara 3 mísseis que perseguem inimigos |
| Refletir | 🔄 | 5 rodadas | 55 moedas | Reflete balas inimigas por 2s |
| Gravidade | 🌌 | 4 rodadas | 50 moedas | Atrai inimigos e causa dano contínuo |
| Clone | 👥 | 6 rodadas | 80 moedas | Cria um clone que atira por 5s |
| Fúria | 🔥 | 4 rodadas | 45 moedas | Dobra o dano por 4s |
| Campo Lentidão | 🐢 | 3 rodadas | 30 moedas | Reduz a velocidade dos inimigos |
| Rajada | 💫 | 2 rodadas | 40 moedas | Dispara 5 tiros em leque |

### Seleção de Poderes
- Você pode ter todos os poderes comprados, mas só pode levar 3 por partida
- Na aba "Poderes" do menu, selecione quais 3 poderes usar
- O cooldown é contado em rodadas completadas

## 🚀 Naves

| Nave | Velocidade | Vida | Munição | Cadência | Cor |
|------|------------|------|---------|----------|-----|
| Interceptor | Alta (8) | Baixa (3) | Baixa (10) | Rápida (150ms) | 🟢 Verde |
| Equilibrada | Média (5) | Média (5) | Média (15) | Média (180ms) | 🔵 Ciano |
| Titan | Baixa (3) | Alta (8) | Baixa (12) | Lenta (220ms) | 🟠 Laranja |

## 👾 Inimigos

| Tipo | Vida | Pontos | Raio | Cor | Descrição |
|------|------|--------|------|-----|-----------|
| Normal | 1 | 1 | 36 | 🔴 Vermelho | Inimigo básico |
| Diamante | 2 | 2 | 32 | 🟠 Laranja | Mais resistente |
| Círculo | 3 | 3 | 30 | 🟢 Verde | Médio |
| Quadrado | 4 | 4 | 34 | 🟣 Roxo | Resistente |
| Triângulo | 5 | 50 | 38 | 🟣 Rosa | Muito resistente |
| Nave Mãe | 50 | 50 | 80 | 🔴 Vermelho | Chefão (Onda 21) |
| Nave Pai | 100 | 100 | 90 | 🟣 Magenta | Chefão Final (Onda 22) |

## 🪙 Moedas e Loja

### Como Ganhar Moedas
- Derrotando inimigos: 30% de chance de ganhar 5-15 moedas
- Completando ondas: 10 + número da onda moedas

### Como Usar
1. Abra o menu (tecla `R`)
2. Vá para a aba "Poderes"
3. Compre poderes com suas moedas
4. Selecione até 3 poderes para usar na partida

### Progressão
- Os dados são salvos automaticamente no localStorage do navegador
- Moedas, poderes comprados e selecionados são mantidos entre sessões

## 📦 Instalação

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Opera)
- JavaScript habilitado
- (Opcional) Controle PS3 para melhor experiência

### Passos
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/nova-strike-arena.git
```

2. Navegue até a pasta do projeto:
```bash
cd nova-strike-arena
```

3. Abra o arquivo `index.html` no seu navegador:
```bash
# No Windows
start index.html

# No Mac
open index.html

# No Linux
xdg-open index.html
```

### Estrutura de Arquivos
```
nova-strike-arena/
├── index.html          # Página principal
├── style.css           # Estilos CSS
├── script.js           # Lógica do jogo
└── README.md           # Documentação
```

## 🎯 Como Jogar

### Iniciando
1. Ao abrir o jogo, você verá o menu principal
2. Escolha sua nave na aba "Nave"
3. (Opcional) Vá para a aba "Poderes" para comprar e selecionar poderes
4. Clique em "Iniciar" para começar

### Durante o Jogo
- Mova sua nave com as setas ou direcional do PS3
- Atire com Espaço ou R1
- Use poderes com 1, 2, 3 ou X, □, ○
- Complete ondas para ganhar moedas
- Sobreviva o máximo possível!

### Dicas
- Use o poder de Congelamento para lidar com grupos grandes
- O Escudo é essencial para sobreviver em ondas avançadas
- Combine Fúria com Explosão para dano massivo
- O Clone é útil para aumentar seu poder de fogo
- Mantenha distância da Nave Pai nas fases 2 e 3

## 🛠️ Personalização

### Modificando Configurações

#### Velocidade dos Inimigos
No `script.js`, encontre a função `createEnemy`:
```javascript
const baseSpeed = type === 'FATHER' ? 1.5 : (Math.random() * 1.5 + 2.0);
```
- Aumente os valores para inimigos mais rápidos
- Diminua para inimigos mais lentos

#### Dano dos Poderes
No `script.js`, encontre o poder desejado:
```javascript
function ativarLaser() {
    const laserDamage = 20;  // Ajuste este valor
    const laserRange = 600;   // Ajuste este valor
}
```

#### Moedas por Onda
No `update()`, encontre:
```javascript
coins += 10 + wave;  // Altere o 10 para mais ou menos moedas
```

## 💻 Tecnologias

- **HTML5 Canvas**: Renderização do jogo
- **CSS3**: Estilização e layout
- **JavaScript (ES6)**: Lógica do jogo
- **Gamepad API**: Suporte a controle PS3
- **LocalStorage**: Salvamento de progresso

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

- **Desenvolvedor**: João Gabriel
- **Email**: joaogabrielcoelho1000@gmail.com
- **GitHub**: [João Gabriel](https://github.com/magoduck)

---

⭐ Se você gostou do jogo, considere dar uma estrela no GitHub!

🎮 Divirta-se e boa sorte na arena!
