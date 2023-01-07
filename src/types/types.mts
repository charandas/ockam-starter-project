import {
  type Message,
  type Address,
  type uint8,
} from "@ockam/ockam/src/routing"

export type TransportMessage = Message

export type LocalInfo = {
  type_identifier: String
  data: uint8[]
}

export type LocalMessage = {
  transport_message: TransportMessage
  local_info: LocalInfo[]
}

export type Routed<Message> = {
  // The wrapped message.
  inner: Message
  // The address of the wrapped message.
  msg_addr: Address
  // A `LocalMessage` that contains routing information for the wrapped message.
  local_msg: LocalMessage
}
