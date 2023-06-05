![voks](./docs/voks-logo.svg)

[![deno.land/x version](https://shield.deno.dev/x/voks)](https://deno.land/x/voks)
[![npm version](https://img.shields.io/npm/v/@voks/voks)](https://www.npmjs.com/package/@voks/voks)

voks [ˈvokʃ], danish for wax, is a minimal, yet powerful enough templating
language based on Javascript Template Literals. It provides the ability to
define and compose typescript checked components, while not losing the
flexibility of html declarations.

Rendering speed is not the foremost goal of this library, as I see most
performance problems not in the rendering layer of classical web application
frameworks but in overly excessive use of javascript in the frontend.

## Release History

[https://github.com/voks-templating/voks/releases](https://github.com/voks-templating/voks/releases)

## API

- `html` - tagged template literal function to declare simple minimal components
- `attr` - function to declare dynamic html attributes with escaped values
- `renderToString` - renders given html template components to a string. The
  complete template will be resolved before
- `renderToStream` - writes the template parts to the stream, once ready. Waits
  for async content, which results in iterative "write when ready" rendering.

## Usage

### [deno](https://deno.land)

Deno is written in deno so that it is a deno first class ~reptile~ citizen.

To have a better understanding of how things work, please give a look to the
examples. But the code below shows the basic usage:

```typescript
import {
  html,
  HTMLTemplate,
  renderToStream,
} from "https://deno.land/x/voks/mod.ts";

const viewComponent = (content: HTMLTemplate) =>
  html`<p>${"hello"}</p> <p>${asyncFunc("world!")}</p>`;

await renderToStream(
  Deno.stdout,
  viewComponent,
);
```

The above results in proper stream rendering to the clients, allowing the
browser client to show content, that is available already, and waiting for
content, not yet available.

This allows some fancy stuff like aborting such calls, when they take too long,
and replace them by client side islands, that translude that content at client
time. (See the express example for more details about that.)

### [nodejs](https://nodejs.org/)

voks is beeing built for nodejs with esbuild with esm module format targeting
nodjs18.8 (see [./scripts/build.node.ts](./scripts/build.node.ts)).

Install voks as npm dependency:

```shell
npm i --save @voks/voks
```

Example Usage:

```javascript
import { attr, html, renderToString } from "voks";

const template = html`<div ${[
  attr("class", "fubar"),
  attr("checked", true),
]} />`;

const res = await renderToString(template);
console.log(res);
```

## Content Escaping

All keys passed to the `html` tagged template function are escaped when they are
not itself generators. If you pass a generator function itself it has to escape
content, when before passing it to yield.

It can be considered as safe to pass `html` generators as keys.

```typescript
renderToStream(html`<div>${"<script>console.log("hello, world!")</script>"}</div>`) # => "<div>&lt;script&gt;console.log(&quot;hello, world!&quot;)&lt;/script&gt;</div>"

renderToStream(html`<div>${html`<script>console.log("hello, world!")</script>`}</div>`) # => "<div><script>console.log("hello, world!")</script></div>"
```

### Attributes and Escaping

If you want to render attributes in a conditional or dynamic manner, you cannot
rely on plain template literals as they would be escaped. So the following
example will **not work** properly.

```typescript
const range = (min) => html`<input type="range" ${min !== undefined ? `min="${min}"` : ''}` ⚡️
```

If you want to render dynamic properties as a template literal value you need to
**use the `attr` function**.

```typescript
const range = (min) => html`<input type="range" ${min !== undefined ? attr('min', min) : ''}` ✅
```

## Contribution

### Tasks

Tasks can be invoked with `deno task [TASKNAME]`:

- `deps:load` - loads dependencies to deno cache if dependencies have been
  updated remotely
- `run` - kicks off the service
- `run:debug` - starts the service in debug mode
- `run:example:synch` - runs a synchronous rendering example
- `run:example:stream` - runs a stream rendering example
- `run:example:express` - starts an express app at localhost:3001, showing an
  example integration with fallback handling.

## Settings

The project settings are set via environment variables. Please give a look to
the `.env.example` file to see, which environment variables will be evaluated.
To enable settings for your app, provide them in the run environment or create a
`.env` file, likewise to the example file.

## Testing

:)

```shell
deno test
```

## Benchmarks

```shell
deno bench
```
