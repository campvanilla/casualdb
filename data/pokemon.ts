export interface Pokemon {
  id: number;
  name: string;
  weight: number;
  height: number;
  types: string[];
}

export const pokemon: Pokemon[] = [
  {
    "name": "charizard",
    "id": 6,
    "weight": 905,
    "height": 17,
    "types": ["fire", "flying"],
  },
  {
    "name": "typhlosion",
    "id": 157,
    "weight": 795,
    "height": 17,
    "types": ["fire"],
  },
  {
    "name": "emboar",
    "id": 500,
    "weight": 1500,
    "height": 16,
    "types": ["fire", "fighting"],
  },
  {
    "name": "garchomp",
    "id": 445,
    "weight": 950,
    "height": 19,
    "types": ["ground", "dragon"],
  },
  {
    "name": "diglett",
    "id": 50,
    "weight": 8,
    "height": 2,
    "types": ["ground"],
  },
  {
    "name": "jirachi",
    "id": 385,
    "weight": 11,
    "height": 3,
    "types": ["steel", "psychic"],
  },
  {
    "name": "flabebe",
    "id": 669,
    "weight": 1,
    "height": 1,
    "types": ["fairy"],
  },
  {
    "name": "wailord",
    "id": 321,
    "weight": 3980,
    "height": 145,
    "types": ["water"],
  },
];
