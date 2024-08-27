class Game:
    def __init__(self):
        self.board = [['' for _ in range(5)] for _ in range(5)]
        self.players = {'A': [], 'B': []}
        self.turn = 'A'
        self.winner = None

    def add_player(self, player):
        if player in self.players:
            return False
        if len(self.players['A']) == 0:
            self.players['A'] = player
            return True
        elif len(self.players['B']) == 0:
            self.players['B'] = player
            return True
        return False

    def process_move(self, player, move):
        if player != self.turn or self.winner:
            return False, self.board, self.winner

        # Parse the move
        character, direction = move.split(':')
        char_pos = self.find_character(player, character)

        if not char_pos:
            return False, self.board, self.winner

        x, y = char_pos
        new_x, new_y = self.calculate_new_position(x, y, direction, character)

        if not self.is_valid_move(new_x, new_y, player):
            return False, self.board, self.winner

        # Move the character and update the board
        self.board[x][y] = ''
        self.board[new_x][new_y] = f"{player}-{character}"

        # Check for combat
        self.check_combat(new_x, new_y, player)

        # Switch turn
        self.turn = 'B' if self.turn == 'A' else 'A'

        # Check for a winner
        self.check_winner()

        return True, self.board, self.winner

    def find_character(self, player, character):
        for i in range(5):
            for j in range(5):
                if self.board[i][j] == f"{player}-{character}":
                    return i, j
        return None

    def calculate_new_position(self, x, y, direction, character):
        if character == 'Pawn':
            if direction == 'L':
                return x, y - 1
            elif direction == 'R':
                return x, y + 1
            elif direction == 'F':
                return x - 1, y
            elif direction == 'B':
                return x + 1, y
        elif character == 'Hero1':
            if direction == 'L':
                return x, y - 2
            elif direction == 'R':
                return x, y + 2
            elif direction == 'F':
                return x - 2, y
            elif direction == 'B':
                return x + 2, y
        elif character == 'Hero2':
            if direction == 'FL':
                return x - 2, y - 2
            elif direction == 'FR':
                return x - 2, y + 2
            elif direction == 'BL':
                return x + 2, y - 2
            elif direction == 'BR':
                return x + 2, y + 2
        return x, y

    def is_valid_move(self, x, y, player):
        if x < 0 or x >= 5 or y < 0 or y >= 5:
            return False
        if self.board[x][y] and self.board[x][y].startswith(player):
            return False
        return True

    def check_combat(self, x, y, player):
        opponent = 'B' if player == 'A' else 'A'
        if self.board[x][y].startswith(opponent):
            self.board[x][y] = ''  # Eliminate opponent's character

    def check_winner(self):
        if all(not cell.startswith('B') for row in self.board for cell in row):
            self.winner = 'A'
        elif all(not cell.startswith('A') for row in self.board for cell in row):
            self.winner = 'B'

    def reset(self):
        self.board = [['' for _ in range(5)] for _ in range(5)]
        self.turn = 'A'
        self.winner = None
