import { type Context } from "@ockam/ockam/src/worker"

import { type Result, Ok } from "ts-results"

import { Server, SocketAddress, type Socket } from "net"

import { TcpSendWorker } from "./sender.mjs"
import { TransporttErr } from "../types/errors.mjs"
import { MessageSocket } from "./message_socket.mjs"
import { TcpRouterHandle } from "../router/handle.mjs"

// Will call Register on the router_handle, pass it the pair -- all this in .process()
interface Processor {
  initialize(ctx: Context): Result<boolean, TransporttErr>
  process(ctx: Context): Result<boolean, TransporttErr>
}

class TcpListenProcessor implements Processor {
  inner?: Server
  addr?: SocketAddress
  router_handle: TcpRouterHandle

  constructor(router_handle: TcpRouterHandle) {
    this.router_handle = router_handle
  }

  initialize(ctx: Context): Result<boolean, TransporttErr> {
    return Ok(true)
  }
  start(ctx: Context, router_handle: TcpRouterHandle, addr: SocketAddress) {
    this.inner = new Server((_socket: Socket) => { // Add options here
      const socket = new MessageSocket(_socket);
      socket.on('data', data => {
        console.log(data);
      });
      socket.on('error', console.error);
      const worker_pair = TcpSendWorker.new_pair(this.router_handle,
          new SocketAddress({address: _socket.remoteAddress}),
          [],
          socket)
    });
    this.addr = addr
  }
  process(ctx: Context): Result<boolean, TransporttErr> {
    // "Waiting for incoming TCP connection..."
    this.inner?.listen(this.addr?.port, this.addr?.address)

    // this.router_handle.Register
    return Ok(true)
  }
}
