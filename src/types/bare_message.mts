import * as bare from "@bare-ts/lib"

const config = /* @__PURE__ */ bare.Config({})

export type u8 = number

export type AddressType = u8

export function readAddressType(bc: bare.ByteCursor): AddressType {
    return bare.readU8(bc)
}

export function writeAddressType(bc: bare.ByteCursor, x: AddressType): void {
    bare.writeU8(bc, x)
}

function read0(bc: bare.ByteCursor): readonly ({
    readonly type: AddressType
    readonly value: string
})[] {
    const len = bare.readUintSafe(bc)
    if (len === 0) return []
    const result = [{
        type: readAddressType(bc),
        value: bare.readString(bc),
    }]
    for (let i = 1; i < len; i++) {
        result[i] = {
            type: readAddressType(bc),
            value: bare.readString(bc),
        }
    }
    return result
}

function write0(bc: bare.ByteCursor, x: readonly ({
    readonly type: AddressType
    readonly value: string
})[]): void {
    bare.writeUintSafe(bc, x.length)
    for (let i = 0; i < x.length; i++) {
        {
            writeAddressType(bc, x[i].type)
            bare.writeString(bc, x[i].value)
        }
    }
}

export type Address =
    | { readonly tag: 0; readonly val: string }
    | { readonly tag: 1; readonly val: Uint8Array }
    | { readonly tag: 2; readonly val: readonly ({
        readonly type: AddressType
        readonly value: string
    })[] }

export function readAddress(bc: bare.ByteCursor): Address {
    const offset = bc.offset
    const tag = bare.readU8(bc)
    switch (tag) {
        case 0:
            return { tag, val: bare.readString(bc) }
        case 1:
            return { tag, val: bare.readU8Array(bc) }
        case 2:
            return { tag, val: read0(bc) }
        default: {
            bc.offset = offset
            throw new bare.BareError(offset, "invalid tag")
        }
    }
}

export function writeAddress(bc: bare.ByteCursor, x: Address): void {
    bare.writeU8(bc, x.tag)
    switch (x.tag) {
        case 0:
            bare.writeString(bc, x.val)
            break
        case 1:
            bare.writeU8Array(bc, x.val)
            break
        case 2:
            write0(bc, x.val)
            break
    }
}

export type Route = readonly Address[]

export function readRoute(bc: bare.ByteCursor): Route {
    const len = bare.readUintSafe(bc)
    if (len === 0) return []
    const result = [readAddress(bc)]
    for (let i = 1; i < len; i++) {
        result[i] = readAddress(bc)
    }
    return result
}

export function writeRoute(bc: bare.ByteCursor, x: Route): void {
    bare.writeUintSafe(bc, x.length)
    for (let i = 0; i < x.length; i++) {
        writeAddress(bc, x[i])
    }
}

export interface TransportMessage {
    readonly onwardRoute: Route
    readonly returnRoute: Route
    readonly payload: Uint8Array
}

export function readTransportMessage(bc: bare.ByteCursor): TransportMessage {
    return {
        onwardRoute: readRoute(bc),
        returnRoute: readRoute(bc),
        payload: bare.readU8Array(bc),
    }
}

export function writeTransportMessage(bc: bare.ByteCursor, x: TransportMessage): void {
    writeRoute(bc, x.onwardRoute)
    writeRoute(bc, x.returnRoute)
    bare.writeU8Array(bc, x.payload)
}

export function encodeTransportMessage(x: TransportMessage): Uint8Array {
    const bc = new bare.ByteCursor(
        new Uint8Array(config.initialBufferLength),
        config
    )
    writeTransportMessage(bc, x)
    return new Uint8Array(bc.view.buffer, bc.view.byteOffset, bc.offset)
}

export function decodeTransportMessage(bytes: Uint8Array): TransportMessage {
    const bc = new bare.ByteCursor(bytes, config)
    const result = readTransportMessage(bc)
    if (bc.offset < bc.view.byteLength) {
        throw new bare.BareError(bc.offset, "remaining bytes")
    }
    return result
}
