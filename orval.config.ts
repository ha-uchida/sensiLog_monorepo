import { defineConfig } from 'orval';

export default defineConfig({
  sensilog: {
    input: {
      target: 'http://localhost:3001/docs-json',
    },
    output: {
      mode: 'split',
      target: './apps/web/src/lib/api-client/generated/endpoints.ts',
      schemas: './apps/web/src/lib/api-client/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './apps/web/src/lib/api-client/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});