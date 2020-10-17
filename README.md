# Battleship-JS

All logic for the Battleship computer player is done in client side JS.

The first few shots made the computer player are determined using a pseudorandom number generator. These numbers are also restricted to a checker board like pattern on the board. (Due to the shortest ship being 2 squares long, you can fire at only half of the squares on the board and be guaranteed to eventually find all ships.)

After, the likelihood of any ship being at any given square on the game board is determined by iterating over all ships not sunk and seeing if they fit in the unfired at squares. If a ship fits in a location, all of those squares gain one point. After all ships that are not sunk are tried against all vertical and horizontal locations, the computer player fires at the square of the highest score. If multiple squares have the same score, one is randomly chosen.

Computer player then procedurally fires around found ships to sink them using a variety of techniques to handle all scenarios. (i.e. Parallel ships, Perpendicular ships, etc...)
