# ✦ AI Tool Maker (beta)

Turn any OpenAPI spec into AI tools that plug right into your Vercel AI SDK apps.

## Usage

The simplest way you can get started is to run this

```
npx aitm ./path/to/output ./path/to/openapi-spec.json
```

This will generate a few things for you in your output path:

- The `*.gen.ts` files are your api client generated from your OpenAPI specs. We use [hey-api](https://github.com/hey-api/openapi-ts) for that.

- In the `tool` directory you'll find your AI SDK compatible tools that you can easily import and use. This folder also includes `aitm.schema.ts` which has all `zod` schemas used by your tools.

After generating your tools, simply import them like you would with any other module and pass it in your AI SDK `tools` param.
