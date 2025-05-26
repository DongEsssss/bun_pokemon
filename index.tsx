import { renderToReadableStream } from "react-dom/server";

import PokemonList from "./components/pokemoList";
import Pokemon from "./components/pokemon";

import { PokemonResponse } from "./types/PokemonResponse";
import { PokemonsResponse } from "./types/PokemonResponses";

Bun.serve({
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === "/pokemon") {
            const response = await fetch("https://pokeapi.co/api/v2/pokemon");
            const { results } = (await response.json()) as PokemonsResponse;
            const stream = await renderToReadableStream(
                <PokemonList pokemon={results} />
            );
            return new Response(stream, {
                headers: { "Content-Type": "text/html" },
            });
        }

        const pokemonNameRegex = /^\/pokemon\/([a-zA-Z0-9_-]+)$/;
        const match = url.pathname.match(pokemonNameRegex);
        if (match) {
            const pokemonName = match[1];
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
            );
            if (response.status === 404) {
                return new Response("Not Found", { status: 404 });
            }
            const {
                height,
                name,
                weight,
                sprites: { front_default },
            } = (await response.json()) as PokemonResponse;
            const stream = await renderToReadableStream(
                <Pokemon
                    name={name}
                    height={height}
                    weight={weight}
                    img={front_default}
                />
            );
            return new Response(stream, {
                headers: { "Content-Type": "text/html" },
            });
        }
        return new Response("찾을 수 없음", { status: 404 });
    },
});

console.log("로딩 중");
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon/<pokemon_name>`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon?name=<pokemon_name>`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon?name=<pokemon_name>&limit=<number>&offset=<number>`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon?name=<pokemon_name>&limit=<number>&offset=<number>&search=<search_term>`);
console.log(`Server running at http://localhost:${Bun.env.PORT || 3000}/pokemon?name=<pokemon_name>&limit=<number>&offset=<number>&search=<search_term>&sort=<sort_order>`);    