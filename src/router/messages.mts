import { type Address } from "@ockam/ockam/src/routing"
import { type Result } from "ts-results"
import { TransporttErr } from "../types/errors.mjs"

interface TcpRouterRegisterRequest {
  accepts: Address[]
  self_addr: Address
}

interface TcpRouterConnectRequest {
  peer: String
}

interface TcpRouterDisconnectRequest {
  peer: String
}

interface TcpRouterUnregisterRequest {
  self_addr: Address
}

export type TcpRequestRequest =
  | TcpRouterRegisterRequest
  | TcpRouterConnectRequest
  | TcpRouterDisconnectRequest
  | TcpRouterUnregisterRequest

export type TcpRouterResponse =
  | Result<void, TransporttErr>
  | Result<Address, TransporttErr>
  | Result<void, TransporttErr>
  | Result<void, TransporttErr>
