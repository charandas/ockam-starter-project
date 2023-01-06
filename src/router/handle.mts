import { type Address } from "@ockam/ockam/src/routing";
import { type Context } from "@ockam/ockam/src/worker";
import { type SocketAddress } from "net";

import { type Result, Ok } from "ts-results";

export interface TcpRouterHandle {
    bind(addr: SocketAddress): Result<SocketAddress, any>
}

export class TcpRouterHandleImpl implements TcpRouterHandle {
    readonly ctx: Context
    readonly main_addr: Address
    readonly api_addr: Address

    constructor(ctx: Context, main_addr: Address, api_addr: Address) {
        this.ctx = ctx
        this.main_addr = main_addr;
        this.api_addr = api_addr;
    }

    bind(addr: SocketAddress): Result<SocketAddress, any> {
        return Ok(addr)
    }
}
