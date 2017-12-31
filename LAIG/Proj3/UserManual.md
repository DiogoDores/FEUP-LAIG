# Ações necessárias

De modo a correr o programa é necessário:

 * Abrir o **Sicstus**
 
 * Em *File*, selecionar **Consult**
 
 * Selecionar o ficheiro **Prolog/server.pl**
 
 * No *Sicstus*, correr "**server.**"
 
 * Abrir um server, p.e. "localhost:8080", e estará funcional
 

# Resumo

Campo Bello é um jogo que pode ser jogado de 2 a 4 jogadores (neste caso só 2).
Para ganhar, um jogador deve tentar remover todas as suas peças do tabuleiro antes do adversário. O tabuleiro consiste em 4 triângulos que rodeiam um diamante central. Os triângulos correspodem às áreas iniciais de cada jogador. As peças são removidas ao saltar: saltar uma peça nossa causa a remoção da peça que foi saltada; saltar uma peça adversária permite-nos remover uma peça nossa do tabuleiro.
Na variante de apenas 2 jogadores, que foi implementada, os jogadores ficam com triângulos opostos e jogam alternadamente. No fim do jogo cada jogador pontua 1 ponto por cada uma das suas peças fora da área inicial e 3 pontos por cada uma das suas peças dentro da sua área inicial. O jogador com menos pontos ganha!

# Instruções

Ao correr o programa, aparece a cena. O utilizador tem 3 opções clicáveis na cena para o Modo de Jogo (Multiplayer, Singleplayer e Computador contra Computador). As mensagens para o utilizador (qual o modo de jogo a jogar, de quem é a vez de jogar, jogada inválida, pontuação, quem ganhou) estão representadas num header na cena. O Utilizador para mover uma peça tem de clicar na posição onde essa peça está e para a posição onde quer movê-la. Há ainda um menu na GUI onde o utilizador pode mudar a cena, fazer undo a uma jogada e ainda ver o filme do jogo quando o jogo acaba.
