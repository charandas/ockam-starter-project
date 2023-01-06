import { type Address } from "@ockam/ockam/src/routing";
import { type Context } from "@ockam/ockam/src/worker";

import { type Result, Ok } from "ts-results";

import { TcpRouterHandle, TcpRouterHandleImpl } from "./handle.mjs";

export interface TcpRouter {
  register(ctx: Context): Result<TcpRouterHandle, any>
}

export class TcpRouterImpl implements TcpRouter {
  readonly main_addr: Address;
  readonly api_addr: Address;
  readonly allow_auto_connection: boolean;

  map: Map<Address, Address> = new Map();
  ctx?: Context;

  constructor(
    main_addr: Address,
    api_addr: Address,
    allow_auto_connection: boolean
  ) {
    this.main_addr = main_addr;
    this.api_addr = api_addr;
    this.allow_auto_connection = allow_auto_connection;
  }

  register(ctx: Context): Result<TcpRouterHandle, any> {
    this.ctx = ctx

    const handle = new TcpRouterHandleImpl(ctx, this.main_addr, this.api_addr)
    return Ok(handle)
  }
}
