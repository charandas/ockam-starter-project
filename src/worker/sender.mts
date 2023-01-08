import { type Worker, type Context } from "@ockam/ockam/src/worker"
import { type Message, type Address } from "@ockam/ockam/src/routing"

import { type Result, Ok } from "ts-results"

import { type SocketAddress, Socket } from "net"

import { type TcpRouterHandle } from "../router/handle.mjs"
import { TransporttErr } from "../types/errors.mjs"
import { MessageSocket } from "./message_socket.mjs"

export class WorkerPair {
  hostnames: String[]
  peer: SocketAddress
  tx_addr: Address
  constructor(hostnames: String[], peer: SocketAddress, tx_addr: Address) {
    this.hostnames = hostnames
    this.peer = peer
    this.tx_addr = tx_addr
  }
}

export type NewPairResponse = {
  worker_pair: WorkerPair
  tcp_send_worker: TcpSendWorker
}

export class TcpSendWorker implements Worker {
  router_handle: TcpRouterHandle
  peer: SocketAddress
  internal_addr: Address
  rx_addr?: Address
  rx_should_be_stopped = true
  stream?: MessageSocket
  constructor(
    router_handle: TcpRouterHandle,
    peer: SocketAddress,
    internal_addr: Address,
    stream?: MessageSocket,
  ) {
    this.router_handle = router_handle
    this.peer = peer
    this.internal_addr = internal_addr
    this.stream = stream
  }
  // Called by the node system in the WorkerRelay's `run` method
  initialize(ctx: Context): Result<boolean, TransporttErr> {
    // For an intiator type of transport, stream won't be set
    // So, initialize it
    if (!this.stream) {
      /// debug("Connecting")
      const client = new MessageSocket(new Socket())
      const connection = client.connect(this.peer)
      this.stream = connection
    }
    return Ok(true)
  }
  static new_pair(router_handle: TcpRouterHandle, peer: SocketAddress, hostnames: String[], stream?: MessageSocket): Result<NewPairResponse, TransporttErr> {
    const tx_address = "TcpSendWorker_tx_addr"
    const int_addr = "TcpSendWorker_int_addr"
    const tcp_send_worker = new TcpSendWorker(router_handle, peer, int_addr, stream)
    return Ok({
      tcp_send_worker,
      worker_pair: new WorkerPair(
        hostnames,
        peer,
        tx_address
      )
    })
  }
  // static start_pair(peer: SocketAddress, hostnames: String[], stream?: MessageSocket):  {
    // rx_addr =
  // }
  handleMessage(context: Context, message: Message) {

  }
}
