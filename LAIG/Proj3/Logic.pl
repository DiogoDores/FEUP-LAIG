/* -*- Mode:Prolog; coding:iso-8859-1; indent-tabs-mode:nil; prolog-indent-width:8; prolog-paren-indent:3; tab-width:8; -*- */

:- use_module(library(lists)).
:- include('Board.pl').
:- include('CLI.pl').
                                                                     
% Get blue player points
bluePlayerPoints([],0).
bluePlayerPoints([H|T],P) :- 
        bluePlayerPoints(T,P1), blueArea(B), member(H,B), P is P1 + 3.
bluePlayerPoints([H|T],P) :- 
        bluePlayerPoints(T,P1),
        (yellowArea(Y), member(H,Y); H==mid),
        P is P1 + 1.

% Get yellow player points
yellowPlayerPoints([],0).
yellowPlayerPoints([H|T],P) :- 
        yellowPlayerPoints(T,P1), yellowArea(Y), member(H,Y), P is P1 + 3.
yellowPlayerPoints([H|T],P) :- 
        yellowPlayerPoints(T,P1),
        (H==mid; blueArea(B), member(H,B)),
        P is P1 + 1.

% Calculate Points for a given player and board
points(b,BlueMoversPos,Points) :- 
        bluePlayerPoints(BlueMoversPos,Points),
        write('Blue scored '), write(Points), write(' points.'),nl.
points(y,YellowMoversPos,Points) :- 
        yellowPlayerPoints(YellowMoversPos,Points),
        write('Yellow scored '), write(Points), write(' points.'),nl.

% Calculate who is the winner and print it
winner(YellowMovers,BlueMovers) :- points(b,BlueMovers,BP), points(y,YellowMovers,YP), whoWins(YP,BP).
whoWins(YP1,BP2) :- YP1 > BP2, write('Blue Player Wins'),nl.
whoWins(YP1,BP2) :- YP1 < BP2, write('Yellow Player Wins'),nl.
whoWins(YP1,BP2) :- YP1 == BP2, write('Draw'),nl.



isValid(b,Yi,Bi,InitialPos,JumpPos,FinalPos) :-
        member(InitialPos,Bi),
        validJump2(InitialPos,FinalPos,JumpPos),
        isEmpty(FinalPos,Yi,Bi),
        isNotEmpty(JumpPos, Yi,Bi).
isValid(y,Yi,Bi,InitialPos,JumpPos,FinalPos) :-
        member(InitialPos,Yi),
        validJump2(InitialPos,FinalPos,JumpPos),
        isEmpty(FinalPos,Yi,Bi),
        isNotEmpty(JumpPos, Yi,Bi).
        
        
isNotEmpty(X,Yi,Bi):- boardMembers(L),!, member(X,L), (member(X,Yi) ; member(X,Bi)).
           
isEmpty(X,Yi,Bi):- boardMembers(L), !,member(X,L),!, \+ member(X,Yi), \+ member(X,Bi).
getEmptyElement(Y,B,[BoardHead|_],Empty):- \+member(BoardHead,Y), \+member(BoardHead,B), Empty = BoardHead.
getEmptyElement(Y,B,[_|BoardTail],Empty):- getEmptyElement(Y,B,BoardTail,Empty).

getEmptyPositions(Y,B,EmptyPositions):- boardMembers(Board), findall(X,(member(X,Board),\+member(X,Y),\+member(X,B)),EmptyPositions).

getFirstElement([First|_], First).

readMoverToRemove(MoverToRemove, List):-
        repeat,
        write('Select Valid Mover to Remove'),nl,
        read(MoverToRemove),
        member(MoverToRemove,List).

% Yellow jumps yellow mover
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,_) :-
        member(InitialPos,Yi),
        delete(Yi,InitialPos,Yo2),
        append([FinalPos],Yo2,Yo3),
        member(JumpPos,Yi),
        delete(Yo3,JumpPos,Yo),
        append([],Bi,Bo).

%(Bot) Yellow jumps blue mover   
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,bot) :-
        member(InitialPos,Yi),
        delete(Yi,InitialPos,Yo2),
        append([FinalPos],Yo2,Yo3),
        member(JumpPos,Bi),
        getFirstElement(Yo3, MoverToRemove),
        delete(Yo3,MoverToRemove,Yo),
        write('Removing '), write(MoverToRemove),nl,
        append([],Bi,Bo).     

% Yellow jumps blue mover and selects valid mover to remove.     
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,human) :-
        member(InitialPos,Yi),
        delete(Yi,InitialPos,Yo2),
        append([FinalPos],Yo2,Yo3),
        member(JumpPos,Bi),
        readMoverToRemove(MoverToRemove,Yo3),
        delete(Yo3,MoverToRemove,Yo),
        append([],Bi,Bo).

% Blue jumps blue mover   
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,_) :-
        member(InitialPos,Bi),
        delete(Bi,InitialPos,Bo2),
        append([FinalPos],Bo2,Bo3),
        member(JumpPos,Bi),
        delete(Bo3,JumpPos,Bo),
        append([],Yi,Yo).

%(Bot) Blue jumps yellow mover   
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,bot) :-
        member(InitialPos,Bi),
        delete(Bi,InitialPos,Bo2),
        append([FinalPos],Bo2,Bo3),
        member(JumpPos,Yi),
        getFirstElement(Bo3, MoverToRemove),
        delete(Bo3,MoverToRemove,Bo),
        write('Removing '), write(MoverToRemove),nl,
        append([],Yi,Yo).

% Blue jumps yellow mover and selects valid mover to remove.     
move(Yi,Bi,InitialPos,JumpPos,FinalPos,Yo,Bo,human) :-
        member(InitialPos,Bi),
        delete(Bi,InitialPos,Bo2),
        append([FinalPos],Bo2,Bo3),
        member(JumpPos,Yi),
        readMoverToRemove(MoverToRemove, Bo3),
        delete(Bo3,MoverToRemove,Bo),
        append([],Yi,Yo).

isPossibleToMoveAgain(Yi,Bi,FirstInitialPos,PrevFinalPos) :-
        validJump2(PrevFinalPos,NextFinalPos,JumpPos),
        \+ member(NextFinalPos,Yi),
        \+ member(NextFinalPos,Bi),
        (member(JumpPos,Yi); member(JumpPos,Bi)),
        NextFinalPos \= FirstInitialPos.

isPossibleToMoveAgain(Yi,Bi,FirstInitialPos,PrevFinalPos) :-
        validJump2(NextFinalPos,PrevFinalPos,JumpPos),
        \+ member(NextFinalPos,Yi),
        \+ member(NextFinalPos,Bi),
        (member(JumpPos,Yi); member(JumpPos,Bi)),
        NextFinalPos \= FirstInitialPos.

/* Yellow has no more options*/
isGameOver(y,YellowMovers,BlueMovers):-
        getAllPossibleMoves(y,YellowMovers,YellowMovers,BlueMovers,Moves),!,
        list_empty(Moves).

/* Blue has no more options*/
isGameOver(b,YellowMovers,BlueMovers):-
        getAllPossibleMoves(b,BlueMovers,YellowMovers,BlueMovers,Moves),!,
        list_empty(Moves).

list_empty([]).
list_empty([_|_]):- fail.
        


getAllPossibleMovesAux(Player, [Start|Tail],Yi, Bi, CalcMoves, Moves) :-
        isValid(Player,Yi,Bi,Start, Mid, Final),!,
        getAllPossibleMovesAux(Player,Tail,Yi,Bi,[[Start,Final,Mid]|CalcMoves], Moves).
        
/* Used when previous condition fails*/        
getAllPossibleMovesAux(Player,[_|Tail],Yi,Bi,CalcMoves,Moves):- getAllPossibleMovesAux(Player,Tail,Yi,Bi,CalcMoves,Moves).

getAllPossibleMovesAux(_,[],_,_,Moves,Moves).

getAllPossibleMoves(Player,StartingPositions,YMovers,BMovers,Moves):-
        getAllPossibleMovesAux(Player,StartingPositions,YMovers,BMovers,[],Moves),!.


switchPlayer(y, b).
switchPlayer(b,y).


readConsecutiveMove(Player,Yi,Bi,FirstInitial,PrevFinal,Jump,Final):-
        repeat,
        write('Choose final destination for '), write(PrevFinal),
        read(Final),
        isValid(Player,Yi,Bi,PrevFinal,Jump,Final),
        FirstInitial \= Final,
        !.

continuePlaying(y).

getConsecutiveMoveForBot(FirstInitial,[[_,NextFinal,NextMid]|_],NextMid,NextFinal):-
        NextFinal \= FirstInitial.

getConsecutiveMoveForBot(FirstInitial,[[_,NextFinal,_]|Other],MidOutput,FinalOutput):-
        NextFinal == FirstInitial,
        getConsecutiveMoveForBot(FirstInitial,Other,MidOutput,FinalOutput).
getConsecutiveMoveForBot(_,[],_,_):- fail.


validateYesOrNo(y).
validateYesOrNo(n).

makeConsecutivePlay(Player,Yi,Bi,FirstInitial,PrevFinal,Yo,Bo,bot,Count):-
        Count < 3,
        write('Checking for available next moves'),nl,
        getAllPossibleMoves(Player,[PrevFinal],Yi,Bi,Moves),
        getConsecutiveMoveForBot(FirstInitial,Moves,NextMid,NextFinal),
        write('Moving from '), write(PrevFinal), write(' to '), write(NextFinal),nl,
        move(Yi,Bi,PrevFinal,NextMid,NextFinal,Yo2,Bo2,bot),!,
        makeConsecutivePlay(Player,Yo2,Bo2,FirstInitial,NextFinal,Yo,Bo,bot,Count + 1).

makeConsecutivePlay(Player,Yi,Bi,FirstInitial,PrevFinal,Yo,Bo,human,Count):-
        Count < 3,
        write('Checking for available next moves'),nl,
        getAllPossibleMoves(Player,[PrevFinal],Yi,Bi,Moves),
        \+ list_empty(Moves),
        write('Continue Playing? (y/n)'),nl,
        read(IsToContinue),
        continuePlaying(IsToContinue),
        readConsecutiveMove(Player,Yi,Bi,FirstInitial,PrevFinal,NextJump,NextFinal),
        move(Yi,Bi,PrevFinal,NextJump,NextFinal,Yo2,Bo2,human),!,
        makeConsecutivePlay(Player,Yo2,Bo2,FirstInitial,NextFinal,Yo,Bo,human,Count + 1).
        

makeConsecutivePlay(_,Yi,Bi,_,_,Yi,Bi,_,_):-
        write('No more moves available'),nl.


getBotDiff(y,YDif,_,YDif).
getBotDiff(b,_,BDif,BDif).

gameHuman(Player,Yi,Bi,Yo,Bo):-
        displayBoard(Yi,Bi),
        \+ isGameOver(Player,Yi,Bi),
        writeWhoIsPlaying(Player,human),
        readValidPlay(Initial,Jump,Final,Yi,Bi,Player),
        move(Yi,Bi,Initial,Jump,Final,Yo1,Bo1,human),!,
        makeConsecutivePlay(Player,Yo1,Bo1,Initial,Final,Yo,Bo,human,1).

getPersonalMovers(y,Yi,_,Yi).
getPersonalMovers(b,_,Bi,Bi).

gameBot(Player,Yi,Bi,Yo,Bo,YDif,BDif):-
        \+ isGameOver(Player,Yi,Bi),
        getBotDiff(Player,YDif,BDif,BotDiff),
        BotDiff == 1,
        displayBoard(Yi,Bi),
        writeWhoIsPlaying(Player,bot),
        getPersonalMovers(Player,Yi,Bi,MyMovers),
        getAllPossibleMoves(Player,MyMovers,Yi,Bi,[[Start,Final,Mid] | _]),
        write('Moving '), write(Start), write(' To '), write(Final),nl,
        move(Yi,Bi,Start,Mid,Final,Yo,Bo,bot).

gameBot(Player,Yi,Bi,Yo,Bo,YDif,BDif):-
        \+ isGameOver(Player,Yi,Bi),
        getBotDiff(Player,YDif,BDif,BotDiff),
        BotDiff == 2,
        displayBoard(Yi,Bi),
        writeWhoIsPlaying(Player,bot),
        getPersonalMovers(Player,Yi,Bi,MyMovers),
        getAllPossibleMoves(Player,MyMovers,Yi,Bi,[[Start,Final,Mid] | _]),
        write('Moving '), write(Start), write(' To '), write(Final),nl,
        move(Yi,Bi,Start,Mid,Final,Yo1,Bo1,bot),
        makeConsecutivePlay(Player,Yo1,Bo1,Start,Final,Yo,Bo,bot,1).

/* PC-PC */
game(Yi,Bi,Player,3,YDific,BDific):-
        \+ isGameOver(Player,Yi,Bi),
        gameBot(Player,Yi,Bi,Yo,Bo,YDific,BDific),
        switchPlayer(Player,NextPlayer),
        game(Yo,Bo,NextPlayer,3,YDific,BDific).

/* Human-Pc*/
game(Yi,Bi,y,2,_,BDific):-
        \+ isGameOver(y,Yi,Bi),
        gameHuman(y,Yi,Bi,Yo,Bo),!,
        game(Yo,Bo,b,2,_,BDific).
game(Yi,Bi,b,2,_,BDific):-
        \+ isGameOver(b,Yi,Bi),
        gameBot(b,Yi,Bi,Yo,Bo,_,BDific),!,
        game(Yo,Bo,y,2,_,BDific).

/* Player Vs Player With Possible initial moves*/
game(Yi,Bi,Player,1,_,_) :-
        \+ isGameOver(Player,Yi,Bi),
        gameHuman(Player,Yi,Bi,Yo,Bo),
        switchPlayer(Player,NextPlayer),
        game(Yo,Bo,NextPlayer,1,_,_).
        
game(Yi,Bi,_,_,_,_):-
        displayBoard(Yi,Bi),
        write('Game Over'),nl,nl,
        winner(Yi,Bi).
        
        

validStartOption(MODE) :- integer(MODE), MODE > 0, MODE < 4.
validDificOption(MODE) :- integer(MODE), MODE > 0, MODE < 3.

readValidPlay(InitialPos,JumpPos,FinalPos,Yi,Bi,Player):-
        repeat,
                write('Select valid initial pos: '),
                read(InitialPos),
                nl,
                write('Select valid final pos'),
                read(FinalPos),nl,
                isValid(Player, Yi,Bi,InitialPos,JumpPos,FinalPos),
                !.

chooseDificulty(b, Dificulty) :- nl, put_code(201), 
        put_code(205),put_code(205),
        write('BOT Blue Dificulty'),
        put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(187),nl,
        put_code(186), write('  1. Easy               '), put_code(186),nl,
        put_code(186), write('  2. Medium             '), put_code(186),nl,
        put_code(200), 
        put_code(205),put_code(205), put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205), put_code(205), put_code(205), put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(188),nl,nl,nl,
        repeat,
                write('Insert Valid Option: '),
                read(Dificulty),nl,
                validDificOption(Dificulty),
        !.

chooseDificulty(y, Dificulty) :- nl, put_code(201), 
        put_code(205),put_code(205),
        write('BOT Yellow Dificulty'),
        put_code(205),put_code(205),
        put_code(187),nl,
        put_code(186), write('  1. Easy               '), put_code(186),nl,
        put_code(186), write('  2. Medium             '), put_code(186),nl,
        put_code(200), 
        put_code(205),put_code(205), put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205), put_code(205), put_code(205), put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(188),nl,nl,nl,
        repeat,
                write('Insert Valid Option: '),
                read(Dificulty),nl,
                validDificOption(Dificulty),
        !.

start :- nl, put_code(201), 
        put_code(205), put_code(205),put_code(205),put_code(205), put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        write('MENU'),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(187),nl,
        put_code(186), write('  1.Player vs Player  '), put_code(186),nl,
        put_code(186), write('  2.Player vs PC      '), put_code(186),nl,
        put_code(186), write('  3.PC vs PC          '), put_code(186),nl,
        put_code(200), 
        put_code(205), put_code(205),put_code(205),put_code(205), put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205), put_code(205), put_code(205), put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(188),nl,nl,nl,
        repeat,
                write('Insert Valid Option: '),
                read(MODE),nl,
                validStartOption(MODE),
        !,
        initialBoard(Y,B),
        initGames(Y,B,MODE).

initGames(Y, B, MODE):- MODE == 1, game(Y,B,y,MODE,_,_).
initGames(Y, B, MODE):- MODE == 2, chooseDificulty(b, Dific), game(Y,B,y,MODE,_,Dific).
initGames(Y, B, MODE):- MODE == 3, chooseDificulty(y, YDific), chooseDificulty(b, BDific), game(Y,B,y,MODE,YDific,BDific).
