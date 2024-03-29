:-include('Logic.pl').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		% write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			% write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),

		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),

		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),

		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.

close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply),error(_,_),fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),

	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),

	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).

read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

parse_input(handshake, handshake).
% Request: 0 - initial; 1 - to make a move ; 2 - with mover to remove ; 9 - check game over
% Reply: 0 - initial; 1 - moves ; 2 - bad move ; 3 - asks for mover to remove ; 4 - does move with removing mover ; 8 - not game over; 9 - game Over
parse_input(0, 0-Y-B) :- initialBoard(Y,B).
parse_input(9-Player-Yi-Bi, 9-YP-BP) :- isGameOver(Player,Yi,Bi), points(b,Bi,BP), points(y,Yi,YP).
parse_input(9-Player-Yi-Bi, 8-YP-BP) :- \+ isGameOver(Player,Yi,Bi), points(b,Bi,BP), points(y,Yi,YP).

% Mode: 1 - H/H ; 2 - H/PC ; 3 - PC/PC
parse_input(1-Yi-Bi-Player-Mode-_-_,1-Yo-Bo-PosI-PosJumped-PosF):-
	(Mode ==3 ; Mode == 2, Player == b),
	game(Yi,Bi,Player,Mode,1,1,PosI,PosJumped,PosF, Yo, Bo,MoverToRemove),
	var(MoverToRemove).

	parse_input(1-Yi-Bi-Player-Mode-_-_,1-Yo-Bo-PosI-MoverToRemove-PosF):-
		(Mode ==3 ; Mode == 2, Player == b),
		game(Yi,Bi,Player,Mode,1,1,PosI,_,PosF, Yo, Bo,MoverToRemove),
		\+ var(MoverToRemove).

parse_input(1-Yi-Bi-Player-_-PosI-PosF,2):-
	\+isValid(Player, Yi,Bi,PosI,_,PosF,_).
parse_input(1-Yi-Bi-Player-_-PosI-PosF,3):-
	isValid(Player, Yi,Bi,PosI,_,PosF,1).

%((Mode == 1 ; Mode == 2 , Player == y),isValid(Player, Yi,Bi,PosI,PosJumped,PosF,1) ; (Mode ==3 ; Mode == 2, Player == b))
parse_input(2-Yi-Bi-Player-Mode-PosI-PosF-MoverToRemove,4-Yo-Bo-PosI-MoverToRemove-PosF):-
		isValid(Player, Yi,Bi,PosI,PosJumped,PosF,1),
		game(Yi,Bi,Player,Mode,_,_,PosI,PosJumped,PosF, Yo, Bo, MoverToRemove).


parse_input(1-Yi-Bi-Player-Mode-PosI-PosF,1-Yo-Bo-PosI-PosJumped-PosF):-
		isValid(Player, Yi,Bi,PosI,PosJumped,PosF,0),
		game(Yi,Bi,Player,Mode,_,_,PosI,PosJumped,PosF, Yo, Bo,_).



%parse_input(Initial-Final, 1-handshake-Final) :- write(Initial), nl, write(Final), nl.
%parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).
