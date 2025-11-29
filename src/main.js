const BASE_URL = 'https://pokeapi.co/api/v2';

const pokemonInfo = {};
const typesInfo = {};

const getPokemonInfo = async (name) => {
  if (pokemonInfo[name]) return pokemonInfo[name];

  const url = `${BASE_URL}/pokemon/${name}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const pokemon = await response.json();
    pokemonInfo[name] = {
      id: pokemon.id,
      name: pokemon.name,
      displayName: pokemon.name[0].toUpperCase() + pokemon.name.slice(1),
      image: pokemon.sprites.other['official-artwork'].front_default,
      types: pokemon.types.map(t => t.type.name),
    };

    return pokemonInfo[name];
  } catch (error) {
    console.error(error.message)
  }
};

const getTypeInfo = async (name) => {
  if (typesInfo[name]) return typesInfo[name];

  const url = `${BASE_URL}/type/${name}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const type = await response.json();
    typesInfo[name] = {
      id: type.id,
      name: type.name,
      displayName: type.name[0].toUpperCase() + type.name.slice(1),
      image: type.sprites['generation-ix']['scarlet-violet'].name_icon,
      damageRelations: {
        attack: {
          double: type.damage_relations.double_damage_to.map(t => t.name),
          half: type.damage_relations.half_damage_to.map(t => t.name),
          none: type.damage_relations.no_damage_to.map(t => t.name),
        },
        defense: {
          double: type.damage_relations.double_damage_from.map(t => t.name),
          half: type.damage_relations.half_damage_from.map(t => t.name),
          none: type.damage_relations.no_damage_from.map(t => t.name),
        },
      },
    };

    return typesInfo[name];
  } catch (error) {
    console.error(error.message)
  }
}

const populatePokemonInfo = async (name) => {
  const pokemon = await getPokemonInfo(name.toLowerCase())
  const resultBlock = document.getElementById('results');
  resultBlock.hidden = false;

  if (!pokemon) {
     alert(`Pokemon ${name} not found. Check the spelling or try using the Pokemon ID`);
     return;
  }

  document.getElementById('pokemonName').textContent = pokemon.displayName.split('-')[0];
  document.getElementById('pokemonImage').src = pokemon.image;

  const typesBlock = document.getElementById('pokemonType').getElementsByClassName('pokemonTypes')[0];
  typesBlock.innerHTML = '';
  const strongAgainst = new Set();
  const weakAgainst = new Set();
  for (const type of pokemon.types) {
    const typeInfo = await getTypeInfo(type);
    typeInfo.damageRelations.attack.double.forEach(type => strongAgainst.add(type));
    typeInfo.damageRelations.attack.half.forEach(type => weakAgainst.add(type));
    typeInfo.damageRelations.attack.none.forEach(type => weakAgainst.add(type));
    typeInfo.damageRelations.defense.double.forEach(type => weakAgainst.add(type));
    typeInfo.damageRelations.defense.half.forEach(type => strongAgainst.add(type));
    typeInfo.damageRelations.defense.none.forEach(type => strongAgainst.add(type));

    const image = document.createElement("img");
    image.src = typeInfo.image;
    image.alt = typeInfo.displayName;
    image.className = 'type-image'
    typesBlock.appendChild(image);
  }

  for (const type of strongAgainst) {
    if (weakAgainst.has(type)) {
      strongAgainst.delete(type);
      weakAgainst.delete(type);
    }
  }

  const strongAgainstBlock = document.getElementById('strongAgainst').getElementsByClassName('pokemonTypes')[0];
  strongAgainstBlock.innerHTML = '';
  for (const type of strongAgainst) {
    const typeInfo = await getTypeInfo(type);
    const image = document.createElement("img");
    image.src = typeInfo.image;
    image.alt = typeInfo.displayName;
    image.className = 'type-image'
    strongAgainstBlock.appendChild(image);
  }
  if (strongAgainst.size === 0) {
    strongAgainstBlock.innerHTML = '<p>None</p>'
  }

  const weakAgainstBlock = document.getElementById('weakAgainst').getElementsByClassName('pokemonTypes')[0];
  weakAgainstBlock.innerHTML = '';
  for (const type of weakAgainst) {
    const typeInfo = await getTypeInfo(type);
    const image = document.createElement("img");
    image.src = typeInfo.image;
    image.alt = typeInfo.displayName;
    image.className = 'type-image'
    weakAgainstBlock.appendChild(image);
  }
  if (weakAgainst.size === 0) {
    weakAgainstBlock.innerHTML = '<p>None</p>'
  }
}

populatePokemonInfo((Math.floor(Math.random() * 900)).toString());

const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', (e) =>{
  e.preventDefault();
  const formData = new FormData(searchForm);
  const pokemon = formData.get('pokemon');
  if (!pokemon) return;
  populatePokemonInfo(pokemon.trim());
  console.log(pokemon);
});
