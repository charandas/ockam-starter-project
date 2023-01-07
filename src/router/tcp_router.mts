import { type Address } from "@ockam/ockam/src/routing"
import { type Context } from "@ockam/ockam/src/worker"

import { type Result, Ok } from "ts-results"

import { type SocketAddress } from "net"

import { type TcpRouterHandle, TcpRouterHandleImpl } from "./handle.mjs"
import { TransportMessage, type LocalMessage, type Routed } from "../types/types.mjs"
import { TransporttErr } from "../types/errors.mjs"

export interface TcpRouter {
  register(ctx: Context): Result<TcpRouterHandle, TransporttErr>
  handle_register(accepts: Address[], self_addr: Address): Result<void, TransporttErr>
  handle_unregister(self_addr: Address): Result<void, TransporttErr>
  handle_connect(peer: String): Result<Address, TransporttErr>
  handle_disconnect(peer: String): Result<void, TransporttErr>
  handle_route(ctx: Context, msg: LocalMessage): Result<void, TransporttErr>
  resolve_route(onward: Address): Result<Address, TransporttErr>
  // worker trait
  initialize(ctx: Context): Result<void, TransporttErr>
  handle_message(ctx: Context, msg: Routed<TransportMessage>): Result<void, TransporttErr>
  // create_self_handle
}

export class TcpRouterImpl implements TcpRouter {
  readonly main_addr: Address
  readonly api_addr: Address
  readonly allow_auto_connection: boolean

  map: Map<Address, Address> = new Map()
  ctx?: Context

  constructor(
    main_addr: Address,
    api_addr: Address,
    allow_auto_connection: boolean,
  ) {
    this.main_addr = main_addr
    this.api_addr = api_addr
    this.allow_auto_connection = allow_auto_connection
  }

  register(ctx: Context): Result<TcpRouterHandle, TransporttErr> {
    this.ctx = ctx

    const handle = new TcpRouterHandleImpl(ctx, this.main_addr, this.api_addr)
    return Ok(handle)
  }

  resolve_peer(peer: String): Result<[SocketAddress, String[]], TransporttErr> {

  }
}
