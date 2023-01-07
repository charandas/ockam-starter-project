import { type Address } from "@ockam/ockam/src/routing"
import { type Context } from "@ockam/ockam/src/worker"
import { type SocketAddress } from "net"

import { type Result, Ok } from "ts-results"

import { TransporttErr } from "../types/errors.mjs"
import { NewPairResponse } from "../worker/sender.mjs"

export interface TcpRouterHandle {
  bind(addr: SocketAddress): Result<SocketAddress, TransporttErr>
  register(pair: NewPairResponse): Result<boolean, TransporttErr>
}

export class TcpRouterHandleImpl implements TcpRouterHandle {
  readonly ctx: Context
  readonly main_addr: Address
  readonly api_addr: Address

  constructor(ctx: Context, main_addr: Address, api_addr: Address) {
    this.ctx = ctx
    this.main_addr = main_addr
    this.api_addr = api_addr
  }

  bind(addr: SocketAddress): Result<SocketAddress, TransporttErr> {
    return Ok(addr)
  }

  register(pair: NewPairResponse): Result<boolean, TransporttErr> {
    return Ok(false)
    // send a request to the TcpRouter with { accepts, self_addr } set
  }
}
