import { type Address } from "@ockam/ockam/src/routing"
import { type Result } from "ts-results"

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
  | Result<void, any>
  | Result<Address, any>
  | Result<void, any>
  | Result<void, any>
