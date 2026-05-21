import hmac
import hashlib
import sys

def get_bomb_positions(server_seed: str, client_seed: str, nonce: int, mine_count: int, grid_size: int = 25):
    """
    Python implementation of the provably fair algorithm used in the web app.
    It takes the server_seed (unhashed), client_seed, and nonce, and returns
    the exact positions of the bombs on the 5x5 grid (0-24).
    """
    bombs = set()
    current_round = 0

    server_seed_bytes = server_seed.encode('utf-8')

    while len(bombs) < mine_count:
        message = f"{client_seed}:{nonce}:{current_round}".encode('utf-8')

        # Calculate HMAC-SHA256
        hash_hex = hmac.new(server_seed_bytes, message, hashlib.sha256).hexdigest()

        # Process hash in 8-character (4-byte) chunks
        for i in range(len(hash_hex) // 8):
            hex_chunk = hash_hex[i*8:(i+1)*8]
            int_val = int(hex_chunk, 16)

            # Replicate TypeScript logic: map 4-byte int to float [0, 1) and then to grid size
            max_range = 2**32
            rand_float = int_val / max_range
            position = int(rand_float * grid_size)

            if position not in bombs:
                bombs.add(position)
                if len(bombs) == mine_count:
                    break

        current_round += 1

    return list(bombs)

def get_dice_roll(server_seed: str, client_seed: str, nonce: int) -> float:
    """
    Python implementation of the provably fair algorithm for Dice.
    Returns a float between 0.00 and 100.00.
    """
    server_seed_bytes = server_seed.encode('utf-8')
    message = f"{client_seed}:{nonce}:0".encode('utf-8')

    hash_hex = hmac.new(server_seed_bytes, message, hashlib.sha256).hexdigest()

    hex_chunk = hash_hex[:8]
    int_val = int(hex_chunk, 16)

    max_range = 2**32
    rand_float = int_val / max_range

    roll = rand_float * 100.01
    final_roll = min(roll, 100.00)

    # Format to 2 decimal places (truncating, not rounding, as per Math.floor logic)
    return int(final_roll * 100) / 100

def verify_hash(server_seed: str) -> str:
    """Verifies the SHA256 hash of the server seed"""
    return hashlib.sha256(server_seed.encode('utf-8')).hexdigest()

if __name__ == "__main__":
    print("--- StakeSim Provably Fair Verifier ---")

    game_type = input("Which game to verify? (1: Mines, 2: Dice): ").strip()

    server_seed = input("Enter Server Seed (Un-hashed): ").strip()
    client_seed = input("Enter Client Seed: ").strip()

    try:
        computed_hash = verify_hash(server_seed)
        print(f"\n[+] Computed Server Seed Hash: {computed_hash}")

        nonce = 1 # We use 1 in the app

        if game_type == "1":
            mine_count = int(input("Enter Number of Mines (1-24): ").strip())

            bombs = get_bomb_positions(server_seed, client_seed, nonce, mine_count)
            print(f"\n[+] Bomb Positions (0-24): {sorted(bombs)}")

            print("\nGrid Visualization (B = Bomb, . = Safe):")
            for row in range(5):
                row_str = ""
                for col in range(5):
                    pos = row * 5 + col
                    if pos in bombs:
                        row_str += "[ B ] "
                    else:
                        row_str += "[ . ] "
                print(row_str)

        elif game_type == "2":
            roll = get_dice_roll(server_seed, client_seed, nonce)
            print(f"\n[+] Dice Roll Result: {roll:.2f}")

        else:
            print("Invalid game type selected.")
            sys.exit(1)

    except ValueError:
        print("Invalid input.")
        sys.exit(1)
