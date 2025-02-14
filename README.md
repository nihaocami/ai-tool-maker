# ✦ AI Tool Maker

Turn any OpenAPI spec into AI tools that plug right into your Vercel AI SDK apps.

# Beta

This project is in early development, however you should be able to generate tools from any OpenAPI spec. If you find an issue, please open a PR.

## Usage

The simplest way you can get started is to run this

```shell
npx aitm ./path/to/output ./path/to/openapi-spec.json
```

This will generate a few things for you in your output path:

- The `*.gen.ts` files are your api client generated from your OpenAPI specs. We use [hey-api](https://github.com/hey-api/openapi-ts) for that.

- In the `tool` directory you'll find your AI SDK compatible tools that you can easily import and use. This folder also includes `aitm.schema.ts` which has all `zod` schemas used by your tools.

After generating your tools, simply import them like you would with any other module and pass it in your AI SDK `tools` param.

## Configure

By default, we assume that your OpenAPI specs are configured correctly. If that's the case, the client we generate for your APIs should be mostly working fine. However, in many cases you find yourself needing to configure the api client to correctly call your apis. This includes things like the `Authorization` or `Content-Type` headers etc.

In that case you need to create a `openapi-ts.config.ts` file **_outside of the generated dir path_** so it does not get overwritten each time you generate the tools.

Here's a started for `openapi-ts.config.ts`

```typescript
import type { CreateClientConfig } from "@hey-api/client-fetch";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: "https://example.com",
});
```

Then correctly provide the path to this file in the CLI

```shell
npx aitm ./path/to/output ./path/to/openapi-spec.json -c ./path/to/openapi-ts.config.ts
```

For more details about the configurations check out these [docs](https://heyapi.dev/openapi-ts/configuration).
