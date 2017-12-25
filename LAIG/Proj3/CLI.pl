displaySingleP(P, PiecesY, _) :- member(P,PiecesY),!, write(y), write('   '). 
displaySingleP(P, _, PiecesB) :- member(P,PiecesB),!, write(b), write('   ').
displaySingleP(_,_,_) :- write(e), write('   ').
displayPos([H|T],PiecesY,PiecesB) :- displaySingleP(H,PiecesY,PiecesB),
                                displayPos(T,PiecesY,PiecesB).
displayPos([],_,_).

displayLine(1,PiecesY,PiecesB) :- write('    g9--g8--g7--g6      '), 
                                put_code(186) ,
                                write('       '), displayPos([g9,g8,g7,g6],PiecesY,PiecesB), 
                                nl, 
                                write('      '), put_code(92), write(' / '), put_code(92), write(' / '), put_code(92), write(' /       '), 
                                put_code(186), 
                                write('        '), put_code(92), write('         /  '), 
                                nl.

displayLine(2,PiecesY,PiecesB) :- write('b6    g5--g4--g3    r9  '), 
                                put_code(186) ,
                                write('   '), displaySingleP(b6,PiecesY,PiecesB), write('  '),
                                displayPos([g5,g4,g3],PiecesY,PiecesB), write('  '),
                                displaySingleP(r9,PiecesY,PiecesB), 
                                nl, 
                                write('|'), put_code(92), write('      '), put_code(92), write(' / '), put_code(92), write(' /     /|  '), 
                                put_code(186), 
                                write('    '),put_code(92), write('     '), put_code(92), write('     /     /'), 
                                nl.

displayLine(3,PiecesY,PiecesB) :- write('| b3    g2--g1    r5 |  '), 
                                put_code(186) , 
                                write('     '), displaySingleP(b3,PiecesY,PiecesB), write('  '),
                                displayPos([g2,g1],PiecesY,PiecesB), write('  '),
                                displaySingleP(r5,PiecesY,PiecesB), 
                                nl, 
                                write('| /'), put_code(92), write('      '), put_code(92), write(' /     /'), put_code(92),write(' |  '), 
                                put_code(186), 
                                write('      '),put_code(92), write('     '), put_code(92), write(' /     /'),  
                                nl.

displayLine(4,PiecesY,PiecesB) :- write('b7  b1    g0    r2  r8  '), 
                                put_code(186) ,
                                write('   '), displayPos([b7,b1],PiecesY,PiecesB), write('  '),
                                displaySingleP(g0,PiecesY,PiecesB), write('  '),
                                displayPos([r2,r8],PiecesY,PiecesB), 
                                nl, 
                                write('|'), put_code(92), write('  /'),put_code(92),  write('  /  | '), put_code(92), write('  /'),put_code(92),
                                write('  /|  '), 
                                put_code(186), 
                                write('        '),put_code(92), write('  /   '), put_code(92), write('  /     '),
                                nl.

displayLine(5,PiecesY,PiecesB) :- write('| b4  b0--mid-r0  r4 |  '), 
                                put_code(186) ,
                                write('     '), displaySingleP(b4,PiecesY,PiecesB),
                                displayPos([b0,mid,r0],PiecesY,PiecesB),
                                displaySingleP(r4,PiecesY,PiecesB), 
                                nl,
                                write('|/  '),put_code(92), write('/  '),put_code(92),  write('  | /  '), put_code(92), write('/  '),
                                put_code(92),write('|  '), 
                                put_code(186), 
                                write('        /  '),put_code(92), write('   /  '), put_code(92), write('     '),
                                nl.

displayLine(6,PiecesY,PiecesB) :- write('b8  b2    y0    r1  r7  '), 
                                put_code(186),
                                write('   '), displayPos([b8,b2],PiecesY,PiecesB), write('  '),
                                displaySingleP(y0,PiecesY,PiecesB), write('  '),
                                displayPos([r1,r7],PiecesY,PiecesB), 
                                nl, 
                                write('| '), put_code(92), write('/      / '), put_code(92), write('     '), put_code(92),write('/ |  '), 
                                put_code(186), 
                                write('      /     / '),put_code(92), write('     '), put_code(92),    
                                nl.

displayLine(7,PiecesY,PiecesB) :- write('| b5    y1--y2    r3 |  '), 
                                put_code(186) ,
                                write('     '), displaySingleP(b5,PiecesY,PiecesB),
                                write('  '), displayPos([y1,y2],PiecesY,PiecesB),
                                write('  '), displaySingleP(r3,PiecesY,PiecesB), 
                                nl,
                                write('|'), write('/      / '), put_code(92), write(' / '), put_code(92), write('     '), 
                                put_code(92), write('|  '), 
                                put_code(186), 
                                write('    /     /     '),put_code(92), write('     '), put_code(92),  
                                nl.
                                
displayLine(8,PiecesY,PiecesB) :- write('b9    y3--y4--y5    r6  '), 
                                put_code(186) ,
                                write('   '), displaySingleP(b9,PiecesY,PiecesB), 
                                write('  '), displayPos([y3,y4,y5],PiecesY,PiecesB),
                                write('  '), displaySingleP(r6,PiecesY,PiecesB), 
                                nl,
                                write('     / '), put_code(92), write('  / '), put_code(92), write(' / '), put_code(92), write('       '), 
                                put_code(186), 
                                write('        /         '), put_code(92),  
                                nl.

displayLine(9,PiecesY,PiecesB) :- write('    y6--y7--y8--y9      '), 
                                put_code(186) ,
                                write('       '), displayPos([y6,y7,y8,y9],PiecesY,PiecesB), 
                                nl, 
                                nl.

displayBoard(Y,B) :- 
        nl,
        write('       Positions        '), put_code(186), write('        Game Board'), nl, 
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(206),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),put_code(205),
        put_code(205),put_code(205),put_code(205),put_code(205),nl,
        displayLine(1,Y,B),
        displayLine(2,Y,B), 
        displayLine(3,Y,B), 
        displayLine(4,Y,B),
        displayLine(5,Y,B),
        displayLine(6,Y,B),
        displayLine(7,Y,B),
        displayLine(8,Y,B),
        displayLine(9,Y,B),
        nl,nl.


writeWhoIsPlaying(b, human):-
        write('Blue Human Turn'),nl.
writeWhoIsPlaying(y, human):-
        write('Yellow Human Turn'),nl.
writeWhoIsPlaying(b, bot):-
        write('Blue Bot Turn'),nl.
writeWhoIsPlaying(y, bot):-
        write('Yellow Bot Turn'),nl.