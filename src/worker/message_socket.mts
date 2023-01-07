// Inspired by https://github.com/bmancini55/node-playpen/blob/master/custom-socket/json-socket.js
// MIT License

import { Socket, type SocketAddress } from "net"
import { Duplex } from "stream"

import * as bare from "@bare-ts/lib"
import { type TransportMessage, encodeTransportMessage, decodeTransportMessage } from "../types/bare_message.mjs"

type GenericCallback = () => void

const config = /* @__PURE__ */ bare.Config({})

export class MessageSocket extends Duplex {
  /**
    True when read buffer is full and calls to `push` return false.
    Additionally data will not be read off the socket until the user
    calls `read`.
    @private
    @type {boolean}
    */
  _readingPaused = false
  /**
  The underlying TCP Socket
  @private
  @type {Socket}
  */
  _socket: Socket

  /**
   MessageSocket implements a basic wire-protocol that encodes/decodes
   JavaScripts objects as JSON strings over the wire. The wire protocol
   is defined as:

    4   len  - length of JSON body
    len body - the JSON body encoded with minimal whitespacing

   MessageSocket operates in object mode where calls to `read` and `write`
   operate on JavaScript objects ißnstead of Buffers.

   @param {Socket} socket
   */
  constructor(socket: Socket) {
    if (!socket) {
      throw new Error("no socket provided to the wrapper implementation")
    }
    super({ objectMode: true })
    // wrap the socket
    this._socket = this._wrapSocket(socket)
  }

  /**
    Connect to a MessageSocket server.
    @param {SocketAddress} addr
    @return {MessageSocket}
   */
  connect(addr: SocketAddress) {
    this._wrapSocket(new Socket())
    this._socket.connect(addr.port, addr.address)
    return this
  }

  /**
    Wraps a standard TCP Socket by binding to all events and either
    rebroadcasting those events or performing custom functionality.

    @private
    @param {Socket} socket
   */
  _wrapSocket(socket: Socket): Socket {
    socket.on("close", (hadError) => this.emit("close", hadError))
    socket.on("connect", () => this.emit("connect"))
    socket.on("drain", () => this.emit("drain"))
    socket.on("end", () => this.emit("end"))
    socket.on("error", (err) => this.emit("error", err))
    socket.on("lookup", (err, address, family, host) =>
      this.emit("lookup", err, address, family, host),
    ) // prettier-ignore
    socket.on("ready", () => this.emit("ready"))
    socket.on("timeout", () => this.emit("timeout"))
    socket.on("readable", this._onReadable.bind(this))
    return socket
  }

  /**
    Performs data read events which are triggered under two conditions:
    1. underlying `readable` events emitted when there is new data
       available on the socket
    2. the consumer requested additional data
    @private
   */
  _onReadable() {
    // Read all the data until one of two conditions is met
    // 1. there is nothing left to read on the socket
    // 2. reading is paused because the consumer is slow
    while (!this._readingPaused) {
      // First step is reading the 64-bit integer from the socket
      // and if there is not a value, we simply abort processing
      let lenBuf = this._socket.read(8)
      if (!lenBuf) return

      // Now that we have a length buffer we can convert it
      // into a number by reading the UInt32BE value
      // from the buffer.
      let lengthBC = new bare.ByteCursor(lenBuf, config)
      const len64 = bare.readU64(lengthBC)

      // ensure that we don't exceed the max size of 256KiB
      if (len64 > 2 ** 18) {
        this._socket.destroy(new Error("Max length exceeded"))
        return
      }

      // TODO: this makes node.js APIs happier below but we lose if BigInt is truly what the size needs
      const len = Number(len64)

      // With the length, we can then consume the rest of the body.
      let body = this._socket.read(len)

      // If we did not have enough data on the wire to read the body
      // we will wait for the body to arrive and push the length
      // back into the socket's read buffer with unshift.
      if (!body) {
        this._socket.unshift(lenBuf)
        return
      }

      // Try to parse the data
      const transportMessage = decodeTransportMessage(body)

      // Push the data into the read buffer and capture whether
      // we are hitting the back pressure limits
      let pushOk = this.push(transportMessage)

      // When the push fails, we need to pause the ability to read
      // messages because the consumer is getting backed up.
      if (!pushOk) this._readingPaused = true
    }
  }

  /**
    Implements the readable stream method `_read`. This method will
    flagged that reading is no longer paused since this method should
    only be called by a consumer reading data.
    @private
   */
  _read() {
    this._readingPaused = false
    setImmediate(this._onReadable.bind(this))
  }

  /**
    Implements the writeable stream method `_write` by serializing
    the object and pushing the data to the underlying socket.
   */
  _write(message: TransportMessage, _encoding: String, cb: GenericCallback) {
    let serializedMessage = encodeTransportMessage(message)
    let length = 8n + BigInt(serializedMessage.length)
    let buffer = Buffer.alloc(Number(length)) // Coercion to make node APIs happy, but dangerous nonetheless

    const bc = new bare.ByteCursor(buffer, config)
    bare.writeU64(bc, length)
    bare.writeData(bc, serializedMessage)

    const concatenated = bare.readData(bc)
    this._socket.write(new Uint8Array(concatenated), cb)
  }

  /**
    Implements the writeable stream method `_final` used when
    .end() is called to write the final data to the stream.
   */
  _final(cb: GenericCallback) {
    this._socket.end(cb)
  }
}
