import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", "node_modules/**", "docs/**", "video/**"] }];

export default config;
