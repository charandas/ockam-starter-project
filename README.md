# ockam-starter-project

This is a Typescript project I undertook which entailed translating the TcpTransport part of the current Ockam Rust library. It is still a WIP, but here are some thoughts:

1. `TcpRouter` and `TcpRouterHandle` and they themselves talking using an `api_addr` is overkill for just a PoC. Instead, the `TcpRouter` could likely just directly take function calls and register new pairs et cetera.
2. I am not sure how registrations benefit in the current TcpRouter design. It saves the connected peers in `accepts` but on registration, perhaps it gets used in one of the other crates.
3. Bare Message related ser(de) code in Ockam Rust shows the vector length being read into a u64, but elsewhere in the TCP library, `prepare_message` does a 16-bit length prefix. I am not sure why the discrepancy. I went out of my way to use BigInt to capture the 8 bytes from the message preamble but that didn't make other Node.js APIs happy as they expect type `number` for length on most of the Socket APIs.
4. I was able to use `@bare-ts/lib` and adapt a JSON based Duplex Stream implementation (see [MessageSocket](./src/worker/message_socket.mts)) I read a blog post about to use Bare definitions for a `TransportMessage` I wrote.
5. I had to patch the current typescript code in `implementations/typescript` to export `uint8`:
  ```
  --- a/implementations/typescript/ockam/ockam/src/routing.ts
  +++ b/implementations/typescript/ockam/ockam/src/routing.ts
  @@ -2,7 +2,7 @@
  /**
    * An 8-bit unsigned integer.
    */
  -type uint8 =
  +export type uint8 =
  ```

## Tooling and Decisions

1. Since Typescript is a different kind of language from Rust, I resorted to cover traits in interfaces in most places.
2. Whereever Rust code used `Option<>`, I used the optional `?` annotation for member fields in constructors. In those cases, I also had to move these fields to the right, being they are optional.
3. `import { type Result } from "ts-results"`. This library came handy is keeping some of the rust nature of the code by using `Result<boolean>` and the like, however, it did lack the option of skipping the error part. So I came up with the generic error `TransportError`.
4. I started with `prettier` for the linter but came across `rome` and thought it was also nice.
5. I linked against current Ockam typescript library using `npm install --save ../ockam/implementations/typescript/ockam/ockam`.


### TODO

- [ ] Implement `Context` to be more than just an interface, so `ctx.Forward` and `ctx.Send` actually work.
- [ ] Implement `TcpTransport` fully once router is ready and register with `Context`
- [ ] Implement `TcpReceiveProcessor` and `start_pair` functions
- [ ] Testing
