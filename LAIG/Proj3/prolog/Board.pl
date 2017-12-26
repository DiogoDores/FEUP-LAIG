boardMembers([mid,r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,g0,g1,g2,g3,g4,g5,g6,g7,g8,g9,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,y0,y1,y2,y3,y4,y5,y6,y7,y8,y9]).

validJump(mid,b1,b0).
validJump(mid,b2,b0).
validJump(b0,y2,y0).
validJump(b0,b3,b1).
validJump(b0,b5,b2).
validJump(b1,y0,b0).
validJump(b1,b6,b3).
validJump(b1,b8,b4).
validJump(b2,b7,b4).
validJump(b2,b9,b5).
validJump(b3,b5,b4).
validJump(b6,b8,b7).
validJump(b7,b9,b8).

validJump(mid,y1,y0).
validJump(mid,y2,y0).
validJump(y0,r2,r0).
validJump(y0,y3,y1).
validJump(y0,y5,y2).
validJump(y1,r0,y0).
validJump(y1,y6,y3).
validJump(y1,y8,y4).
validJump(y2,y7,y4).
validJump(y2,y9,y5).
validJump(y3,y5,y4).
validJump(y6,y8,y7).
validJump(y7,y9,y8).

validJump(mid,r1,r0).
validJump(mid,r2,r0).
validJump(r0,g2,g0).
validJump(r0,r3,r1).
validJump(r0,r5,r2).
validJump(r1,g0,r0).
validJump(r1,r6,r3).
validJump(r1,r8,r4).
validJump(r2,r7,r4).
validJump(r2,r9,r5).
validJump(r3,r5,r4).
validJump(r6,r8,r7).
validJump(r7,r9,r8).

validJump(mid,g1,g0).
validJump(mid,g2,g0).
validJump(g0,b2,b0).
validJump(g0,g3,g1).
validJump(g0,g5,g2).
validJump(g1,b0,g0).
validJump(g1,g6,g3).
validJump(g1,g8,g4).
validJump(g2,g7,g4).
validJump(g2,g9,g5).
validJump(g3,g5,g4).
validJump(g6,g8,g7).
validJump(g7,g9,g8).

validJump(b0, r0, mid).
validJump(y0, g0, mid).
validJump2(X,Y,Z):- validJump(X,Y,Z).
validJump2(X,Y,Z):- validJump(Y,X,Z).

/*
blueMoversInitialPos([r1,r2,r3,r4,r5,r6,r7,r8,r9,b1,b2,b3,b4,b5,b6,b7,b8,b9]).
yellowMoversInitialPos([y1,y2,y3,y4,y5,y6,y7,y8,y9,g1,g2,g3,g4,g5,g6,g7,g8,g9]).

blueMoversMidGamePos([y1,r1,r5,r6,r7,r8,r9,b1,b5,b6,b7,mid]).
yellowMoversMidGamePos([r3,y2,y4,y5,y8,y9,g1,g4,g7,g8,g9]).

blueMoversFinalPos([]).
yellowMoversFinalPos([y2,y8,y9,g1,g9]).*/

blueMoversPos([r1,r2,r3,r4,r5,r6,r7,r8,r9,b1,b2,b3,b4,b5,b6,b7,b8,b9]).
yellowMoversPos([y1,y2,y3,y4,y5,y6,y7,y8,y9,g1,g2,g3,g4,g5,g6,g7,g8,g9]).

blueArea([r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9]).
yellowArea([y0,y1,y2,y3,y4,y5,y6,y7,y8,y9,g0,g1,g2,g3,g4,g5,g6,g7,g8,g9]).

initialBoard(Y,B) :- blueMoversPos(B), yellowMoversPos(Y).